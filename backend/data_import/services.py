"""
Data import parsing and processing services
"""
import csv
import json
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Tuple
from django.core.files.uploadedfile import UploadedFile


class FileParser:
    """Parse different file formats for import"""
    
    SUPPORTED_FORMATS = ['csv', 'xlsx', 'xls', 'json']
    
    @staticmethod
    def parse_file(file: UploadedFile) -> Tuple[List[str], List[Dict], int]:
        """
        Parse uploaded file and return headers, rows, and total count
        
        Returns:
            Tuple of (headers, sample_rows, total_rows)
        """
        file_extension = file.name.split('.')[-1].lower()
        
        if file_extension == 'csv':
            return FileParser._parse_csv(file)
        elif file_extension in ['xlsx', 'xls']:
            return FileParser._parse_excel(file)
        elif file_extension == 'json':
            return FileParser._parse_json(file)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    @staticmethod
    def _parse_csv(file: UploadedFile) -> Tuple[List[str], List[Dict], int]:
        """Parse CSV file"""
        file.seek(0)
        content = file.read().decode('utf-8-sig')  # Handle BOM
        lines = content.splitlines()
        
        reader = csv.DictReader(lines)
        headers = reader.fieldnames or []
        
        # Get all rows
        rows = [row for row in reader]
        total_rows = len(rows)
        
        # Return headers, first 10 rows as sample, and total count
        sample_rows = rows[:10]
        
        return headers, sample_rows, total_rows
    
    @staticmethod
    def _parse_excel(file: UploadedFile) -> Tuple[List[str], List[Dict], int]:
        """Parse Excel file"""
        file.seek(0)
        
        # Read Excel file
        df = pd.read_excel(file, engine='openpyxl')
        
        # Get headers
        headers = df.columns.tolist()
        
        # Convert to list of dicts
        rows = df.to_dict('records')
        total_rows = len(rows)
        
        # Clean NaN values
        for row in rows:
            for key, value in row.items():
                if pd.isna(value):
                    row[key] = None
        
        # Return headers, first 10 rows, and total count
        sample_rows = rows[:10]
        
        return headers, sample_rows, total_rows
    
    @staticmethod
    def _parse_json(file: UploadedFile) -> Tuple[List[str], List[Dict], int]:
        """Parse JSON file"""
        file.seek(0)
        content = file.read().decode('utf-8')
        
        data = json.loads(content)
        
        # Handle different JSON structures
        if isinstance(data, list):
            rows = data
        elif isinstance(data, dict):
            # Check if data has a 'records' or 'data' key
            if 'records' in data:
                rows = data['records']
            elif 'data' in data:
                rows = data['data']
            else:
                # Convert single object to list
                rows = [data]
        else:
            raise ValueError("JSON must be an array or object with 'records'/'data' key")
        
        # Get headers from first row
        headers = list(rows[0].keys()) if rows else []
        total_rows = len(rows)
        
        # Return headers, first 10 rows, and total count
        sample_rows = rows[:10]
        
        return headers, sample_rows, total_rows


class DataTypeDetector:
    """Detect data types from sample rows"""
    
    @staticmethod
    def detect_types(headers: List[str], sample_rows: List[Dict]) -> Dict[str, str]:
        """
        Detect the data type for each column
        
        Returns:
            Dict mapping column names to detected types (date, number, text, boolean)
        """
        detected_types = {}
        
        for header in headers:
            detected_type = DataTypeDetector._detect_column_type(header, sample_rows)
            detected_types[header] = detected_type
        
        return detected_types
    
    @staticmethod
    def _detect_column_type(column: str, rows: List[Dict]) -> str:
        """Detect type of a single column"""
        # Get non-null values
        values = [row.get(column) for row in rows if row.get(column) is not None]
        
        if not values:
            return 'text'
        
        # Check for dates
        if DataTypeDetector._is_date_column(values):
            return 'date'
        
        # Check for numbers
        if DataTypeDetector._is_number_column(values):
            return 'number'
        
        # Check for booleans
        if DataTypeDetector._is_boolean_column(values):
            return 'boolean'
        
        # Default to text
        return 'text'
    
    @staticmethod
    def _is_date_column(values: List) -> bool:
        """Check if values look like dates"""
        date_count = 0
        for value in values[:10]:  # Check first 10
            try:
                # Try common date formats
                str_value = str(value)
                if any(sep in str_value for sep in ['-', '/', '.']):
                    pd.to_datetime(str_value)
                    date_count += 1
            except:
                pass
        
        return date_count >= len(values[:10]) * 0.7  # 70% threshold
    
    @staticmethod
    def _is_number_column(values: List) -> bool:
        """Check if values look like numbers"""
        number_count = 0
        for value in values[:10]:
            try:
                float(value)
                number_count += 1
            except:
                pass
        
        return number_count >= len(values[:10]) * 0.7  # 70% threshold
    
    @staticmethod
    def _is_boolean_column(values: List) -> bool:
        """Check if values look like booleans"""
        bool_values = {'true', 'false', 'yes', 'no', '1', '0', 'y', 'n'}
        matches = sum(1 for v in values[:10] if str(v).lower() in bool_values)
        return matches >= len(values[:10]) * 0.7


class FieldMappingSuggester:
    """Suggest field mappings based on column names"""
    
    # Mapping of common column names to model fields
    CARBON_MAPPINGS = {
        # Date fields
        'date': 'date',
        'emission_date': 'date',
        'timestamp': 'date',
        'period': 'date',
        
        # Amount fields
        'amount': 'amount',
        'co2': 'amount',
        'co2_kg': 'amount',
        'emissions': 'amount',
        'carbon': 'amount',
        'ghg': 'amount',
        
        # Category
        'category': 'category',
        'type': 'category',
        'emission_type': 'category',
        'source': 'category',
        
        # Description
        'description': 'description',
        'notes': 'description',
        'details': 'description',
    }
    
    EWASTE_MAPPINGS = {
        # Date fields
        'date': 'date',
        'donation_date': 'date',
        'timestamp': 'date',
        
        # Device
        'device': 'device_type',
        'device_type': 'device_type',
        'item': 'device_type',
        'equipment': 'device_type',
        
        # Quantity
        'quantity': 'quantity',
        'count': 'quantity',
        'number': 'quantity',
        'qty': 'quantity',
        
        # Organization
        'organization': 'organization',
        'recipient': 'organization',
        'charity': 'organization',
        'ngo': 'organization',
        
        # Description
        'description': 'description',
        'notes': 'description',
        'condition': 'description',
    }
    
    @staticmethod
    def suggest_mapping(headers: List[str], data_type: str) -> Dict[str, str]:
        """
        Suggest field mappings for the given headers
        
        Returns:
            Dict mapping source columns to target fields
        """
        if data_type == 'carbon':
            mapping_rules = FieldMappingSuggester.CARBON_MAPPINGS
        elif data_type == 'ewaste':
            mapping_rules = FieldMappingSuggester.EWASTE_MAPPINGS
        else:
            mapping_rules = {}
        
        suggested_mapping = {}
        
        for header in headers:
            # Normalize header
            normalized = header.lower().strip().replace(' ', '_')
            
            # Check for exact match
            if normalized in mapping_rules:
                suggested_mapping[header] = mapping_rules[normalized]
            else:
                # Check for partial match
                for key, value in mapping_rules.items():
                    if key in normalized or normalized in key:
                        suggested_mapping[header] = value
                        break
        
        return suggested_mapping


class DataValidator:
    """Validate imported data"""
    
    @staticmethod
    def validate_row(row: Dict, field_mapping: Dict, data_type: str) -> Tuple[bool, str]:
        """
        Validate a single row of data
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check required fields are present
        if data_type == 'carbon':
            required_fields = ['date', 'amount', 'category']
        elif data_type == 'ewaste':
            required_fields = ['date', 'device_type', 'quantity']
        else:
            required_fields = []
        
        # Check if all required fields are mapped
        mapped_fields = set(field_mapping.values())
        missing_fields = set(required_fields) - mapped_fields
        
        if missing_fields:
            return False, f"Missing required fields: {', '.join(missing_fields)}"
        
        # Validate mapped values
        for source_col, target_field in field_mapping.items():
            value = row.get(source_col)
            
            if value is None or value == '':
                if target_field in required_fields:
                    return False, f"Required field '{target_field}' is empty"
                continue
            
            # Validate based on target field type
            if target_field == 'date':
                if not DataValidator._is_valid_date(value):
                    return False, f"Invalid date format for '{source_col}': {value}"
            
            elif target_field in ['amount', 'quantity']:
                if not DataValidator._is_valid_number(value):
                    return False, f"Invalid number format for '{source_col}': {value}"
        
        return True, ""
    
    @staticmethod
    def _is_valid_date(value) -> bool:
        """Check if value is a valid date"""
        try:
            pd.to_datetime(value)
            return True
        except:
            return False
    
    @staticmethod
    def _is_valid_number(value) -> bool:
        """Check if value is a valid number"""
        try:
            float(value)
            return True
        except:
            return False
