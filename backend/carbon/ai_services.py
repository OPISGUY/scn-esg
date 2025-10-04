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
                self.model = genai.GenerativeModel('gemini-2.5-flash-lite-preview-09-2025')
                logger.info("Gemini AI service initialized successfully with gemini-2.5-flash-lite-preview-09-2025")
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

class ConversationalAIService:
    """AI service for conversational data entry"""
    
    def __init__(self):
        self.ai_service = GeminiAIService()
    
    def extract_from_conversation(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        current_footprint: Optional[CarbonFootprint],
        company_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Extract emissions data from conversational input with full context awareness.
        This is the core method for Phase 1 MVP conversational intelligence.
        """
        
        # Build context-rich prompt
        company_name = company_context.get('name', 'Unknown Company')
        industry = company_context.get('industry', 'General')
        employees = company_context.get('employees', 'Not specified')
        
        # Format current footprint data
        footprint_context = ""
        if current_footprint:
            footprint_context = f"""
Current Footprint (Period: {current_footprint.reporting_period}):
- Scope 1: {current_footprint.scope1_emissions} tCO2e (Direct emissions from owned sources)
- Scope 2: {current_footprint.scope2_emissions} tCO2e (Indirect emissions from purchased energy)
- Scope 3: {current_footprint.scope3_emissions} tCO2e (Indirect emissions from value chain)
- Total: {current_footprint.total_emissions} tCO2e
"""
        else:
            footprint_context = "No existing footprint data. This will be the first entry."
        
        # Format conversation history (last 10 messages)
        history_text = ""
        if conversation_history:
            recent_history = conversation_history[-10:]  # Last 10 messages
            history_text = "\n".join([
                f"{msg['role'].upper()}: {msg['content']}"
                for msg in recent_history
            ])
        
        prompt = f"""You are an expert ESG data extraction assistant for {company_name}, a {industry} company with {employees} employees.

{footprint_context}

Recent Conversation History:
{history_text if history_text else "No previous conversation."}

User just said: "{user_message}"

Your task is to:
1. Extract any emissions-related data mentioned (quantities, units, activities, time periods)
2. Identify which emission scope it belongs to (1, 2, or 3)
3. Calculate emissions using appropriate emission factors
4. Validate if the data seems reasonable
5. Ask clarifying questions if needed

Emission Factor Guidelines:
- Electricity (Scope 2): US average 0.453 kg CO2/kWh (adjust by region if mentioned)
- Natural Gas (Scope 1): 0.184 kg CO2/kWh combustion
- Gasoline (Scope 1): 8.89 kg CO2/gallon or 2.35 kg CO2/liter
- Diesel (Scope 1): 10.21 kg CO2/gallon or 2.68 kg CO2/liter
- Car Travel (Scope 1/3): 0.368 kg CO2/mile for gasoline vehicles
- Air Travel (Scope 3): 0.255 kg CO2/mile domestic, 0.195 kg CO2/mile international

Context Awareness Rules:
- If user says "add 200 more" or "same as last month", reference the conversation history
- If user mentions currency (e.g., "$500 electricity bill"), note that you need kWh for accuracy
- If values seem unusually high/low compared to current footprint, flag it

Respond in this EXACT JSON format (no additional text):
{{
  "extracted_data": {{
    "activity_type": "electricity_consumption | fuel_combustion | vehicle_fuel | business_travel | etc",
    "scope": 1 | 2 | 3,
    "quantity": <number>,
    "unit": "kWh | gallons | liters | miles | km | etc",
    "period": "YYYY-MM | YYYY-QN | specific dates",
    "emission_factor": <number>,
    "emission_factor_source": "description of which factor used",
    "calculated_emissions": <number in tCO2e>,
    "confidence": <0.0-1.0>,
    "location": "if mentioned for regional factors"
  }},
  "validation": {{
    "status": "ok | warning | needs_clarification",
    "anomalies": ["list of unusual patterns detected"],
    "warnings": ["list of data quality concerns"],
    "comparison_to_current": "how this compares to existing footprint"
  }},
  "ai_response": "Natural language response to the user, confirming what was extracted and any questions",
  "clarifying_questions": ["specific questions if data is ambiguous or incomplete"],
  "suggested_actions": [
    {{
      "type": "update_footprint",
      "field": "scope1_emissions | scope2_emissions | scope3_emissions",
      "operation": "add | set | subtract",
      "value": <number>,
      "requires_confirmation": true | false
    }}
  ]
}}

IMPORTANT: 
- If you cannot extract meaningful emissions data, set extracted_data to null and explain why in ai_response
- Always provide confidence scores honestly (0.5-0.7 for uncertain, 0.8-0.95 for confident, 0.95+ for certain)
- Be conversational and helpful in ai_response
- Flag any data that seems off (e.g., 10x higher than usual)"""
        
        result = self.ai_service._call_gemini(prompt)
        
        # Ensure result has required structure
        if not isinstance(result, dict):
            result = {
                "extracted_data": None,
                "validation": {"status": "error", "anomalies": [], "warnings": []},
                "ai_response": "I had trouble processing that input. Could you try rephrasing?",
                "clarifying_questions": [],
                "suggested_actions": []
            }
        
        return result
    
    def predict_next_value(
        self,
        activity_type: str,
        period: str,
        historical_data: List[Dict[str, Any]],
        company_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Use AI to predict the next value based on historical patterns.
        Phase 3 feature: Predictive auto-fill.
        """
        
        prompt = f"""Analyze this historical {activity_type} data and predict the likely value for {period}.

Company Context:
- Name: {company_context.get('name', 'Unknown')}
- Industry: {company_context.get('industry', 'General')}

Historical Data:
{json.dumps(historical_data, indent=2)}

Consider:
- Seasonal patterns (summer vs winter for energy, travel patterns for transport)
- Growth trends (is usage increasing, stable, or decreasing?)
- Any anomalies or outliers in the data
- Business context (company growth, efficiency initiatives, new facilities)

Provide prediction with confidence interval in this JSON format:
{{
  "predicted_value": <number>,
  "unit": "<unit>",
  "confidence_interval": {{
    "low": <number>,
    "high": <number>,
    "confidence_level": 0.95
  }},
  "reasoning": "Explanation of why this prediction makes sense",
  "factors_considered": ["list of factors that influenced prediction"],
  "seasonal_adjustment": <number or null>,
  "growth_trend": "increasing | stable | decreasing",
  "confidence_score": <0.0-1.0>
}}"""
        
        return self.ai_service._call_gemini(prompt)
    
    def generate_proactive_guidance(
        self,
        current_footprint: Optional[CarbonFootprint],
        company_context: Dict[str, Any],
        data_completeness: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate proactive guidance for what data the user should enter next.
        Phase 3 feature: Proactive guidance.
        """
        
        completeness_pct = data_completeness.get('percentage', 0)
        missing_categories = data_completeness.get('missing', [])
        
        footprint_data = ""
        if current_footprint:
            footprint_data = f"""
Current data:
- Scope 1: {current_footprint.scope1_emissions} tCO2e
- Scope 2: {current_footprint.scope2_emissions} tCO2e
- Scope 3: {current_footprint.scope3_emissions} tCO2e
- Completeness: {completeness_pct}%
"""
        
        prompt = f"""You are an ESG reporting guide for {company_context.get('name')}, a {company_context.get('industry')} company.

{footprint_data}

Missing data categories: {', '.join(missing_categories) if missing_categories else 'None'}

Your task is to guide the user through complete emissions reporting by:
1. Prioritizing the most material emission sources for their industry
2. Asking specific, actionable questions
3. Providing context about why each data point matters
4. Making the process feel achievable, not overwhelming

Generate a conversational guidance message that:
- Acknowledges what they've completed so far
- Suggests the next most important data to enter
- Explains why it's important
- Gives examples of what to look for

Respond in JSON format:
{{
  "guidance_message": "Conversational message to the user",
  "next_steps": [
    {{
      "category": "electricity | fuel | travel | etc",
      "priority": "high | medium | low",
      "reason": "why this is important",
      "examples": ["concrete examples of what to enter"],
      "typical_sources": ["where to find this data"]
    }}
  ],
  "progress_encouragement": "Positive message about their progress",
  "completeness_score": <0-100>
}}"""
        
        return self.ai_service._call_gemini(prompt)


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


# ============================================================
# Phase 2: Multi-Modal Document Vision Service
# ============================================================

class GeminiVisionService:
    """
    Service for extracting structured data from documents using Gemini Vision API
    Handles utility bills, meter photos, fuel receipts, travel receipts, etc.
    """
    
    def __init__(self):
        """Initialize Gemini Vision API client"""
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if api_key and api_key != 'your-gemini-api-key-here':
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
                logger.info("Gemini Vision service initialized with gemini-2.0-flash-exp")
            except Exception as e:
                logger.error(f"Failed to configure Gemini Vision: {str(e)}")
                self.model = None
        else:
            logger.warning("Gemini API key not configured. Vision extraction will return mock data.")
            self.model = None
    
    def extract_from_utility_bill(
        self,
        file_data: bytes,
        mime_type: str,
        document_type: str = 'utility_bill'
    ) -> Dict[str, Any]:
        """
        Extract structured data from utility bills (electricity, gas, water)
        
        Args:
            file_data: Binary file content (PDF or image)
            mime_type: MIME type (application/pdf, image/jpeg, image/png)
            document_type: Specific type (utility_bill)
        
        Returns:
            {
                'success': bool,
                'extracted_data': {
                    'billing_period_start': 'YYYY-MM-DD',
                    'billing_period_end': 'YYYY-MM-DD',
                    'utility_type': 'electricity' | 'gas' | 'water',
                    'kwh_consumed': float,
                    'cubic_meters_gas': float,
                    'liters_water': float,
                    'total_cost': float,
                    'currency': 'USD',
                    'account_number': str,
                    'supplier_name': str,
                    'meter_reading_start': float,
                    'meter_reading_end': float
                },
                'confidence_score': float,  # 0-100
                'processing_time_ms': int,
                'fields': [  # Field-level details with bounding boxes
                    {
                        'field_name': str,
                        'field_value': str,
                        'confidence': float,
                        'bounding_box': {'x': int, 'y': int, 'width': int, 'height': int},
                        'page_number': int
                    }
                ]
            }
        """
        import time
        start_time = time.time()
        
        prompt = """
You are an expert at reading utility bills (electricity, gas, water).
Extract ALL relevant data from this utility bill image/PDF.

Required fields to extract:
- billing_period_start (format: YYYY-MM-DD)
- billing_period_end (format: YYYY-MM-DD)
- utility_type (electricity, gas, or water)
- kwh_consumed (for electricity, as float)
- cubic_meters_gas (for gas, as float)
- liters_water (for water, as float)
- total_cost (as float)
- currency (e.g., USD, EUR, GBP)
- account_number (string)
- supplier_name (string)
- meter_reading_start (float if available)
- meter_reading_end (float if available)

Return ONLY valid JSON in this exact format:
{
    "utility_type": "electricity",
    "billing_period_start": "2024-01-01",
    "billing_period_end": "2024-01-31",
    "kwh_consumed": 450.5,
    "total_cost": 125.30,
    "currency": "USD",
    "account_number": "123456789",
    "supplier_name": "City Electric Co",
    "meter_reading_start": 12345.0,
    "meter_reading_end": 12795.5,
    "confidence": 85.5
}

If a field is not found, use null.
Include a "confidence" score (0-100) based on image quality and clarity.
"""
        
        try:
            if not self.model:
                # Return mock data for testing
                logger.warning("Using mock extraction data - Gemini Vision not configured")
                return {
                    'success': True,
                    'extracted_data': {
                        'utility_type': 'electricity',
                        'billing_period_start': '2024-12-01',
                        'billing_period_end': '2024-12-31',
                        'kwh_consumed': 450.5,
                        'total_cost': 125.30,
                        'currency': 'USD',
                        'account_number': 'MOCK-12345',
                        'supplier_name': 'Mock Electric Co',
                        'meter_reading_start': 10000.0,
                        'meter_reading_end': 10450.5
                    },
                    'confidence_score': 75.0,
                    'processing_time_ms': 100,
                    'fields': []
                }
            
            # Prepare file for Gemini Vision API
            import PIL.Image
            import io
            
            if mime_type == 'application/pdf':
                # Convert PDF to images using PyMuPDF (fitz)
                try:
                    import fitz  # PyMuPDF
                    
                    # Open PDF from bytes
                    pdf_document = fitz.open(stream=file_data, filetype="pdf")
                    
                    # Get first page (utility bills are usually single page or first page has key info)
                    page = pdf_document[0]
                    
                    # Render page to image (300 DPI for good quality)
                    zoom = 300 / 72  # 72 DPI is default, we want 300 DPI
                    mat = fitz.Matrix(zoom, zoom)
                    pix = page.get_pixmap(matrix=mat)
                    
                    # Convert to PIL Image
                    img_data = pix.tobytes("png")
                    image = PIL.Image.open(io.BytesIO(img_data))
                    
                    pdf_document.close()
                    logger.info(f"Converted PDF to image for extraction (page 1 of {len(pdf_document)})")
                    
                except ImportError:
                    logger.warning("PyMuPDF not installed - returning mock data for PDF")
                    return self.extract_from_utility_bill(b'', 'image/jpeg', document_type)
                except Exception as e:
                    logger.error(f"PDF conversion failed: {str(e)}")
                    return {
                        'success': False,
                        'extracted_data': {},
                        'confidence_score': 0.0,
                        'processing_time_ms': int((time.time() - start_time) * 1000),
                        'error': f'PDF conversion failed: {str(e)}',
                        'fields': []
                    }
            else:
                # Handle images
                image = PIL.Image.open(io.BytesIO(file_data))
            
            # Call Gemini Vision API
            response = self.model.generate_content([prompt, image])
            response_text = response.text.strip()
            
            # Parse JSON response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                extracted_data = json.loads(json_match.group())
            else:
                extracted_data = json.loads(response_text)
            
            # Calculate processing time
            processing_time = int((time.time() - start_time) * 1000)
            
            # Extract confidence score
            confidence_score = extracted_data.pop('confidence', 80.0)
            
            logger.info(
                f"Extracted utility bill data: {extracted_data.get('utility_type')} "
                f"({extracted_data.get('kwh_consumed', 0)} kWh) with {confidence_score}% confidence"
            )
            
            return {
                'success': True,
                'extracted_data': extracted_data,
                'confidence_score': float(confidence_score),
                'processing_time_ms': processing_time,
                'fields': []  # TODO: Implement field-level extraction with bounding boxes
            }
            
        except Exception as e:
            logger.error(f"Utility bill extraction failed: {str(e)}", exc_info=True)
            processing_time = int((time.time() - start_time) * 1000)
            return {
                'success': False,
                'extracted_data': {},
                'confidence_score': 0.0,
                'processing_time_ms': processing_time,
                'error': str(e),
                'fields': []
            }
    
    def read_meter_photo(
        self,
        image_data: bytes,
        meter_type: str = 'electricity'
    ) -> Dict[str, Any]:
        """
        Extract meter readings from photos
        
        Args:
            image_data: Binary image content
            meter_type: Type of meter (electricity, gas, water)
        
        Returns:
            {
                'success': bool,
                'meter_reading': float,
                'meter_type': str,
                'reading_date': 'YYYY-MM-DD',
                'confidence_score': float,
                'unit': 'kWh' | 'cubic_meters' | 'liters'
            }
        """
        import time
        start_time = time.time()
        
        prompt = f"""
You are an expert at reading utility meters from photos.
This is a {meter_type} meter. Read the current meter value displayed.

Return ONLY valid JSON in this exact format:
{{
    "meter_reading": 12345.67,
    "meter_type": "{meter_type}",
    "unit": "kWh",
    "confidence": 90.0,
    "notes": "Clear digital display"
}}

If the meter reading is unclear, provide your best estimate and lower the confidence score.
"""
        
        try:
            if not self.model:
                logger.warning("Using mock meter reading - Gemini Vision not configured")
                return {
                    'success': True,
                    'meter_reading': 10450.5,
                    'meter_type': meter_type,
                    'unit': 'kWh' if meter_type == 'electricity' else 'cubic_meters',
                    'confidence_score': 80.0,
                    'processing_time_ms': 50
                }
            
            # Load image
            import PIL.Image
            import io
            image = PIL.Image.open(io.BytesIO(image_data))
            
            # Call Gemini Vision
            response = self.model.generate_content([prompt, image])
            response_text = response.text.strip()
            
            # Parse response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response_text)
            
            processing_time = int((time.time() - start_time) * 1000)
            confidence = result.pop('confidence', 85.0)
            
            return {
                'success': True,
                **result,
                'confidence_score': float(confidence),
                'processing_time_ms': processing_time
            }
            
        except Exception as e:
            logger.error(f"Meter photo reading failed: {str(e)}", exc_info=True)
            processing_time = int((time.time() - start_time) * 1000)
            return {
                'success': False,
                'meter_reading': 0.0,
                'meter_type': meter_type,
                'confidence_score': 0.0,
                'processing_time_ms': processing_time,
                'error': str(e)
            }
    
    def extract_from_fuel_receipt(
        self,
        file_data: bytes,
        mime_type: str
    ) -> Dict[str, Any]:
        """
        Extract fuel purchase data from receipts
        
        Args:
            file_data: Binary file content
            mime_type: MIME type
        
        Returns:
            {
                'success': bool,
                'extracted_data': {
                    'date': 'YYYY-MM-DD',
                    'fuel_type': 'gasoline' | 'diesel' | 'electric',
                    'quantity': float,
                    'quantity_unit': 'liters' | 'gallons' | 'kWh',
                    'total_cost': float,
                    'currency': str,
                    'station_name': str,
                    'location': str
                },
                'confidence_score': float
            }
        """
        import time
        start_time = time.time()
        
        prompt = """
You are an expert at reading fuel receipts.
Extract ALL relevant data from this fuel/charging receipt.

Required fields:
- date (YYYY-MM-DD)
- fuel_type (gasoline, diesel, electric, etc.)
- quantity (as float)
- quantity_unit (liters, gallons, kWh, etc.)
- total_cost (as float)
- currency (USD, EUR, GBP, etc.)
- station_name (string)
- location (city/address if available)

Return ONLY valid JSON:
{
    "date": "2024-12-15",
    "fuel_type": "gasoline",
    "quantity": 45.2,
    "quantity_unit": "liters",
    "total_cost": 67.80,
    "currency": "USD",
    "station_name": "Shell Station",
    "location": "123 Main St",
    "confidence": 88.0
}
"""
        
        try:
            if not self.model:
                logger.warning("Using mock fuel receipt data - Gemini Vision not configured")
                return {
                    'success': True,
                    'extracted_data': {
                        'date': '2024-12-15',
                        'fuel_type': 'gasoline',
                        'quantity': 45.2,
                        'quantity_unit': 'liters',
                        'total_cost': 67.80,
                        'currency': 'USD',
                        'station_name': 'Mock Gas Station',
                        'location': 'Mock City'
                    },
                    'confidence_score': 75.0,
                    'processing_time_ms': 80
                }
            
            # Load image
            import PIL.Image
            import io
            
            if mime_type == 'application/pdf':
                logger.warning("PDF fuel receipt extraction not fully implemented")
                return self.extract_from_fuel_receipt(b'', 'image/jpeg')
            
            image = PIL.Image.open(io.BytesIO(file_data))
            
            # Call Gemini Vision
            response = self.model.generate_content([prompt, image])
            response_text = response.text.strip()
            
            # Parse response
            import re
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                extracted_data = json.loads(json_match.group())
            else:
                extracted_data = json.loads(response_text)
            
            processing_time = int((time.time() - start_time) * 1000)
            confidence = extracted_data.pop('confidence', 82.0)
            
            logger.info(
                f"Extracted fuel receipt: {extracted_data.get('fuel_type')} "
                f"({extracted_data.get('quantity')} {extracted_data.get('quantity_unit')})"
            )
            
            return {
                'success': True,
                'extracted_data': extracted_data,
                'confidence_score': float(confidence),
                'processing_time_ms': processing_time
            }
            
        except Exception as e:
            logger.error(f"Fuel receipt extraction failed: {str(e)}", exc_info=True)
            processing_time = int((time.time() - start_time) * 1000)
            return {
                'success': False,
                'extracted_data': {},
                'confidence_score': 0.0,
                'processing_time_ms': processing_time,
                'error': str(e)
            }
