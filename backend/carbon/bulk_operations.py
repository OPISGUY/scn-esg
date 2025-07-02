"""
Bulk operations for carbon data import/export
"""
import pandas as pd
from io import BytesIO
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import CarbonFootprint, CarbonOffset
from .serializers import CarbonFootprintSerializer, CarbonOffsetSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_import_carbon_footprints(request):
    """
    Bulk import carbon footprint data from CSV/Excel file
    """
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Read the file based on extension
        if file.name.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return Response(
                {'error': 'Unsupported file format. Use CSV or Excel files.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate required columns
        required_columns = ['date', 'scope_1_emissions', 'scope_2_emissions', 'scope_3_emissions']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return Response(
                {'error': f'Missing required columns: {", ".join(missing_columns)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process and validate data
        created_records = []
        errors = []
        
        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    # Convert date format
                    date = pd.to_datetime(row['date']).date()
                    
                    footprint_data = {
                        'company': request.user.company.id,
                        'date': date,
                        'scope_1_emissions': float(row['scope_1_emissions']),
                        'scope_2_emissions': float(row['scope_2_emissions']),
                        'scope_3_emissions': float(row['scope_3_emissions']),
                        'energy_consumption': float(row.get('energy_consumption', 0)),
                        'renewable_energy_percentage': float(row.get('renewable_energy_percentage', 0)),
                        'waste_generated': float(row.get('waste_generated', 0)),
                        'water_consumption': float(row.get('water_consumption', 0)),
                    }
                    
                    serializer = CarbonFootprintSerializer(data=footprint_data)
                    if serializer.is_valid():
                        footprint = serializer.save()
                        created_records.append(footprint.id)
                    else:
                        errors.append(f'Row {index + 1}: {serializer.errors}')
                        
                except Exception as e:
                    errors.append(f'Row {index + 1}: {str(e)}')
            
            if errors and not created_records:
                # If all records failed, rollback transaction
                transaction.set_rollback(True)
                return Response(
                    {'error': 'Import failed', 'details': errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({
            'message': f'Successfully imported {len(created_records)} records',
            'created_records': created_records,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Import failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_carbon_footprints(request):
    """
    Export carbon footprint data to Excel
    """
    try:
        # Get user's company footprints
        footprints = CarbonFootprint.objects.filter(
            company=request.user.company
        ).order_by('-date')
        
        # Convert to DataFrame
        data = []
        for footprint in footprints:
            data.append({
                'Date': footprint.date,
                'Scope 1 Emissions (tCO2e)': footprint.scope_1_emissions,
                'Scope 2 Emissions (tCO2e)': footprint.scope_2_emissions,
                'Scope 3 Emissions (tCO2e)': footprint.scope_3_emissions,
                'Total Emissions (tCO2e)': footprint.total_emissions,
                'Energy Consumption (kWh)': footprint.energy_consumption,
                'Renewable Energy (%)': footprint.renewable_energy_percentage,
                'Waste Generated (kg)': footprint.waste_generated,
                'Water Consumption (L)': footprint.water_consumption,
                'Created At': footprint.created_at,
            })
        
        df = pd.DataFrame(data)
        
        # Create Excel file in memory
        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Carbon Footprints', index=False)
            
            # Add a summary sheet
            summary_data = {
                'Metric': [
                    'Total Records',
                    'Average Total Emissions',
                    'Max Total Emissions',
                    'Min Total Emissions',
                    'Latest Record Date'
                ],
                'Value': [
                    len(footprints),
                    df['Total Emissions (tCO2e)'].mean() if not df.empty else 0,
                    df['Total Emissions (tCO2e)'].max() if not df.empty else 0,
                    df['Total Emissions (tCO2e)'].min() if not df.empty else 0,
                    df['Date'].max() if not df.empty else 'N/A'
                ]
            }
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        buffer.seek(0)
        
        # Create HTTP response
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="carbon_footprints_{request.user.company.name}_{pd.Timestamp.now().strftime("%Y%m%d")}.xlsx"'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Export failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_import_carbon_offsets(request):
    """
    Bulk import carbon offset data from CSV/Excel file
    """
    try:
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Read the file based on extension
        if file.name.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.name.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file)
        else:
            return Response(
                {'error': 'Unsupported file format. Use CSV or Excel files.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate required columns
        required_columns = ['name', 'description', 'price_per_ton', 'total_tons_available', 'project_type']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            return Response(
                {'error': f'Missing required columns: {", ".join(missing_columns)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process and validate data
        created_records = []
        errors = []
        
        with transaction.atomic():
            for index, row in df.iterrows():
                try:
                    offset_data = {
                        'name': row['name'],
                        'description': row['description'],
                        'price_per_ton': float(row['price_per_ton']),
                        'total_tons_available': float(row['total_tons_available']),
                        'project_type': row['project_type'],
                        'location': row.get('location', ''),
                        'certification': row.get('certification', ''),
                        'vintage_year': int(row.get('vintage_year', 2024)),
                        'is_active': bool(row.get('is_active', True)),
                    }
                    
                    serializer = CarbonOffsetSerializer(data=offset_data)
                    if serializer.is_valid():
                        offset = serializer.save()
                        created_records.append(offset.id)
                    else:
                        errors.append(f'Row {index + 1}: {serializer.errors}')
                        
                except Exception as e:
                    errors.append(f'Row {index + 1}: {str(e)}')
            
            if errors and not created_records:
                # If all records failed, rollback transaction
                transaction.set_rollback(True)
                return Response(
                    {'error': 'Import failed', 'details': errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({
            'message': f'Successfully imported {len(created_records)} offsets',
            'created_records': created_records,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Import failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_carbon_offsets(request):
    """
    Export carbon offset data to Excel
    """
    try:
        # Get all active offsets
        offsets = CarbonOffset.objects.filter(is_active=True).order_by('name')
        
        # Convert to DataFrame
        data = []
        for offset in offsets:
            data.append({
                'Name': offset.name,
                'Description': offset.description,
                'Project Type': offset.project_type,
                'Price per Ton ($)': offset.price_per_ton,
                'Total Tons Available': offset.total_tons_available,
                'Tons Sold': offset.tons_sold,
                'Tons Remaining': offset.tons_remaining,
                'Location': offset.location,
                'Certification': offset.certification,
                'Vintage Year': offset.vintage_year,
                'Created At': offset.created_at,
            })
        
        df = pd.DataFrame(data)
        
        # Create Excel file in memory
        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Carbon Offsets', index=False)
        
        buffer.seek(0)
        
        # Create HTTP response
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="carbon_offsets_{pd.Timestamp.now().strftime("%Y%m%d")}.xlsx"'
        
        return response
        
    except Exception as e:
        return Response(
            {'error': f'Export failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
