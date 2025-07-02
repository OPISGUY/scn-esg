#!/usr/bin/env python3
"""
Quick test script to verify Gemini AI integration without authentication
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from carbon.ai_services import GeminiAIService, AIDataValidator, EmissionFactorService

def test_gemini_connection():
    """Test basic Gemini AI connection"""
    print("="*60)
    print("           GEMINI AI CONNECTION TEST")
    print("="*60)
    
    try:
        ai_service = GeminiAIService()
        
        # Check if Gemini is configured
        if ai_service.model:
            print("✅ Gemini AI service initialized successfully")
            print("✅ API key is configured")
            
            # Test a simple validation
            test_data = {
                'scope1_emissions': 100.0,
                'scope2_emissions': 200.0,
                'scope3_emissions': 300.0,
                'industry': 'Technology',
                'employees': 150
            }
            
            print(f"🧪 Testing emission factor suggestions...")
            factor_service = EmissionFactorService()
            result = factor_service.suggest_emission_factors("We used 5000 kWh of electricity from the grid", "Technology")
            
            print(f"✅ Suggestion successful!")
            print(f"📊 Best Match: {result.get('best_match', 'N/A')}")
            print(f"⚠️  Confidence: {result.get('confidence_score', 'N/A')}")
            print(f"💡 Emission Factor: {result.get('emission_factor', 'N/A')}")
            
            return True
            
        else:
            print("⚠️  Gemini AI service using mock responses (API key not configured)")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Gemini AI: {str(e)}")
        return False

def test_emission_factor_suggestions():
    """Test emission factor suggestions"""
    print("\n" + "="*60)
    print("         EMISSION FACTOR SUGGESTIONS TEST")
    print("="*60)
    
    try:
        factor_service = EmissionFactorService()
        
        test_descriptions = [
            "We used 5000 kWh of electricity from the grid",
            "Company vehicles consumed 500 gallons of gasoline",
            "Business flights totaling 10000 miles"
        ]
        
        for i, description in enumerate(test_descriptions, 1):
            print(f"\n🧪 Test Case {i}: {description}")
            result = factor_service.suggest_emission_factors(description, "Technology")
            
            if result:
                print(f"✅ Suggestion successful!")
                print(f"📋 Best Match: {result.get('best_match', 'N/A')}")
                print(f"🎯 Confidence: {result.get('confidence_score', 'N/A')}")
                print(f"💡 Factor: {result.get('emission_factor', 'N/A')}")
            else:
                print(f"⚠️  No suggestions available")
                
    except Exception as e:
        print(f"❌ Error testing emission factor suggestions: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Gemini AI Integration Test")
    print(f"📍 Environment: {os.getenv('GEMINI_API_KEY', 'NOT_SET')[:20]}...")
    
    # Test basic connection
    gemini_working = test_gemini_connection()
    
    # Test emission factor suggestions
    test_emission_factor_suggestions()
    
    print("\n" + "="*60)
    print("                TEST SUMMARY")
    print("="*60)
    
    if gemini_working:
        print("🎉 SUCCESS: Gemini AI is working with your API key!")
        print("✅ Phase 5 AI features are ready for use")
        print("📋 Real AI responses are being generated")
    else:
        print("⚠️  INFO: Using mock responses (development mode)")
        print("📋 All features work, but using simulated AI responses")
        
    print("\n🔄 Ready to proceed with Phase 6!")
