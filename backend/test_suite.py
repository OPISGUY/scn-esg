#!/usr/bin/env python3
"""
Comprehensive Test Suite for SCN ESG Platform
Tests login, registration, and onboarding functionality
"""

import requests
import json
from datetime import datetime

class ESGPlatformTester:
    def __init__(self):
        self.base_url = "https://scn-esg-backend.onrender.com"
        self.test_results = []
    
    def log_test(self, test_name, status, details=""):
        """Log test results"""
        symbol = "✅" if status else "❌"
        self.test_results.append({
            "name": test_name,
            "status": status,
            "details": details
        })
        print(f"   {symbol} {test_name}: {details}")
    
    def test_demo_user_login(self):
        """Test login with demo user"""
        print("\n🔐 Test 1: Demo User Login")
        
        # Try the new demo user credentials
        demo_credentials = [
            {"email": "demo@scn.com", "password": "DemoPassword123!"},
            {"email": "business@scn.com", "password": "business123"},
            {"email": "business@scn.com", "password": "Business123"}
        ]
        
        for creds in demo_credentials:
            try:
                response = requests.post(
                    f"{self.base_url}/api/v1/users/auth/login/",
                    json=creds,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Demo Login Success", True, f"Email: {creds['email']}")
                    return data.get('access')
                
            except Exception as e:
                continue
        
        self.log_test("Demo Login Failed", False, "No valid credentials found")
        return None
    
    def test_new_user_registration(self):
        """Test new user registration"""
        print("\n📝 Test 2: New User Registration")
        
        test_email = f"test_user_{int(datetime.now().timestamp())}@test.com"
        registration_data = {
            "email": test_email,
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/v1/users/auth/register/",
                json=registration_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 201:
                data = response.json()
                token = data.get('access')
                user = data.get('user', {})
                
                self.log_test("Registration Success", True, f"User ID: {user.get('id')}")
                self.log_test("Onboarding Status", user.get('is_onboarding_complete', True) == False, 
                            f"is_onboarding_complete: {user.get('is_onboarding_complete')}")
                
                return token, test_email
            else:
                self.log_test("Registration Failed", False, f"Status: {response.status_code}")
                return None, None
                
        except Exception as e:
            self.log_test("Registration Exception", False, str(e))
            return None, None
    
    def test_onboarding_endpoint(self, token):
        """Test the onboarding completion endpoint"""
        print("\n🚀 Test 3: Onboarding Endpoint")
        
        if not token:
            self.log_test("Onboarding Skipped", False, "No token available")
            return
        
        onboarding_data = {
            "company_name": "Test Company Ltd",
            "industry": "Technology",
            "employees": 100,
            "sustainability_goals": ["carbon_neutral", "renewable_energy"],
            "reporting_requirements": ["csrd"],
            "challenges": ["data_collection"]
        }
        
        # Try different possible endpoint URLs
        endpoints_to_try = [
            "/api/v1/users/auth/complete-onboarding/",
            "/api/v1/users/complete-onboarding/",
            "/api/v1/complete-onboarding/"
        ]
        
        for endpoint in endpoints_to_try:
            try:
                response = requests.post(
                    f"{self.base_url}{endpoint}",
                    json=onboarding_data,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {token}"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_test("Onboarding Success", True, f"Endpoint: {endpoint}")
                    return True
                elif response.status_code == 404:
                    continue
                else:
                    self.log_test("Onboarding Failed", False, 
                                f"Status: {response.status_code}, Endpoint: {endpoint}")
                    
            except Exception as e:
                continue
        
        self.log_test("Onboarding Endpoint Not Found", False, "All endpoints returned 404")
        return False
    
    def test_profile_access(self, token):
        """Test profile access with token"""
        print("\n👤 Test 4: Profile Access")
        
        if not token:
            self.log_test("Profile Skipped", False, "No token available")
            return
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/users/auth/profile/",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Profile Access", True, f"User: {data.get('email')}")
            else:
                self.log_test("Profile Access Failed", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Profile Exception", False, str(e))
    
    def test_health_check(self):
        """Test API health"""
        print("\n🏥 Test 5: API Health Check")
        
        try:
            response = requests.get(f"{self.base_url}/api/v1/users/auth/health/")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("API Health", True, f"Version: {data.get('version')}")
            else:
                self.log_test("API Health Failed", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("API Health Exception", False, str(e))
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🧪 SCN ESG PLATFORM - COMPREHENSIVE TEST SUITE")
        print("=" * 60)
        
        # Test 1: Demo user login
        demo_token = self.test_demo_user_login()
        
        # Test 2: New user registration
        new_token, new_email = self.test_new_user_registration()
        
        # Test 3: Onboarding endpoint
        if new_token:
            self.test_onboarding_endpoint(new_token)
        
        # Test 4: Profile access
        token_to_test = new_token or demo_token
        self.test_profile_access(token_to_test)
        
        # Test 5: Health check
        self.test_health_check()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["status"])
        total = len(self.test_results)
        
        for result in self.test_results:
            symbol = "✅" if result["status"] else "❌"
            print(f"{symbol} {result['name']}")
        
        print(f"\n📈 RESULTS: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️  Some tests failed - check deployment status")

if __name__ == "__main__":
    tester = ESGPlatformTester()
    tester.run_all_tests()
