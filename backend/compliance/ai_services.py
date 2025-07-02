import google.generativeai as genai
from django.conf import settings
from typing import Dict, List, Any
import json
import logging

logger = logging.getLogger(__name__)

class CSRDAIService:
    """AI Service for CSRD Compliance Analysis"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def analyze_csrd_readiness(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze CSRD readiness and generate gap analysis
        """
        prompt = f"""
        Analyze CSRD compliance readiness for this company:
        
        Company Profile:
        - Industry: {assessment_data.get('industry', 'Not specified')}
        - Size: {assessment_data.get('company_size')} ({assessment_data.get('employee_count')} employees)
        - Annual Revenue: €{assessment_data.get('annual_revenue_eur', 0):,.2f}
        - EU Operations: {assessment_data.get('has_eu_operations')}
        - Listed Company: {assessment_data.get('is_listed_company')}
        - CSRD Applicable: {assessment_data.get('csrd_applicable')}
        - First Reporting Year: {assessment_data.get('first_reporting_year')}
        
        Current ESG Data Status:
        - Carbon footprint tracking: {assessment_data.get('has_carbon_data', False)}
        - E-waste management: {assessment_data.get('has_ewaste_data', False)}
        - Social initiatives: {assessment_data.get('has_social_data', False)}
        - Governance framework: {assessment_data.get('has_governance_data', False)}
        
        Provide a comprehensive CSRD readiness analysis including:
        
        1. Overall readiness score (0-100)
        2. Gap analysis for each ESRS category (E1-E5, S1-S4, G1)
        3. Priority action items (top 10)
        4. Implementation timeline with milestones
        5. Resource requirements estimate
        6. Risk assessment and mitigation strategies
        
        Format response as JSON with the following structure:
        {{
            "overall_readiness_score": 0-100,
            "gap_analysis": {{
                "E1_climate": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "E2_pollution": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "E3_water": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "E4_biodiversity": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "E5_circular": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "S1_workforce": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "S2_value_chain": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "S3_communities": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "S4_consumers": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}},
                "G1_governance": {{"score": 0-100, "gaps": [], "priority": "high/medium/low"}}
            }},
            "priority_actions": [
                {{"action": "description", "priority": "critical/high/medium/low", "timeline": "weeks", "department": "responsible"}},
            ],
            "compliance_timeline": {{
                "phase1": {{"title": "", "duration_weeks": 0, "deliverables": []}},
                "phase2": {{"title": "", "duration_weeks": 0, "deliverables": []}},
                "phase3": {{"title": "", "duration_weeks": 0, "deliverables": []}}
            }},
            "resource_requirements": {{
                "internal_hours": 0,
                "external_consultant_hours": 0,
                "technology_costs": 0,
                "training_requirements": []
            }},
            "key_risks": [
                {{"risk": "description", "probability": "high/medium/low", "impact": "high/medium/low", "mitigation": "strategy"}}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Parse JSON response
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            analysis = json.loads(response_text)
            return analysis
            
        except Exception as e:
            logger.error(f"Error in CSRD readiness analysis: {str(e)}")
            return self._get_fallback_analysis()
    
    def generate_materiality_assessment(self, company_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate materiality assessment questionnaire
        """
        prompt = f"""
        Create a simplified materiality assessment questionnaire for CSRD compliance:
        
        Company: {company_profile.get('industry')} industry, {company_profile.get('employee_count')} employees
        
        Generate 15-20 key materiality questions covering:
        - Environmental impact areas (E1-E5)
        - Social impact areas (S1-S4) 
        - Governance aspects (G1)
        
        For each question provide:
        - Question text
        - ESRS category
        - Response options (Yes/No/Partially/Not Applicable)
        - Guidance text
        - Impact on reporting requirements
        
        Format as JSON array:
        [
            {{
                "id": "E1_1",
                "esrs_category": "E1",
                "question": "Does your company have significant GHG emissions?",
                "guidance": "Consider all direct and indirect emissions...",
                "response_options": ["Yes", "No", "Partially", "Not Applicable"],
                "impact_if_yes": "Requires detailed Scope 1, 2, 3 reporting"
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            questions = json.loads(response_text)
            return questions
            
        except Exception as e:
            logger.error(f"Error generating materiality assessment: {str(e)}")
            return self._get_fallback_materiality_questions()
    
    def analyze_regulatory_update(self, update_content: str, companies: List[Dict]) -> Dict[str, Any]:
        """
        Analyze regulatory update impact on companies
        """
        prompt = f"""
        Analyze this regulatory update and its impact:
        
        Update Content:
        {update_content}
        
        Analyze impact for companies in our database:
        {json.dumps(companies[:5], indent=2)}  # Limit to first 5 for prompt size
        
        Provide:
        1. Summary of key changes
        2. Impact level (High/Medium/Low/Informational)
        3. Affected ESRS datapoints
        4. Timeline for compliance
        5. Recommended actions for affected companies
        6. Which companies are most impacted
        
        Format as JSON:
        {{
            "summary": "Brief summary of changes",
            "impact_level": "High/Medium/Low/Informational",
            "key_changes": ["change1", "change2"],
            "affected_esrs": ["E1", "S1"],
            "compliance_deadline": "YYYY-MM-DD or null",
            "recommended_actions": [
                {{"action": "description", "priority": "high/medium/low", "timeline": "timeframe"}}
            ],
            "company_impact_analysis": [
                {{"company_id": "uuid", "impact_level": "high/medium/low", "specific_actions": []}}
            ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            if response_text.startswith('```json'):
                response_text = response_text[7:-3]
            elif response_text.startswith('```'):
                response_text = response_text[3:-3]
            
            analysis = json.loads(response_text)
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing regulatory update: {str(e)}")
            return {
                "summary": "Unable to analyze update automatically",
                "impact_level": "Medium",
                "key_changes": [],
                "affected_esrs": [],
                "compliance_deadline": None,
                "recommended_actions": [],
                "company_impact_analysis": []
            }
    
    def generate_executive_summary(self, carbon_data: Dict, compliance_data: Dict, company_info: Dict) -> str:
        """
        Generate AI-powered executive summary for reports
        """
        prompt = f"""
        Generate a professional executive summary for an ESG report:
        
        Company Information:
        - Name: {company_info.get('name')}
        - Industry: {company_info.get('industry')}
        - Employees: {company_info.get('employees')}
        
        Carbon Performance:
        - Total Emissions: {carbon_data.get('total', 0)} tCO₂e
        - Scope 1: {carbon_data.get('scope1', 0)} tCO₂e
        - Scope 2: {carbon_data.get('scope2', 0)} tCO₂e
        - Scope 3: {carbon_data.get('scope3', 0)} tCO₂e
        - Carbon Balance: {carbon_data.get('net_emissions', 0)} tCO₂e
        
        Compliance Status:
        - CSRD Readiness: {compliance_data.get('readiness_score', 0)}%
        - Missing Datapoints: {compliance_data.get('missing_datapoints', 0)}
        - High Priority Actions: {compliance_data.get('high_priority_actions', 0)}
        
        Write a 2-3 paragraph executive summary that:
        1. Highlights key achievements and progress
        2. Identifies main challenges and areas for improvement
        3. Outlines strategic priorities for the coming year
        4. Uses professional business language
        5. Includes specific metrics and percentages
        
        Keep it concise but comprehensive, suitable for board-level presentation.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Error generating executive summary: {str(e)}")
            return self._get_fallback_executive_summary(company_info.get('name', 'Company'))
    
    def _get_fallback_analysis(self) -> Dict[str, Any]:
        """Fallback analysis when AI fails"""
        return {
            "overall_readiness_score": 45,
            "gap_analysis": {
                "E1_climate": {"score": 60, "gaps": ["Scope 3 emissions data"], "priority": "high"},
                "E2_pollution": {"score": 30, "gaps": ["Pollution monitoring"], "priority": "medium"},
                "E3_water": {"score": 25, "gaps": ["Water usage data"], "priority": "medium"},
                "E4_biodiversity": {"score": 20, "gaps": ["Biodiversity impact assessment"], "priority": "low"},
                "E5_circular": {"score": 40, "gaps": ["Waste management data"], "priority": "medium"},
                "S1_workforce": {"score": 50, "gaps": ["Employee metrics"], "priority": "high"},
                "S2_value_chain": {"score": 30, "gaps": ["Supplier assessments"], "priority": "medium"},
                "S3_communities": {"score": 35, "gaps": ["Community impact data"], "priority": "medium"},
                "S4_consumers": {"score": 40, "gaps": ["Product safety data"], "priority": "medium"},
                "G1_governance": {"score": 55, "gaps": ["Board diversity metrics"], "priority": "high"}
            },
            "priority_actions": [
                {"action": "Implement Scope 3 emissions tracking", "priority": "critical", "timeline": "12 weeks", "department": "Sustainability"},
                {"action": "Establish ESG data collection processes", "priority": "high", "timeline": "8 weeks", "department": "Operations"}
            ],
            "compliance_timeline": {
                "phase1": {"title": "Data Collection Setup", "duration_weeks": 12, "deliverables": ["Data collection framework"]},
                "phase2": {"title": "Gap Remediation", "duration_weeks": 16, "deliverables": ["Complete datapoint collection"]},
                "phase3": {"title": "Reporting Preparation", "duration_weeks": 8, "deliverables": ["First CSRD report"]}
            },
            "resource_requirements": {
                "internal_hours": 800,
                "external_consultant_hours": 200,
                "technology_costs": 15000,
                "training_requirements": ["CSRD fundamentals", "Data collection training"]
            },
            "key_risks": [
                {"risk": "Insufficient data quality", "probability": "high", "impact": "high", "mitigation": "Implement data validation processes"}
            ]
        }
    
    def _get_fallback_materiality_questions(self) -> List[Dict[str, Any]]:
        """Fallback materiality questions when AI fails"""
        return [
            {
                "id": "E1_1",
                "esrs_category": "E1",
                "question": "Does your company have significant GHG emissions (>500 tCO2e annually)?",
                "guidance": "Consider all direct and indirect emissions from operations",
                "response_options": ["Yes", "No", "Partially", "Not Applicable"],
                "impact_if_yes": "Requires detailed Scope 1, 2, 3 reporting and transition plans"
            },
            {
                "id": "S1_1",
                "esrs_category": "S1",
                "question": "Does your company employ more than 250 people?",
                "guidance": "Include all employees, contractors, and temporary workers",
                "response_options": ["Yes", "No", "Partially", "Not Applicable"],
                "impact_if_yes": "Requires comprehensive workforce metrics and policies"
            }
        ]
    
    def _get_fallback_executive_summary(self, company_name: str) -> str:
        """Fallback executive summary when AI fails"""
        return f"""
        {company_name} continues to advance its sustainability journey with measurable progress across environmental, social, and governance dimensions. The company has established foundational ESG data collection and reporting processes, positioning itself well for upcoming CSRD compliance requirements.
        
        Key areas of focus include enhancing carbon footprint measurement capabilities, particularly for Scope 3 emissions, and strengthening data collection processes across all ESRS categories. The organization has demonstrated commitment to transparency and continuous improvement in sustainability performance.
        
        Moving forward, strategic priorities include completing the CSRD readiness assessment, implementing comprehensive ESG data management systems, and developing robust internal controls for sustainability reporting. These initiatives will ensure compliance readiness while supporting the company's broader sustainability objectives.
        """


class ComplianceNotificationService:
    """Service for compliance-related notifications"""
    
    def __init__(self):
        self.ai_service = CSRDAIService()
    
    def send_assessment_completion_notification(self, assessment):
        """Send notification when CSRD assessment is completed"""
        # Implementation for email notifications
        pass
    
    def send_regulatory_update_notifications(self, update, affected_companies):
        """Send notifications about regulatory updates"""
        # Implementation for regulatory update notifications
        pass
    
    def send_action_item_reminders(self, overdue_actions):
        """Send reminders for overdue compliance actions"""
        # Implementation for action item reminders
        pass


class ComplianceAIService:
    """AI Service for General Compliance Tasks"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_content(self, prompt: str) -> str:
        """Generate AI content for compliance guidance"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating AI content: {str(e)}")
            return f"AI guidance unavailable: {str(e)}"
    
    def analyze_regulatory_impact(self, update_text: str) -> Dict[str, Any]:
        """Analyze the impact of regulatory updates"""
        prompt = f"""
        Analyze this regulatory update and assess its impact:
        
        {update_text}
        
        Provide analysis in JSON format:
        {{
            "impact_level": "high/medium/low",
            "affected_areas": ["list of affected compliance areas"],
            "recommended_actions": ["list of recommended actions"],
            "timeline": "suggested implementation timeline",
            "key_changes": ["list of key changes"]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parse JSON response
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    "impact_level": "medium",
                    "affected_areas": ["General compliance"],
                    "recommended_actions": ["Review update details"],
                    "timeline": "30 days",
                    "key_changes": ["Regulatory change detected"]
                }
        except Exception as e:
            logger.error(f"Error analyzing regulatory impact: {str(e)}")
            return {
                "impact_level": "unknown",
                "affected_areas": ["Unknown"],
                "recommended_actions": ["Manual review required"],
                "timeline": "Unknown",
                "key_changes": ["Analysis unavailable"]
            }
