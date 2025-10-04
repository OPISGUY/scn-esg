from rest_framework import serializers
from .models import ImportSource, ImportJob, ImportFieldMapping, ImportedRecord
from django.contrib.auth import get_user_model

User = get_user_model()


class ImportSourceSerializer(serializers.ModelSerializer):
    """Serializer for ImportSource model"""
    
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)
    
    class Meta:
        model = ImportSource
        fields = [
            'id', 'name', 'source_type', 'source_type_display',
            'description', 'is_active', 'configuration', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'configuration': {'write_only': True}  # Don't expose API keys
        }


class ImportJobSerializer(serializers.ModelSerializer):
    """Serializer for ImportJob model"""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True, allow_null=True)
    source_name = serializers.CharField(source='source.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    progress_percentage = serializers.IntegerField(read_only=True)
    success_rate = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ImportJob
        fields = [
            'id', 'user', 'user_email', 'company', 'company_name',
            'source', 'source_name', 'name', 'data_type', 'data_type_display',
            'status', 'status_display', 'file', 'file_name', 'file_size', 'file_type',
            'total_rows', 'processed_rows', 'successful_rows', 'failed_rows',
            'progress_percentage', 'success_rate', 'field_mapping',
            'validation_errors', 'import_errors', 'import_settings',
            'created_at', 'started_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'user', 'user_email', 'company_name', 'source_name',
            'file_size', 'status_display', 'data_type_display',
            'processed_rows', 'successful_rows', 'failed_rows',
            'progress_percentage', 'success_rate', 'validation_errors',
            'import_errors', 'created_at', 'started_at', 'completed_at'
        ]


class ImportJobCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating import jobs"""
    
    class Meta:
        model = ImportJob
        fields = [
            'name', 'data_type', 'file', 'source', 'import_settings'
        ]
    
    def validate_file(self, value):
        """Validate uploaded file"""
        if value:
            # Check file size (max 50MB)
            if value.size > 50 * 1024 * 1024:
                raise serializers.ValidationError("File size cannot exceed 50MB")
            
            # Check file type
            file_extension = value.name.split('.')[-1].lower()
            allowed_extensions = ['csv', 'xlsx', 'xls', 'json']
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
                )
        
        return value
    
    def create(self, validated_data):
        """Create import job with metadata"""
        user = self.context['request'].user
        file = validated_data.get('file')
        
        # Set file metadata
        if file:
            validated_data['file_name'] = file.name
            validated_data['file_size'] = file.size
            validated_data['file_type'] = file.name.split('.')[-1].lower()
        
        # Set user and company
        validated_data['user'] = user
        if user.company:
            validated_data['company'] = user.company
        
        return super().create(validated_data)


class ImportFieldMappingSerializer(serializers.ModelSerializer):
    """Serializer for ImportFieldMapping model"""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    
    class Meta:
        model = ImportFieldMapping
        fields = [
            'id', 'user', 'user_email', 'name', 'data_type', 'data_type_display',
            'mapping', 'is_default', 'use_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_email', 'use_count', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create field mapping for current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ImportedRecordSerializer(serializers.ModelSerializer):
    """Serializer for ImportedRecord model"""
    
    class Meta:
        model = ImportedRecord
        fields = [
            'id', 'job', 'row_number', 'source_data',
            'is_successful', 'error_message', 'imported_at'
        ]
        read_only_fields = ['id', 'imported_at']


class FilePreviewSerializer(serializers.Serializer):
    """Serializer for file preview response"""
    
    headers = serializers.ListField(child=serializers.CharField())
    sample_rows = serializers.ListField(child=serializers.DictField())
    total_rows = serializers.IntegerField()
    detected_types = serializers.DictField()
    suggested_mapping = serializers.DictField()
