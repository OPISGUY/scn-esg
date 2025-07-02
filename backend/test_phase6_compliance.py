#!/usr/bin/env python3
"""
Test script for Phase 6 CSRD Compliance features
Tests the AI-powered compliance assessment APIs
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"
TEST_DATA = {
    "username": "testuser",
    "password": "testpass123",
    "email": "test@example.com"
}

class CSRDComplianceAPITest:
    def __init__(self):
        self.token = None
        self.assessment_id = None
        self.headers = {'Content-Type': 'application/json'}
        
    def authenticate(self):
        """Authenticate and get JWT token"""
        print("🔐 Authenticating...")
        
        # First try to create a test user
        try:
            requests.post(f"{BASE_URL}/api/v1/auth/register/", 
                         json=TEST_DATA, headers=self.headers)
        except:
            pass  # User might already exist
        
        # Login
        response = requests.post(f"{BASE_URL}/api/v1/auth/login/", 
                               json={"username": TEST_DATA["username"], 
                                    "password": TEST_DATA["password"]}, 
                               headers=self.headers)
        
        if response.status_code == 200:
            self.token = response.json()['access']
            self.headers['Authorization'] = f'Bearer {self.token}'
            print("✅ Authentication successful")
            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return False
    
    def test_compliance_dashboard_stats(self):
        """Test compliance dashboard statistics"""
        print("\n📊 Testing compliance dashboard stats...")
        
        response = requests.get(f"{BASE_URL}/api/v1/compliance/assessments/dashboard_stats/", 
                              headers=self.headers)
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ Dashboard stats retrieved successfully")
            print(f"   - Total assessments: {stats.get('total_assessments', 0)}")
            print(f"   - CSRD applicable companies: {stats.get('csrd_applicable_companies', 0)}")
            print(f"   - Average readiness score: {stats.get('average_readiness_score', 0):.1f}%")
            print(f"   - High priority actions: {stats.get('high_priority_actions', 0)}")
            return True
        else:
            print(f"❌ Dashboard stats failed: {response.status_code}")
            return False
    
    def test_create_csrd_assessment(self):
        """Test creating a new CSRD assessment"""
        print("\n🏗️  Creating CSRD assessment...")
        
        # First, get or create a company
        company_response = requests.get(f"{BASE_URL}/api/v1/companies/", headers=self.headers)
        
        if company_response.status_code == 200:
            companies = company_response.json()
            if companies.get('results'):
                company_id = companies['results'][0]['id']
            else:
                # Create a test company
                company_data = {
                    "name": "Test Company Ltd",
                    "industry": "Technology",
                    "employees": 500,
                    "description": "Test company for CSRD compliance"
                }
                create_response = requests.post(f"{BASE_URL}/api/v1/companies/", 
                                              json=company_data, headers=self.headers)
                if create_response.status_code == 201:
                    company_id = create_response.json()['id']
                else:
                    print(f"❌ Failed to create company: {create_response.status_code}")
                    return False
        else:
            print(f"❌ Failed to get companies: {company_response.status_code}")
            return False
        
        # Create CSRD assessment
        assessment_data = {
            "company": company_id,
            "company_size": "large",
            "has_eu_operations": True,
            "is_listed_company": False,
            "annual_revenue_eur": 50000000,
            "employee_count": 500
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/compliance/assessments/", 
                               json=assessment_data, headers=self.headers)
        
        if response.status_code == 201:
            assessment = response.json()
            self.assessment_id = assessment['id']
            print("✅ CSRD assessment created successfully")
            print(f"   - Assessment ID: {self.assessment_id}")
            print(f"   - CSRD Applicable: {assessment.get('csrd_applicable')}")
            print(f"   - First Reporting Year: {assessment.get('first_reporting_year')}")
            return True
        else:
            print(f"❌ Assessment creation failed: {response.status_code}")
            if response.content:
                print(f"   Error: {response.json()}")
            return False
    
    def test_materiality_questionnaire(self):
        """Test materiality questionnaire generation"""
        if not self.assessment_id:
            print("❌ No assessment ID available for materiality test")
            return False
        
        print("\n📝 Testing materiality questionnaire...")
        
        response = requests.get(f"{BASE_URL}/api/v1/compliance/assessments/{self.assessment_id}/materiality_questionnaire/", 
                              headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            questions = data.get('questions', [])
            print(f"✅ Materiality questionnaire generated successfully")
            print(f"   - Total questions: {len(questions)}")
            
            if questions:
                print(f"   - Sample question: {questions[0].get('question', 'N/A')}")
                print(f"   - ESRS category: {questions[0].get('esrs_category', 'N/A')}")
            
            return True
        else:
            print(f"❌ Materiality questionnaire failed: {response.status_code}")
            return False
    
    def test_submit_materiality_responses(self):
        """Test submitting materiality responses"""
        if not self.assessment_id:
            print("❌ No assessment ID available for response submission")
            return False
        
        print("\n📤 Testing materiality response submission...")
        
        # Submit sample responses
        responses = {
            "E1_1": "Yes",
            "E1_2": "Partially", 
            "S1_1": "Yes",
            "S1_2": "No",
            "G1_1": "Yes"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/compliance/assessments/{self.assessment_id}/submit_materiality_responses/", 
                               json={"responses": responses}, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Materiality responses submitted successfully")
            print(f"   - Updated datapoints: {data.get('updated_datapoints', 0)}")
            return True
        else:
            print(f"❌ Response submission failed: {response.status_code}")
            return False
    
    def test_ai_analysis(self):
        """Test AI analysis functionality"""
        if not self.assessment_id:
            print("❌ No assessment ID available for AI analysis")
            return False
        
        print("\n🤖 Testing AI analysis...")
        print("   (This may take 15-30 seconds depending on AI response time)")
        
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/api/v1/compliance/assessments/{self.assessment_id}/run_ai_analysis/", 
                               headers=self.headers)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ AI analysis completed successfully in {end_time - start_time:.1f} seconds")
            print(f"   - Readiness score: {data.get('readiness_score', 'N/A')}%")
            
            summary = data.get('summary', {})
            print(f"   - Total datapoints: {summary.get('total_datapoints', 0)}")
            print(f"   - Completed datapoints: {summary.get('completed_datapoints', 0)}")
            print(f"   - High priority actions: {summary.get('high_priority_actions', 0)}")
            
            return True
        else:
            print(f"❌ AI analysis failed: {response.status_code}")
            if response.content:
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   Raw error: {response.text}")
            return False
    
    def test_get_assessment_details(self):
        """Test retrieving detailed assessment data"""
        if not self.assessment_id:
            print("❌ No assessment ID available for details test")
            return False
        
        print("\n🔍 Testing assessment details retrieval...")
        
        response = requests.get(f"{BASE_URL}/api/v1/compliance/assessments/{self.assessment_id}/", 
                              headers=self.headers)
        
        if response.status_code == 200:
            assessment = response.json()
            print("✅ Assessment details retrieved successfully")
            print(f"   - Company: {assessment.get('company_name', 'N/A')}")
            print(f"   - Status: {assessment.get('status', 'N/A')}")
            print(f"   - Readiness score: {assessment.get('overall_readiness_score', 'N/A')}%")
            print(f"   - ESRS datapoints: {len(assessment.get('esrs_datapoints', []))}")
            print(f"   - Compliance actions: {len(assessment.get('compliance_actions', []))}")
            
            return True
        else:
            print(f"❌ Assessment details failed: {response.status_code}")
            return False
    
    def test_compliance_actions(self):
        """Test compliance action management"""
        print("\n⚡ Testing compliance actions...")
        
        response = requests.get(f"{BASE_URL}/api/v1/compliance/actions/", headers=self.headers)
        
        if response.status_code == 200:
            actions = response.json()
            action_list = actions.get('results', actions) if isinstance(actions, dict) else actions
            
            print(f"✅ Compliance actions retrieved successfully")
            print(f"   - Total actions: {len(action_list)}")
            
            if action_list:
                action = action_list[0]
                print(f"   - Sample action: {action.get('title', 'N/A')}")
                print(f"   - Priority: {action.get('priority', 'N/A')}")
                print(f"   - Status: {action.get('status', 'N/A')}")
                
                # Test updating progress
                if action.get('id'):
                    progress_response = requests.post(
                        f"{BASE_URL}/api/v1/compliance/actions/{action['id']}/update_progress/",
                        json={"progress": 25, "notes": "Initial progress update from API test"},
                        headers=self.headers
                    )
                    
                    if progress_response.status_code == 200:
                        print("   ✅ Progress update successful")
                    else:
                        print(f"   ❌ Progress update failed: {progress_response.status_code}")
            
            return True
        else:
            print(f"❌ Compliance actions failed: {response.status_code}")
            return False
    
    def test_regulatory_updates(self):
        """Test regulatory updates functionality"""  
        print("\n📢 Testing regulatory updates...")
        
        response = requests.get(f"{BASE_URL}/api/v1/compliance/regulatory-updates/", headers=self.headers)
        
        if response.status_code == 200:
            updates = response.json()
            update_list = updates.get('results', updates) if isinstance(updates, dict) else updates
            
            print(f"✅ Regulatory updates retrieved successfully")
            print(f"   - Total updates: {len(update_list)}")
            
            return True
        else:
            print(f"❌ Regulatory updates failed: {response.status_code}")
            return False
    
    def run_all_tests(self):
        """Run all compliance API tests"""
        print("🚀 Starting CSRD Compliance API Tests")
        print("=" * 50)
        
        if not self.authenticate():
            return False
        
        tests = [
            self.test_compliance_dashboard_stats,
            self.test_create_csrd_assessment,
            self.test_materiality_questionnaire,
            self.test_submit_materiality_responses,
            self.test_ai_analysis,
            self.test_get_assessment_details,
            self.test_compliance_actions,
            self.test_regulatory_updates,
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}")
        
        print("\n" + "=" * 50)
        print(f"🎯 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All Phase 6 CSRD Compliance tests passed!")
            print("\n✅ Phase 6 Implementation Status:")
            print("   - CSRD Assessment Creation ✅")
            print("   - AI-Powered Readiness Analysis ✅")
            print("   - Materiality Assessment ✅")
            print("   - Compliance Action Management ✅")
            print("   - Dashboard Statistics ✅")
            print("   - Regulatory Updates Framework ✅")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the errors above.")
        
        return passed == total

if __name__ == "__main__":
    tester = CSRDComplianceAPITest()
    tester.run_all_tests()
