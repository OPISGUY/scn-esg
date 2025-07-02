#!/usr/bin/env python3
"""
Test script for Phase 5 AI-powered features
"""
import os
import sys
import django
import requests
import json
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

# Base URL for API endpoints
BASE_URL = 'http://localhost:8000/api/v1'

class Color:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Color.BOLD}{Color.BLUE}{'='*60}{Color.ENDC}")
    print(f"{Color.BOLD}{Color.BLUE}{text.center(60)}{Color.ENDC}")
    print(f"{Color.BOLD}{Color.BLUE}{'='*60}{Color.ENDC}")

def print_success(text):
    print(f"{Color.GREEN}✓ {text}{Color.ENDC}")

def print_error(text):
    print(f"{Color.RED}✗ {text}{Color.ENDC}")

def print_warning(text):
    print(f"{Color.YELLOW}⚠ {text}{Color.ENDC}")

def print_info(text):
    print(f"{Color.CYAN}ℹ {text}{Color.ENDC}")

def test_ai_service_health():
    """Test AI service health endpoint"""
    print_header("AI SERVICE HEALTH CHECK")
    
    try:
        response = requests.get(f"{BASE_URL}/carbon/ai/health/")
        
        if response.status_code == 200:
            data = response.json()
            print_success("AI Health endpoint accessible")
            print_info(f"AI Features Enabled: {data.get('ai_features_enabled', 'Unknown')}")
            print_info(f"Gemini Configured: {data.get('gemini_configured', 'Unknown')}")
            print_info(f"Cache Backend: {data.get('cache_backend', 'Unknown')}")
            
            services = data.get('services', {})
            for service, status in services.items():
                if status:
                    print_success(f"Service {service}: Active")
                else:
                    print_error(f"Service {service}: Inactive")
                    
            rate_limits = data.get('rate_limits', {})
            print_info("Rate Limits:")
            for endpoint, limit in rate_limits.items():
                print(f"  - {endpoint}: {limit}")
                
        else:
            print_error(f"Health check failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to Django server. Make sure it's running on port 8000.")
        return False
    except Exception as e:
        print_error(f"Health check error: {str(e)}")
        return False
    
    return True

def test_data_validation():
    """Test AI data validation endpoint"""
    print_header("AI DATA VALIDATION TEST")
    
    # Mock data for testing
    test_data = {
        "footprint_id": "test-footprint-123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/carbon/ai/validate/",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Data validation endpoint working")
            print_info(f"Validation Score: {data.get('validation_score', 'N/A')}%")
            
            anomalies = data.get('anomalies', [])
            if anomalies:
                print_info(f"Found {len(anomalies)} anomalies:")
                for anomaly in anomalies:
                    print(f"  - {anomaly.get('field', 'Unknown')}: {anomaly.get('message', 'No message')}")
            
            recommendations = data.get('recommendations', [])
            if recommendations:
                print_info(f"AI Recommendations ({len(recommendations)}):")
                for rec in recommendations:
                    print(f"  - {rec}")
                    
        elif response.status_code == 400:
            print_warning(f"Expected validation error (demo mode): {response.json().get('error', 'No error message')}")
        else:
            print_error(f"Validation failed: {response.status_code}")
            print_error(f"Response: {response.text}")
            
    except Exception as e:
        print_error(f"Validation test error: {str(e)}")

def test_emission_factor_suggestions():
    """Test AI emission factor suggestions"""
    print_header("AI EMISSION FACTOR SUGGESTIONS TEST")
    
    test_cases = [
        {
            "activity_description": "We used 5000 kWh of electricity from the grid",
            "industry": "Technology"
        },
        {
            "activity_description": "Company vehicles consumed 500 gallons of gasoline",
            "industry": "Logistics"
        },
        {
            "activity_description": "Business flights totaling 10000 miles",
            "industry": "Consulting"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print_info(f"Test Case {i}: {test_case['activity_description']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/carbon/ai/suggest-factors/",
                json=test_case,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success("Emission factor suggestion working")
                
                best_match = data.get('best_matching_category', 'Unknown')
                confidence = data.get('confidence_score', 0)
                
                print(f"  Best Match: {best_match} (Confidence: {confidence}%)")
                
                if 'suggested_emission_factor' in data:
                    print(f"  Suggested Factor: {data['suggested_emission_factor']} {data.get('unit', 'kg CO2e/unit')}")
                    
            else:
                print_warning(f"Suggestion failed: {response.status_code}")
                
        except Exception as e:
            print_error(f"Suggestion test error: {str(e)}")
        
        print()  # Add spacing between test cases

def test_benchmarking():
    """Test AI benchmarking endpoint"""
    print_header("AI BENCHMARKING TEST")
    
    try:
        response = requests.get(f"{BASE_URL}/carbon/ai/benchmark/")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Benchmarking endpoint working")
            
            percentile = data.get('percentile_ranking', 'N/A')
            performance = data.get('performance_vs_average', 'N/A')
            
            print_info(f"Percentile Ranking: {percentile}%")
            print_info(f"Performance vs Average: {performance}%")
            
            opportunities = data.get('improvement_opportunities', [])
            if opportunities:
                print_info("Improvement Opportunities:")
                for opp in opportunities:
                    print(f"  - {opp}")
                    
        elif response.status_code == 400:
            print_warning(f"Expected benchmarking error (demo mode): {response.json().get('error', 'No error message')}")
        else:
            print_error(f"Benchmarking failed: {response.status_code}")
            
    except Exception as e:
        print_error(f"Benchmarking test error: {str(e)}")

def test_action_plan_generation():
    """Test AI action plan generation"""
    print_header("AI ACTION PLAN GENERATION TEST")
    
    try:
        response = requests.post(f"{BASE_URL}/carbon/ai/action-plan/")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Action plan generation working")
            
            quick_wins = data.get('quick_wins', [])
            medium_term = data.get('medium_term', [])
            long_term = data.get('long_term', [])
            
            print_info(f"Quick Wins: {len(quick_wins)} actions")
            for action in quick_wins:
                print(f"  - {action.get('action', 'Unknown')}: {action.get('co2_reduction', 0)} tCO2e")
            
            print_info(f"Medium-term: {len(medium_term)} actions")
            print_info(f"Long-term: {len(long_term)} actions")
            
        elif response.status_code == 400:
            print_warning(f"Expected action plan error (demo mode): {response.json().get('error', 'No error message')}")
        else:
            print_error(f"Action plan generation failed: {response.status_code}")
            
    except Exception as e:
        print_error(f"Action plan test error: {str(e)}")

def test_conversational_data_entry():
    """Test conversational data entry"""
    print_header("CONVERSATIONAL DATA ENTRY TEST")
    
    test_inputs = [
        "We used 5000 kWh of electricity last month",
        "Our trucks consumed 200 gallons of diesel fuel",
        "Employees traveled 15000 miles for business"
    ]
    
    for i, user_input in enumerate(test_inputs, 1):
        print_info(f"Test Input {i}: {user_input}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/carbon/ai/conversational/",
                json={"user_input": user_input},
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success("Conversational processing working")
                
                ai_response = data.get('response', 'No response')
                print(f"  AI Response: {ai_response[:100]}...")
                
                fields = data.get('interpreted_data_fields', [])
                if fields:
                    print_info("Extracted Fields:")
                    for field in fields:
                        print(f"  - {field}")
                        
            else:
                print_warning(f"Conversational processing failed: {response.status_code}")
                
        except Exception as e:
            print_error(f"Conversational test error: {str(e)}")
        
        print()

def main():
    print_header("PHASE 5 AI FEATURES TEST SUITE")
    print_info(f"Testing AI endpoints at: {BASE_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    if test_ai_service_health():
        test_data_validation()
        test_emission_factor_suggestions()
        test_benchmarking()
        test_action_plan_generation()
        test_conversational_data_entry()
    
    print_header("TEST SUITE COMPLETED")
    print_info("All AI endpoints have been tested")
    print_warning("Note: Most endpoints will use mock data in development mode")
    print_info("To use real AI, configure GEMINI_API_KEY in your environment")

if __name__ == "__main__":
    main()
