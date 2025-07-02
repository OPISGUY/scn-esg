"""
AI-powered services for carbon data validation and insights using Gemini AI
"""
import json
import logging
from typing import Dict, List, Any, Optional
from decimal import Decimal
import google.generativeai as genai
from django.conf import settings
from django.core.cache import cache
from .models import CarbonFootprint
from companies.models import Company

logger = logging.getLogger(__name__)

class GeminiAIService:
    """Service for interacting with Google Gemini AI"""
    
    def __init__(self):
        # Configure Gemini AI with proper API key validation
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if api_key and api_key != 'your-gemini-api-key-here':
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')  # Use the correct model name
                logger.info("Gemini AI service initialized successfully with real API key")
            except Exception as e:
                logger.error(f"Failed to configure Gemini AI: {str(e)}")
                self.model = None
        else:
            logger.warning("Gemini API key not configured or is placeholder. AI features will use mock responses.")
            self.model = None
    
    def _call_gemini(self, prompt: str) -> Dict[str, Any]:
        """Make a call to Gemini AI with error handling"""
        try:
            if self.model:
                response = self.model.generate_content(prompt)
                response_text = response.text.strip()
                
                # Try to parse as JSON first
                try:
                    return json.loads(response_text)
                except json.JSONDecodeError:
                    # If not JSON, try to extract JSON from the response
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        try:
                            return json.loads(json_match.group())
                        except json.JSONDecodeError:
                            pass
                    
                    # If still no JSON, create a structured response
                    return {
                        "response": response_text,
                        "source": "gemini_ai",
                        "success": True
                    }
            else:
                # Return mock response for development
                return self._get_mock_response(prompt)
        except Exception as e:
            logger.error(f"Gemini AI call failed: {str(e)}")
            return self._get_mock_response(prompt)
    
    def _get_mock_response(self, prompt: str) -> Dict[str, Any]:
        """Generate mock AI responses for development"""
        if "validate" in prompt.lower():
            return {
                "validation_score": 85,
                "anomalies": [
                    {
                        "field": "scope1_emissions",
                        "severity": "medium",
                        "message": "Scope 1 emissions seem high for company size",
                        "suggested_value": 1200.50
                    }
                ],
                "data_quality_issues": [
                    "Consider adding more detailed activity data"
                ],
                "recommendations": [
                    "Review fuel consumption calculations",
                    "Verify emission factors used"
                ]
            }
        elif "benchmark" in prompt.lower():
            return {
                "percentile_ranking": 65,
                "industry_average": 2500.75,
                "performance_vs_average": -15.2,
                "improvement_opportunities": [
                    "Energy efficiency improvements could reduce emissions by 20%",
                    "Renewable energy adoption could cut Scope 2 by 40%"
                ]
            }
        elif "action_plan" in prompt.lower():
            return {
                "quick_wins": [
                    {
                        "action": "Switch to LED lighting",
                        "co2_reduction": 50.5,
                        "cost": "Low",
                        "timeline": "3 months"
                    }
                ],
                "medium_term": [
                    {
                        "action": "Install solar panels",
                        "co2_reduction": 200.0,
                        "cost": "Medium",
                        "timeline": "12 months"
                    }
                ],
                "long_term": [
                    {
                        "action": "Electrify vehicle fleet",
                        "co2_reduction": 300.0,
                        "cost": "High",
                        "timeline": "24 months"
                    }
                ]
            }
        else:
            return {"message": "AI service response", "status": "success"}

class AIDataValidator:
    """AI-powered data validation service"""
    
    def __init__(self):
        self.ai_service = GeminiAIService()
    
    def validate_emission_data(self, carbon_footprint: CarbonFootprint) -> Dict[str, Any]:
        """Validate carbon emission data using AI"""
        cache_key = f"ai_validation_{carbon_footprint.id}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        company = carbon_footprint.company
        
        prompt = f"""
        Analyze this carbon emission data for anomalies and quality issues:
        
        Company Profile:
        - Name: {company.name}
        - Industry: {company.industry}
        - Employees: {company.employees}
        - Annual Revenue: Not specified
        
        Emission Data:
        - Reporting Period: {carbon_footprint.reporting_period}
        - Scope 1 Emissions: {carbon_footprint.scope1_emissions} tCO2e
        - Scope 2 Emissions: {carbon_footprint.scope2_emissions} tCO2e
        - Scope 3 Emissions: {carbon_footprint.scope3_emissions} tCO2e
        - Total Emissions: {carbon_footprint.total_emissions} tCO2e
        
        Please analyze and provide your response in this exact JSON format:
        {{
            "validation_score": <number 0-100>,
            "anomalies": [
                {{
                    "field": "<field_name>",
                    "severity": "low|medium|high",
                    "message": "<description>",
                    "suggested_value": <number or null>
                }}
            ],
            "suggestions": [
                {{
                    "category": "<category>",
                    "message": "<suggestion>",
                    "priority": "low|medium|high"
                }}
            ],
            "industry_comparison": {{
                "percentile": <number>,
                "benchmark": <number>,
                "status": "below|average|above"
            }}
        }}
        
        IMPORTANT: Respond ONLY with valid JSON, no additional text.
        """
        
        result = self.ai_service._call_gemini(prompt)
        
        # Cache result for 1 hour
        cache.set(cache_key, result, 3600)
        
        return result
    
    def suggest_emission_factors(self, activity_description: str, industry: str) -> Dict[str, Any]:
        """Suggest appropriate emission factors for activities"""
        prompt = f"""
        Based on this activity description: "{activity_description}"
        For industry: {industry}
        
        Suggest the most appropriate emission factors from these categories:
        - Electricity (grid-average, renewable)
        - Transportation (car, train, plane, shipping)
        - Manufacturing (steel, cement, chemicals)
        - Energy (natural gas, coal, oil)
        - Waste (landfill, incineration, recycling)
        - Other industrial processes
        
        Respond in this exact JSON format:
        {{
            "best_match": "<category name>",
            "confidence_score": <number 0-100>,
            "emission_factor": <number>,
            "unit": "<unit of measurement>",
            "alternatives": [
                {{
                    "category": "<alternative category>",
                    "factor": <number>,
                    "confidence": <number>
                }}
            ],
            "data_source": "<recommended source>",
            "notes": "<additional guidance>"
        }}
        
        IMPORTANT: Respond ONLY with valid JSON, no additional text.
        """
        
        return self.ai_service._call_gemini(prompt)

class AIBenchmarkingService:
    """AI-powered benchmarking and industry comparison"""
    
    def __init__(self):
        self.ai_service = GeminiAIService()
    
    def benchmark_company_performance(self, company: Company) -> Dict[str, Any]:
        """Benchmark company against industry peers using AI"""
        cache_key = f"ai_benchmark_{company.id}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        # Get company's latest carbon footprint
        latest_footprint = company.carbon_footprints.order_by('-created_at').first()
        
        if not latest_footprint:
            return {"error": "No carbon footprint data available"}
        
        # Get industry peer data for context
        industry_peers = Company.objects.filter(
            industry=company.industry
        ).exclude(id=company.id)[:10]
        
        peer_data = []
        for peer in industry_peers:
            peer_footprint = peer.carbon_footprints.order_by('-created_at').first()
            if peer_footprint:
                peer_data.append({
                    'employees': peer.employees,
                    'total_emissions': float(peer_footprint.total_emissions),
                    'carbon_intensity': float(peer_footprint.total_emissions) / peer.employees if peer.employees > 0 else 0
                })
        
        prompt = f"""
        Analyze this company's carbon performance against industry peers:
        
        Target Company:
        - Industry: {company.industry}
        - Employees: {company.employees}
        - Total Emissions: {latest_footprint.total_emissions} tCO2e
        - Carbon Intensity: {float(latest_footprint.total_emissions) / company.employees if company.employees > 0 else 0:.2f} tCO2e/employee
        
        Industry Peer Data:
        {json.dumps(peer_data, indent=2)}
        
        Provide benchmarking analysis:
        1. Percentile ranking (e.g., top 10%, 25%, 50%)
        2. Performance vs industry average (% better/worse)
        3. Key performance insights
        4. Areas for improvement
        5. Realistic reduction targets
        6. Best practice recommendations
        
        Format as JSON with actionable insights.
        """
        
        result = self.ai_service._call_gemini(prompt)
        
        # Cache result for 6 hours
        cache.set(cache_key, result, 21600)
        
        return result

class AIActionPlanGenerator:
    """Generate AI-powered sustainability action plans"""
    
    def __init__(self):
        self.ai_service = GeminiAIService()
    
    def generate_action_plan(self, company: Company) -> Dict[str, Any]:
        """Generate personalized sustainability action plan"""
        cache_key = f"ai_action_plan_{company.id}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        latest_footprint = company.carbon_footprints.order_by('-created_at').first()
        
        if not latest_footprint:
            return {"error": "No carbon footprint data available"}
        
        prompt = f"""
        Create a personalized sustainability action plan for this company:
        
        Company Profile:
        - Industry: {company.industry}
        - Size: {company.employees} employees
        - Current Carbon Footprint: {latest_footprint.total_emissions} tCO2e
        
        Emission Breakdown:
        - Scope 1: {latest_footprint.scope1_emissions} tCO2e ({(float(latest_footprint.scope1_emissions)/float(latest_footprint.total_emissions)*100):.1f}%)
        - Scope 2: {latest_footprint.scope2_emissions} tCO2e ({(float(latest_footprint.scope2_emissions)/float(latest_footprint.total_emissions)*100):.1f}%)
        - Scope 3: {latest_footprint.scope3_emissions} tCO2e ({(float(latest_footprint.scope3_emissions)/float(latest_footprint.total_emissions)*100):.1f}%)
        
        Generate 5-7 specific, actionable recommendations organized by timeline:
        
        1. Quick Wins (0-6 months):
           - Low-cost, high-impact actions
           - Operational efficiency improvements
        
        2. Medium-term Initiatives (6-18 months):
           - Technology upgrades
           - Process improvements
        
        3. Long-term Strategic Changes (1-3 years):
           - Infrastructure investments
           - Business model changes
        
        For each recommendation provide:
        - Specific action steps
        - Estimated CO2 reduction potential (tCO2e)
        - Implementation cost estimate (Low/Medium/High)
        - Priority level (1-5)
        - Success metrics
        - ROI timeframe
        
        Tailor recommendations specifically to the {company.industry} industry and company size.
        
        Format as JSON with structured action items.
        """
        
        result = self.ai_service._call_gemini(prompt)
        
        # Cache result for 24 hours
        cache.set(cache_key, result, 86400)
        
        return result

class AIPredictiveAnalytics:
    """AI-powered predictive analytics for carbon trajectory"""
    
    def __init__(self):
        self.ai_service = GeminiAIService()
    
    def predict_carbon_trajectory(self, company: Company, growth_plans: Dict[str, Any] = None) -> Dict[str, Any]:
        """Predict future carbon emissions based on historical data and growth plans"""
        cache_key = f"ai_trajectory_{company.id}"
        cached_result = cache.get(cache_key)
        
        if cached_result:
            return cached_result
        
        # Get historical emissions data
        historical_footprints = company.carbon_footprints.order_by('created_at')[:3]
        
        if len(historical_footprints) < 2:
            return {"error": "Insufficient historical data for prediction"}
        
        historical_data = [
            {
                "period": fp.reporting_period,
                "total_emissions": float(fp.total_emissions),
                "scope1": float(fp.scope1_emissions),
                "scope2": float(fp.scope2_emissions),
                "scope3": float(fp.scope3_emissions)
            }
            for fp in historical_footprints
        ]
        
        growth_data = growth_plans or {
            "revenue_growth": 10,
            "employee_growth": 15,
            "new_facilities": 0,
            "sustainability_investments": "moderate"
        }
        
        prompt = f"""
        Predict carbon emission trajectory based on historical data and business growth:
        
        Company: {company.name} ({company.industry})
        Current Size: {company.employees} employees
        
        Historical Emissions (last 3 years):
        {json.dumps(historical_data, indent=2)}
        
        Planned Business Growth:
        - Revenue growth: {growth_data.get('revenue_growth', 10)}%
        - Employee growth: {growth_data.get('employee_growth', 15)}%
        - New facilities: {growth_data.get('new_facilities', 0)}
        - Sustainability investments: {growth_data.get('sustainability_investments', 'moderate')}
        
        Create 3 prediction scenarios through 2030:
        
        1. Business as Usual:
           - No significant efficiency improvements
           - Growth directly correlates to emissions increase
        
        2. Moderate Improvements:
           - Standard efficiency gains (2-3% annually)
           - Some renewable energy adoption
        
        3. Aggressive Decarbonization:
           - Best practice implementation
           - Significant renewable energy transition
           - Process optimization
        
        For each scenario predict:
        - Annual emissions 2025-2030
        - Key emission drivers
        - Investment requirements
        - Risk factors
        - Confidence intervals
        
        Include specific numerical projections and actionable insights.
        Format as JSON with yearly breakdown.
        """
        
        result = self.ai_service._call_gemini(prompt)
        
        # Cache result for 12 hours
        cache.set(cache_key, result, 43200)
        
        return result
