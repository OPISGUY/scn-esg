#!/usr/bin/env python
"""
Test script to verify AI endpoints work with the new Gemini API key
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from carbon.ai_services import GeminiAIService, AIDataValidator, AIBenchmarkingService, AIActionPlanGenerator
from carbon.models import CarbonFootprint
from companies.models import Company

User = get_user_model()

def test_gemini_connection():
    """Test basic Gemini AI connection"""
    print("\n" + "="*60)
    print("TEST 1: Gemini AI Connection")
    print("="*60)
    
    try:
        service = GeminiAIService()
        if service.model:
            print("✅ Gemini AI service initialized successfully")
            print(f"   Model: gemini-2.5-flash-lite-preview-09-2025")
            return True
        else:
            print("❌ Gemini AI model not initialized")
            return False
    except Exception as e:
        print(f"❌ Failed to initialize Gemini AI: {str(e)}")
        return False

def test_ai_validator():
    """Test AI validation service"""
    print("\n" + "="*60)
    print("TEST 2: AI Data Validator")
    print("="*60)
    
    try:
        # Get or create demo user with footprint
        user = User.objects.filter(email='demo@scn.com').first()
        if not user:
            print("❌ Demo user not found")
            return False
        
        # Get latest footprint
        footprint = CarbonFootprint.objects.filter(company__users=user).first()
        if not footprint:
            print("⚠️  No carbon footprint found for demo user")
            print("   Creating a test footprint...")
            
            # Create test footprint
            footprint = CarbonFootprint.objects.create(
                company=user.company,
                reporting_period="2024",
                scope1_emissions=1500.0,
                scope2_emissions=2000.0,
                scope3_emissions=500.0,
                total_emissions=4000.0
            )
            print(f"   Created test footprint with ID: {footprint.id}")
        
        validator = AIDataValidator()
        result = validator.validate_emission_data(footprint)
        
        print("✅ AI validation completed")
        print(f"   Validation score: {result.get('validation_score', 'N/A')}")
        print(f"   Anomalies found: {len(result.get('anomalies', []))}")
        print(f"   Recommendations: {len(result.get('recommendations', []))}")
        
        return True
    except Exception as e:
        print(f"❌ AI validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_ai_benchmarking():
    """Test AI benchmarking service"""
    print("\n" + "="*60)
    print("TEST 3: AI Benchmarking Service")
    print("="*60)
    
    try:
        user = User.objects.filter(email='demo@scn.com').first()
        if not user or not user.company:
            print("❌ Demo user or company not found")
            return False
        
        benchmarking = AIBenchmarkingService()
        result = benchmarking.benchmark_company_performance(user.company)
        
        if 'error' in result:
            print(f"⚠️  Benchmarking returned error: {result['error']}")
            return False
        
        print("✅ AI benchmarking completed")
        print(f"   Percentile ranking: {result.get('percentile_ranking', 'N/A')}")
        print(f"   Performance vs average: {result.get('performance_vs_average', 'N/A')}%")
        print(f"   Improvement opportunities: {len(result.get('improvement_opportunities', []))}")
        
        return True
    except Exception as e:
        print(f"❌ AI benchmarking failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_action_plan_generator():
    """Test AI action plan generator"""
    print("\n" + "="*60)
    print("TEST 4: AI Action Plan Generator")
    print("="*60)
    
    try:
        user = User.objects.filter(email='demo@scn.com').first()
        if not user or not user.company:
            print("❌ Demo user or company not found")
            return False
        
        generator = AIActionPlanGenerator()
        result = generator.generate_action_plan(user.company)
        
        if 'error' in result:
            print(f"⚠️  Action plan returned error: {result['error']}")
            return False
        
        print("✅ AI action plan generated")
        print(f"   Quick wins: {len(result.get('quick_wins', []))}")
        print(f"   Medium-term actions: {len(result.get('medium_term', []))}")
        print(f"   Long-term actions: {len(result.get('long_term', []))}")
        
        if result.get('quick_wins'):
            print(f"\n   Example quick win:")
            win = result['quick_wins'][0]
            print(f"   - {win.get('action', 'N/A')}")
            print(f"     CO2 reduction: {win.get('co2_reduction', 'N/A')} kg")
            print(f"     Cost: {win.get('cost', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"❌ Action plan generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    import os
    api_key = os.getenv('GOOGLE_AI_API_KEY', 'Not set')
    key_status = '✅ Loaded' if api_key != 'Not set' else '❌ Not set'
    
    print("\n" + "="*60)
    print("AI SERVICES TEST SUITE")
    print(f"Gemini API Key: {key_status}")
    print("Model: gemini-2.5-flash-lite-preview-09-2025")
    print("="*60)
    
    tests = [
        ("Gemini Connection", test_gemini_connection),
        ("AI Validator", test_ai_validator),
        ("AI Benchmarking", test_ai_benchmarking),
        ("Action Plan Generator", test_action_plan_generator),
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
        print("\n🎉 All AI services are working correctly with the new Gemini API!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
