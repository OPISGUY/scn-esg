#!/usr/bin/env python
"""
Test script to verify the data import functionality.
Tests: file preview, field mapping suggestions, and import execution.
"""

import os
import sys
import json
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company
from data_import.services import FileParser, DataTypeDetector, FieldMappingSuggester, DataValidator

User = get_user_model()

def test_file_parsing():
    """Test CSV file parsing"""
    print("\n" + "="*60)
    print("TEST 1: File Parsing")
    print("="*60)
    
    test_file = "test_carbon_data.csv"
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return False
    
    try:
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        parser = FileParser()
        with open(test_file, 'rb') as f:
            file_data = f.read()
        
        uploaded_file = SimpleUploadedFile(test_file, file_data, content_type='text/csv')
        headers, sample_rows, total_rows = parser.parse_file(uploaded_file)
        result = {'headers': headers, 'sample_rows': sample_rows, 'total_rows': total_rows}
        
        print(f"✅ File parsed successfully")
        print(f"   - Headers: {result['headers']}")
        print(f"   - Total rows: {result['total_rows']}")
        print(f"   - Sample rows: {len(result['sample_rows'])}")
        
        # Show first sample row
        if result['sample_rows']:
            print(f"\n   First row data:")
            for key, value in result['sample_rows'][0].items():
                print(f"     {key}: {value}")
        
        return True
    except Exception as e:
        print(f"❌ File parsing failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_data_type_detection():
    """Test data type detection"""
    print("\n" + "="*60)
    print("TEST 2: Data Type Detection")
    print("="*60)
    
    test_file = "test_carbon_data.csv"
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return False
    
    try:
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        parser = FileParser()
        with open(test_file, 'rb') as f:
            file_data = f.read()
        
        uploaded_file = SimpleUploadedFile(test_file, file_data, content_type='text/csv')
        headers, sample_rows, total_rows = parser.parse_file(uploaded_file)
        detector = DataTypeDetector()
        detected_types = detector.detect_types(headers, sample_rows)
        
        print(f"✅ Data types detected:")
        for field, dtype in detected_types.items():
            print(f"   - {field}: {dtype}")
        
        return True
    except Exception as e:
        print(f"❌ Data type detection failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_field_mapping_suggestions():
    """Test field mapping suggestions"""
    print("\n" + "="*60)
    print("TEST 3: Field Mapping Suggestions")
    print("="*60)
    
    test_file = "test_carbon_data.csv"
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return False
    
    try:
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        parser = FileParser()
        with open(test_file, 'rb') as f:
            file_data = f.read()
        
        uploaded_file = SimpleUploadedFile(test_file, file_data, content_type='text/csv')
        headers, sample_rows, total_rows = parser.parse_file(uploaded_file)
        suggester = FieldMappingSuggester()
        suggested_mapping = suggester.suggest_mapping(headers, 'carbon')
        
        print(f"✅ Field mapping suggestions:")
        for source_field, target_field in suggested_mapping.items():
            print(f"   - {source_field} → {target_field}")
        
        return True
    except Exception as e:
        print(f"❌ Field mapping suggestion failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_data_validation():
    """Test data validation"""
    print("\n" + "="*60)
    print("TEST 4: Data Validation")
    print("="*60)
    
    test_file = "test_carbon_data.csv"
    if not os.path.exists(test_file):
        print(f"❌ Test file not found: {test_file}")
        return False
    
    try:
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        parser = FileParser()
        with open(test_file, 'rb') as f:
            file_data = f.read()
        
        uploaded_file = SimpleUploadedFile(test_file, file_data, content_type='text/csv')
        headers, sample_rows, total_rows = parser.parse_file(uploaded_file)
        suggester = FieldMappingSuggester()
        field_mapping = suggester.suggest_mapping(headers, 'carbon')
        
        validator = DataValidator()
        
        # Validate first few rows
        valid_count = 0
        invalid_count = 0
        
        for idx, row in enumerate(sample_rows[:3]):
            is_valid, errors = validator.validate_row(row, field_mapping, 'carbon')
            if is_valid:
                valid_count += 1
                print(f"✅ Row {idx + 1}: Valid")
            else:
                invalid_count += 1
                print(f"❌ Row {idx + 1}: Invalid - {errors}")
        
        print(f"\nValidation summary: {valid_count} valid, {invalid_count} invalid")
        return True
    except Exception as e:
        print(f"❌ Data validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_database_models():
    """Test database models and relationships"""
    print("\n" + "="*60)
    print("TEST 5: Database Models")
    print("="*60)
    
    try:
        from data_import.models import ImportSource, ImportJob, ImportFieldMapping, ImportedRecord
        
        # Get or create demo user and company
        user = User.objects.filter(email='demo@scn.com').first()
        if not user:
            print("❌ Demo user not found. Please run migrations first.")
            return False
        
        company = user.company
        if not company:
            print("❌ Demo company not found.")
            return False
        
        # Create test import source
        source, created = ImportSource.objects.get_or_create(
            name="CSV File Import",
            source_type="file",
            description="Test CSV import source"
        )
        print(f"✅ Import source: {source.name} ({'created' if created else 'existing'})")
        
        # Create test import job
        job = ImportJob.objects.create(
            user=user,
            company=company,
            source=source,
            name="Test Import Job",
            data_type="carbon",
            status="pending",
            file_name="test_carbon_data.csv",
            total_rows=8
        )
        print(f"✅ Import job created: {job.name} (ID: {job.id})")
        
        # Create test field mapping
        mapping = ImportFieldMapping.objects.create(
            user=user,
            name="Carbon Data Mapping",
            data_type="carbon",
            mapping={
                "Date": "date",
                "Amount": "amount",
                "Category": "category",
                "Description": "description",
                "Organization": "organization"
            }
        )
        print(f"✅ Field mapping created: {mapping.name} (ID: {mapping.id})")
        
        # Clean up test data
        job.delete()
        mapping.delete()
        if created:
            source.delete()
        
        print("\n✅ All database models working correctly")
        return True
    except Exception as e:
        print(f"❌ Database model test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("DATA IMPORT FUNCTIONALITY TEST SUITE")
    print("="*60)
    
    tests = [
        ("File Parsing", test_file_parsing),
        ("Data Type Detection", test_data_type_detection),
        ("Field Mapping Suggestions", test_field_mapping_suggestions),
        ("Data Validation", test_data_validation),
        ("Database Models", test_database_models),
    ]
    
    results = {}
    for test_name, test_func in tests:
        results[test_name] = test_func()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Import functionality is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
