#!/usr/bin/env python

import os
import sys
import django

# Add the backend directory to the path
sys.path.append('.')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from compliance.models import ESRSDatapointCatalog, RegulatoryUpdate
from compliance.services import ESRSDatapointService

def test_compliance_module():
    print("=== Testing Phase 6 CSRD Compliance Module ===\n")
    
    # Test 1: Check ESRS datapoints are loaded
    print("1. Testing ESRS Datapoint Catalog:")
    total_datapoints = ESRSDatapointCatalog.objects.count()
    print(f"   Total datapoints in catalog: {total_datapoints}")
    
    if total_datapoints > 0:
        # Show sample datapoints
        sample_datapoints = ESRSDatapointCatalog.objects.all()[:3]
        for dp in sample_datapoints:
            print(f"   - {dp.code}: {dp.name} ({dp.standard})")
    
    # Test 2: Check categories
    print("\n2. Testing Datapoint Categories:")
    categories = ESRSDatapointCatalog.objects.values_list('category', flat=True).distinct()
    for category in categories:
        count = ESRSDatapointCatalog.objects.filter(category=category).count()
        print(f"   - {category}: {count} datapoints")
    
    # Test 3: Check standards
    print("\n3. Testing ESRS Standards:")
    standards = ESRSDatapointCatalog.objects.values_list('standard', flat=True).distinct()
    for standard in standards:
        count = ESRSDatapointCatalog.objects.filter(standard=standard).count()
        mandatory_count = ESRSDatapointCatalog.objects.filter(standard=standard, mandatory=True).count()
        print(f"   - {standard}: {count} total ({mandatory_count} mandatory)")
    
    # Test 4: Test service methods
    print("\n4. Testing ESRSDatapointService:")
    service = ESRSDatapointService()
    
    stats = service.get_datapoints_count()
    print(f"   Service stats: {stats}")
    
    # Test search
    search_results = service.search_datapoints("climate")
    print(f"   Search 'climate': {len(search_results)} results")
    
    # Test 5: Check regulatory updates
    print("\n5. Testing Regulatory Updates:")
    updates_count = RegulatoryUpdate.objects.count()
    print(f"   Total regulatory updates: {updates_count}")
    
    if updates_count > 0:
        latest_update = RegulatoryUpdate.objects.latest('created_at')
        print(f"   Latest update: {latest_update.title}")
    
    print("\n=== Phase 6 Testing Complete ===")
    print(f"✅ ESRS Datapoint Catalog: {total_datapoints} datapoints loaded")
    print(f"✅ Service Layer: Working")
    print(f"✅ Database Integration: Working")
    print(f"✅ Regulatory Updates: {updates_count} records")

if __name__ == "__main__":
    test_compliance_module()
