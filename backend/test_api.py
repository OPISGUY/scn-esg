"""
Quick API test script to verify Phase 2 functionality
Run with: python test_api.py
"""
import requests
import json

BASE_URL = 'http://127.0.0.1:8000/api/v1'

def test_auth():
    """Test authentication"""
    print("🔐 Testing Authentication...")
    
    # Login
    response = requests.post(f'{BASE_URL}/auth/login/', {
        'username': 'testuser',
        'password': 'testpass123'
    })
    
    if response.status_code == 200:
        token_data = response.json()
        print(f"✅ Login successful! Access token received.")
        return token_data['access']
    else:
        print(f"❌ Login failed: {response.status_code}")
        return None

def test_endpoints(token):
    """Test various API endpoints"""
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n📊 Testing Analytics Endpoints...")
    
    # Dashboard analytics
    response = requests.get(f'{BASE_URL}/analytics/dashboard/', headers=headers)
    if response.status_code == 200:
        print("✅ Dashboard analytics working")
    else:
        print(f"❌ Dashboard analytics failed: {response.status_code}")
    
    # Carbon balance
    response = requests.get(f'{BASE_URL}/carbon/footprints/carbon_balance/', headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Carbon balance: {data['neutrality_percentage']:.1f}% carbon neutral")
    else:
        print(f"❌ Carbon balance failed: {response.status_code}")
    
    # E-waste stats
    response = requests.get(f'{BASE_URL}/ewaste/company_stats/', headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ E-waste stats: {data['summary']['total_devices_donated']} devices donated")
    else:
        print(f"❌ E-waste stats failed: {response.status_code}")
    
    # Carbon offsets marketplace
    response = requests.get(f'{BASE_URL}/carbon/offsets/', headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Carbon offsets: {len(data['results']) if 'results' in data else len(data)} offsets available")
    else:
        print(f"❌ Carbon offsets failed: {response.status_code}")

def test_calculations(token):
    """Test calculation endpoints"""
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("\n🧮 Testing Calculation Endpoints...")
    
    # Test carbon footprint calculation
    calc_data = {
        'industry': 'technology',
        'employees': 150,
        'scope1_emissions': 25.5,
        'scope2_emissions': 45.0,
        'scope3_emissions': 120.0
    }
    
    response = requests.post(f'{BASE_URL}/carbon/footprints/calculate/', 
                           json=calc_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Carbon calculation: {data['total_emissions']} tCO2e total")
    else:
        print(f"❌ Carbon calculation failed: {response.status_code}")
    
    # Test e-waste impact calculation
    ewaste_data = {
        'device_type': 'laptop',
        'quantity': 10,
        'weight_kg': 25.0
    }
    
    response = requests.post(f'{BASE_URL}/ewaste/calculate_impact/', 
                           json=ewaste_data, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ E-waste impact: {data['estimated_co2_saved']} kg CO2 saved")
    else:
        print(f"❌ E-waste impact failed: {response.status_code}")

if __name__ == '__main__':
    print("🚀 SCN ESG Platform API Test")
    print("=" * 40)
    
    token = test_auth()
    if token:
        test_endpoints(token)
        test_calculations(token)
        print("\n🎉 Phase 2 API testing complete!")
    else:
        print("\n❌ Authentication failed. Make sure the server is running and test data exists.")
