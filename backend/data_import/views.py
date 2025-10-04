from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction

from .models import ImportSource, ImportJob, ImportFieldMapping, ImportedRecord
from .serializers import (
    ImportSourceSerializer, ImportJobSerializer, ImportJobCreateSerializer,
    ImportFieldMappingSerializer, ImportedRecordSerializer, FilePreviewSerializer
)
from .services import FileParser, DataTypeDetector, FieldMappingSuggester, DataValidator
from carbon.models import CarbonFootprint
from ewaste.models import EwasteEntry


class ImportSourceViewSet(viewsets.ReadOnlyModelViewSet):
    """View available import sources"""
    
    queryset = ImportSource.objects.filter(is_active=True)
    serializer_class = ImportSourceSerializer
    permission_classes = [IsAuthenticated]


class ImportJobViewSet(viewsets.ModelViewSet):
    """Manage import jobs"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter jobs by user"""
        user = self.request.user
        if user.is_superuser:
            return ImportJob.objects.all()
        return ImportJob.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Use different serializers for create vs read"""
        if self.action == 'create':
            return ImportJobCreateSerializer
        return ImportJobSerializer
    
    @action(detail=False, methods=['post'])
    def preview(self, request):
        """
        Preview uploaded file and detect structure
        
        POST /api/v1/imports/jobs/preview/
        Body: multipart/form-data with 'file' field
        """
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        data_type = request.data.get('data_type', 'mixed')
        
        try:
            # Parse file
            headers, sample_rows, total_rows = FileParser.parse_file(file)
            
            # Detect data types
            detected_types = DataTypeDetector.detect_types(headers, sample_rows)
            
            # Suggest field mapping
            suggested_mapping = FieldMappingSuggester.suggest_mapping(headers, data_type)
            
            # Prepare response
            preview_data = {
                'headers': headers,
                'sample_rows': sample_rows,
                'total_rows': total_rows,
                'detected_types': detected_types,
                'suggested_mapping': suggested_mapping
            }
            
            serializer = FilePreviewSerializer(preview_data)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to parse file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def execute(self, request, pk=None):
        """
        Execute the import job with provided field mapping
        
        POST /api/v1/imports/jobs/{id}/execute/
        Body: {
            "field_mapping": {"source_col": "target_field", ...}
        }
        """
        job = self.get_object()
        
        if job.status not in ['pending', 'mapping']:
            return Response(
                {'error': f'Cannot execute job in {job.status} status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        field_mapping = request.data.get('field_mapping', {})
        if not field_mapping:
            return Response(
                {'error': 'Field mapping is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update job with mapping
        job.field_mapping = field_mapping
        job.status = 'importing'
        job.started_at = timezone.now()
        job.save()
        
        try:
            # Parse file again for full data
            headers, rows, total_rows = FileParser.parse_file(job.file)
            job.total_rows = total_rows
            job.save()
            
            # Import rows
            successful_count = 0
            failed_count = 0
            
            for idx, row in enumerate(rows, start=1):
                # Validate row
                is_valid, error_msg = DataValidator.validate_row(row, field_mapping, job.data_type)
                
                if not is_valid:
                    # Record failed row
                    ImportedRecord.objects.create(
                        job=job,
                        row_number=idx,
                        source_data=row,
                        is_successful=False,
                        error_message=error_msg
                    )
                    failed_count += 1
                    continue
                
                # Import row
                try:
                    created_obj = self._import_row(job, row, field_mapping)
                    
                    # Record success
                    from django.contrib.contenttypes.models import ContentType
                    ImportedRecord.objects.create(
                        job=job,
                        row_number=idx,
                        source_data=row,
                        is_successful=True,
                        content_type=ContentType.objects.get_for_model(created_obj),
                        object_id=created_obj.id
                    )
                    successful_count += 1
                    
                except Exception as e:
                    # Record failure
                    ImportedRecord.objects.create(
                        job=job,
                        row_number=idx,
                        source_data=row,
                        is_successful=False,
                        error_message=str(e)
                    )
                    failed_count += 1
                
                # Update progress
                job.processed_rows = idx
                job.successful_rows = successful_count
                job.failed_rows = failed_count
                job.save()
            
            # Mark as completed
            job.status = 'completed'
            job.completed_at = timezone.now()
            job.save()
            
            serializer = self.get_serializer(job)
            return Response(serializer.data)
            
        except Exception as e:
            job.status = 'failed'
            job.import_errors = [str(e)]
            job.save()
            
            return Response(
                {'error': f'Import failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _import_row(self, job, row, field_mapping):
        """Import a single row based on data type"""
        import pandas as pd
        
        # Map fields
        mapped_data = {}
        for source_col, target_field in field_mapping.items():
            value = row.get(source_col)
            if value is not None and value != '':
                mapped_data[target_field] = value
        
        # Create record based on data type
        if job.data_type == 'carbon':
            # Parse date
            if 'date' in mapped_data:
                mapped_data['date'] = pd.to_datetime(mapped_data['date']).date()
            
            # Parse amount
            if 'amount' in mapped_data:
                mapped_data['amount'] = float(mapped_data['amount'])
            
            # Create carbon footprint
            # Note: CarbonFootprint uses different structure, adapt as needed
            return CarbonFootprint.objects.create(
                company=job.company,
                reporting_period=f"{mapped_data.get('date', timezone.now().date()).year}-Q1",
                scope1_emissions=mapped_data.get('amount', 0),
                **{k: v for k, v in mapped_data.items() if k not in ['date', 'amount']}
            )
        
        elif job.data_type == 'ewaste':
            # Parse date
            if 'date' in mapped_data:
                mapped_data['date'] = pd.to_datetime(mapped_data['date']).date()
            
            # Parse quantity
            if 'quantity' in mapped_data:
                mapped_data['quantity'] = int(mapped_data['quantity'])
            
            # Create ewaste entry
            return EwasteEntry.objects.create(
                user=job.user,
                company=job.company,
                **mapped_data
            )
        
        else:
            raise ValueError(f"Unsupported data type: {job.data_type}")
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an import job"""
        job = self.get_object()
        
        if job.status in ['completed', 'failed', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel job in {job.status} status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job.status = 'cancelled'
        job.save()
        
        serializer = self.get_serializer(job)
        return Response(serializer.data)


class ImportFieldMappingViewSet(viewsets.ModelViewSet):
    """Manage saved field mappings"""
    
    serializer_class = ImportFieldMappingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter mappings by user"""
        return ImportFieldMapping.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def use(self, request, pk=None):
        """Increment use count when mapping is applied"""
        mapping = self.get_object()
        mapping.use_count += 1
        mapping.save()
        
        serializer = self.get_serializer(mapping)
        return Response(serializer.data)


class ImportedRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """View imported records for a job"""
    
    serializer_class = ImportedRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by job and user"""
        job_id = self.request.query_params.get('job_id')
        queryset = ImportedRecord.objects.all()
        
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        
        # Filter by user's jobs
        user = self.request.user
        if not user.is_superuser:
            queryset = queryset.filter(job__user=user)
        
        return queryset
