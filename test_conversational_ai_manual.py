"""
Manual test script for Smart Data Entry conversational AI
Run with: python backend/test_conversational_ai_manual.py
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings_sqlite')
django.setup()

import requests
import json
from django.contrib.auth import get_user_model
from carbon.models import CarbonFootprint, ConversationSession
from companies.models import Company
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Configuration
BASE_URL = 'http://localhost:8000/api/v1/carbon/ai'
TEST_USER_EMAIL = 'test@example.com'
TEST_USER_PASSWORD = 'testpass123'

class Colors:
    """Terminal colors for output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def setup_test_data():
    """Create test user, company, and footprint"""
    print_header("Setting up test data")
    
    # Create or get test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': TEST_USER_EMAIL,
            'is_active': True
        }
    )
    if created:
        user.set_password(TEST_USER_PASSWORD)
        user.save()
        print_success(f"Created test user: {user.username}")
    else:
        print_info(f"Using existing user: {user.username}")
    
    # Create or get company
    company, created = Company.objects.get_or_create(
        name='Test Corporation',
        defaults={
            'industry': 'Manufacturing',
            'employees': 150,
            'annual_revenue': 5000000
        }
    )
    if created:
        print_success(f"Created test company: {company.name}")
    else:
        print_info(f"Using existing company: {company.name}")
    
    # Associate user with company
    if not company.users.filter(id=user.id).exists():
        company.users.add(user)
        print_success("Associated user with company")
    
    # Create or get carbon footprint
    footprint, created = CarbonFootprint.objects.get_or_create(
        company=company,
        reporting_period='2025-Q4',
        defaults={
            'scope1_emissions': 0,
            'scope2_emissions': 0,
            'scope3_emissions': 0
        }
    )
    if created:
        print_success(f"Created test footprint: {footprint.reporting_period}")
    else:
        print_info(f"Using existing footprint: {footprint.reporting_period}")
    
    return user, company, footprint

def get_access_token(user):
    """Get JWT access token for user"""
    print_header("Getting authentication token")
    
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print_success("Generated access token")
    return access_token

def test_extract_electricity(token, footprint_id):
    """Test 1: Extract electricity consumption"""
    print_header("Test 1: Extract Electricity Consumption")
    
    url = f"{BASE_URL}/extract-from-conversation/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'message': 'We used 5000 kWh of electricity last month',
        'conversation_history': [],
        'current_footprint_id': str(footprint_id)
    }
    
    print_info(f"Sending: {data['message']}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        print_success(f"Response received in {result.get('processing_time_ms', 'N/A')}ms")
        print(f"\n{Colors.OKBLUE}AI Response:{Colors.ENDC}")
        print(result.get('ai_response', 'No response'))
        
        if result.get('extracted_data'):
            extracted = result['extracted_data']
            print(f"\n{Colors.OKBLUE}Extracted Data:{Colors.ENDC}")
            print(f"  Activity: {extracted.get('activity_type')}")
            print(f"  Scope: {extracted.get('scope')}")
            print(f"  Quantity: {extracted.get('quantity')} {extracted.get('unit')}")
            print(f"  Emissions: {extracted.get('calculated_emissions')} tCO2e")
            print(f"  Confidence: {extracted.get('confidence')*100:.1f}%")
        
        return result
        
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return None

def test_extract_with_context(token, footprint_id, session_id, conversation_history):
    """Test 2: Extract with conversation context"""
    print_header("Test 2: Extract with Conversation Context")
    
    url = f"{BASE_URL}/extract-from-conversation/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'message': 'Add another 2000 to that',
        'conversation_history': conversation_history,
        'current_footprint_id': str(footprint_id),
        'session_id': session_id
    }
    
    print_info(f"Sending: {data['message']}")
    print_info(f"Context: {len(conversation_history)} previous messages")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        print_success(f"Response received in {result.get('processing_time_ms', 'N/A')}ms")
        print(f"\n{Colors.OKBLUE}AI Response:{Colors.ENDC}")
        print(result.get('ai_response', 'No response'))
        
        if result.get('extracted_data'):
            extracted = result['extracted_data']
            print(f"\n{Colors.OKBLUE}Extracted Data:{Colors.ENDC}")
            print(f"  Activity: {extracted.get('activity_type')}")
            print(f"  Quantity: {extracted.get('quantity')} {extracted.get('unit')}")
            print(f"  Emissions: {extracted.get('calculated_emissions')} tCO2e")
        
        return result
        
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return None

def test_extract_fuel(token, footprint_id, session_id):
    """Test 3: Extract fuel consumption"""
    print_header("Test 3: Extract Fuel Consumption")
    
    url = f"{BASE_URL}/extract-from-conversation/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'message': 'Our delivery trucks used 500 gallons of diesel',
        'conversation_history': [],
        'current_footprint_id': str(footprint_id),
        'session_id': session_id
    }
    
    print_info(f"Sending: {data['message']}")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        print_success(f"Response received in {result.get('processing_time_ms', 'N/A')}ms")
        print(f"\n{Colors.OKBLUE}AI Response:{Colors.ENDC}")
        print(result.get('ai_response', 'No response'))
        
        if result.get('extracted_data'):
            extracted = result['extracted_data']
            print(f"\n{Colors.OKBLUE}Extracted Data:{Colors.ENDC}")
            print(f"  Activity: {extracted.get('activity_type')}")
            print(f"  Scope: {extracted.get('scope')}")
            print(f"  Quantity: {extracted.get('quantity')} {extracted.get('unit')}")
            print(f"  Emissions: {extracted.get('calculated_emissions')} tCO2e")
        
        return result
        
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return None

def test_update_footprint(token, footprint_id, extracted_data, message_id):
    """Test 4: Update footprint with extracted data"""
    print_header("Test 4: Update Carbon Footprint")
    
    if not extracted_data:
        print_error("No extracted data to update")
        return None
    
    url = f"{BASE_URL}/update-with-context/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    scope_field = f"scope{extracted_data['scope']}_emissions"
    
    data = {
        'footprint_id': str(footprint_id),
        'update_data': {
            scope_field: {
                'operation': 'add',
                'value': extracted_data['calculated_emissions'],
                'source': 'conversational_extraction',
                'confidence': extracted_data['confidence'],
                'metadata': {
                    'activity_type': extracted_data['activity_type'],
                    'quantity': extracted_data['quantity'],
                    'unit': extracted_data['unit']
                }
            }
        },
        'conversation_message_id': message_id,
        'user_confirmed': True
    }
    
    print_info(f"Updating {scope_field}: +{extracted_data['calculated_emissions']} tCO2e")
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        
        print_success("Footprint updated successfully")
        
        if result.get('changes'):
            print(f"\n{Colors.OKBLUE}Changes:{Colors.ENDC}")
            for field, change in result['changes'].items():
                print(f"  {field}:")
                print(f"    Previous: {change['previous']} tCO2e")
                print(f"    New: {change['new']} tCO2e")
                print(f"    Change: {change['change']:+.2f} tCO2e")
        
        if result.get('updated_footprint'):
            print(f"\n{Colors.OKBLUE}Updated Footprint:{Colors.ENDC}")
            fp = result['updated_footprint']
            print(f"  Scope 1: {fp['scope1_emissions']} tCO2e")
            print(f"  Scope 2: {fp['scope2_emissions']} tCO2e")
            print(f"  Scope 3: {fp['scope3_emissions']} tCO2e")
            print(f"  Total: {fp['total_emissions']} tCO2e")
        
        return result
        
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return None

def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}Smart Data Entry - Conversational AI Test Suite{Colors.ENDC}")
    print(f"{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    
    # Setup
    user, company, footprint = setup_test_data()
    token = get_access_token(user)
    
    # Test 1: Extract electricity
    result1 = test_extract_electricity(token, footprint.id)
    if not result1:
        print_error("Test 1 failed, stopping")
        return
    
    session_id = result1.get('session_id')
    
    # Build conversation history
    conversation_history = [
        {'role': 'user', 'content': 'We used 5000 kWh of electricity last month'},
        {'role': 'assistant', 'content': result1.get('ai_response', '')}
    ]
    
    # Test 2: Extract with context
    result2 = test_extract_with_context(token, footprint.id, session_id, conversation_history)
    if not result2:
        print_error("Test 2 failed, stopping")
        return
    
    # Test 3: Extract fuel
    result3 = test_extract_fuel(token, footprint.id, session_id)
    if not result3:
        print_error("Test 3 failed, stopping")
        return
    
    # Test 4: Update footprint (using result from test 1)
    if result1.get('extracted_data'):
        result4 = test_update_footprint(
            token,
            footprint.id,
            result1['extracted_data'],
            result1['message_id']
        )
    
    # Summary
    print_header("Test Summary")
    print_success("All tests completed!")
    print_info(f"Session ID: {session_id}")
    print_info(f"Footprint ID: {footprint.id}")
    print_info("Check the database for conversation history and footprint updates")

if __name__ == '__main__':
    main()
