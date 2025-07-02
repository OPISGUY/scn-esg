"""
CSRD Compliance Services

This module provides services for managing CSRD compliance,
including ESRS datapoint synchronization and regulatory updates.
"""

import json
import os
import requests
import subprocess
import tempfile
from typing import Dict, List, Any, Optional
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django.db import models
from .models import ESRSDatapointCatalog, RegulatoryUpdate
from .ai_services import ComplianceAIService


class ESRSDatapointService:
    """Service for managing ESRS datapoints and synchronization"""
    
    def __init__(self):
        self.ai_service = ComplianceAIService()
        self.parser_path = getattr(settings, 'ESRS_PARSER_PATH', None)
    
    def get_datapoints_count(self) -> Dict[str, int]:
        """Get count of datapoints by category"""
        return {
            'total': ESRSDatapointCatalog.objects.count(),
            'environment': ESRSDatapointCatalog.objects.filter(category='Environment').count(),
            'social': ESRSDatapointCatalog.objects.filter(category='Social').count(),
            'governance': ESRSDatapointCatalog.objects.filter(category='Governance').count(),
            'mandatory': ESRSDatapointCatalog.objects.filter(mandatory=True).count(),
        }
    
    def search_datapoints(self, query: str, category: Optional[str] = None) -> List[ESRSDatapointCatalog]:
        """Search datapoints by query and optional category"""
        datapoints = ESRSDatapointCatalog.objects.filter(
            models.Q(name__icontains=query) |
            models.Q(description__icontains=query) |
            models.Q(code__icontains=query)
        )
        
        if category:
            datapoints = datapoints.filter(category=category)
        
        return datapoints.order_by('standard', 'code')[:50]
    
    def get_datapoint_hierarchy(self) -> Dict[str, Any]:
        """Get datapoints organized by standard and section"""
        cache_key = 'esrs_datapoint_hierarchy'
        hierarchy = cache.get(cache_key)
        
        if hierarchy is None:
            hierarchy = {}
            datapoints = ESRSDatapointCatalog.objects.all().order_by('standard', 'section', 'code')
            
            for datapoint in datapoints:
                standard = datapoint.standard
                section = datapoint.section
                
                if standard not in hierarchy:
                    hierarchy[standard] = {}
                
                if section not in hierarchy[standard]:
                    hierarchy[standard][section] = []
                
                hierarchy[standard][section].append({
                    'id': datapoint.id,
                    'code': datapoint.code,
                    'name': datapoint.name,
                    'description': datapoint.description,
                    'mandatory': datapoint.mandatory,
                    'data_type': datapoint.data_type,
                    'unit': datapoint.unit,
                })
            
            # Cache for 1 hour
            cache.set(cache_key, hierarchy, 3600)
        
        return hierarchy
    
    def run_node_parser(self, taxonomy_path: str) -> List[Dict[str, Any]]:
        """Run the Node.js ESRS XBRL parser"""
        if not self.parser_path or not os.path.exists(self.parser_path):
            raise ValueError("ESRS parser not found. Please install esrs-xbrl-parser.")
        
        try:
            # Run the Node.js parser
            result = subprocess.run([
                'node', 
                os.path.join(self.parser_path, 'index.js'),
                '--input', taxonomy_path,
                '--output', 'json'
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                raise RuntimeError(f"Parser failed: {result.stderr}")
            
            # Parse the JSON output
            return json.loads(result.stdout)
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Parser timed out")
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Invalid JSON output from parser: {e}")
    
    def enhance_datapoint_with_ai(self, datapoint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance datapoint with AI-generated guidance"""
        try:
            prompt = f"""
            Create comprehensive guidance for this ESRS datapoint:
            
            Code: {datapoint_data['code']}
            Name: {datapoint_data['name']}
            Description: {datapoint_data['description']}
            Standard: {datapoint_data['standard']}
            Data Type: {datapoint_data['data_type']}
            Unit: {datapoint_data.get('unit', 'N/A')}
            Mandatory: {datapoint_data['mandatory']}
            
            Provide structured guidance with:
            1. Data Collection Methods
            2. Common Data Sources
            3. Calculation Methodology (if applicable)
            4. Quality Assurance Steps
            5. Reporting Challenges
            6. Example Values/Formats
            7. Validation Criteria
            
            Make it actionable for compliance teams.
            """
            
            ai_guidance = self.ai_service.generate_content(prompt)
            datapoint_data['ai_guidance'] = ai_guidance
            
            # Generate example questions for data collection
            questions_prompt = f"""
            Generate 3-5 specific questions that compliance teams should ask when collecting data for:
            {datapoint_data['name']} ({datapoint_data['code']})
            
            Questions should be:
            - Specific and actionable
            - Help identify data sources
            - Address common gaps
            - Be suitable for interviews with business units
            
            Format as JSON array of strings.
            """
            
            questions = self.ai_service.generate_content(questions_prompt)
            try:
                datapoint_data['collection_questions'] = json.loads(questions)
            except:
                datapoint_data['collection_questions'] = []
            
        except Exception as e:
            datapoint_data['ai_guidance'] = f"AI enhancement failed: {str(e)}"
            datapoint_data['collection_questions'] = []
        
        return datapoint_data


class RegulatoryUpdateService:
    """Service for managing regulatory updates and monitoring"""
    
    def __init__(self):
        self.ai_service = ComplianceAIService()
    
    def fetch_efrag_updates(self) -> List[Dict[str, Any]]:
        """Fetch updates from EFRAG website"""
        updates = []
        
        # EFRAG updates RSS or API would go here
        # For now, return sample updates
        sample_updates = [
            {
                'title': 'ESRS Implementation Guidance Update',
                'source': 'EFRAG',
                'date': timezone.now().date(),
                'type': 'guidance',
                'description': 'Updated implementation guidance for ESRS E1 Climate Change',
                'url': 'https://www.efrag.org/news',
                'impact': 'medium'
            }
        ]
        
        return sample_updates
    
    def fetch_eur_lex_updates(self) -> List[Dict[str, Any]]:
        """Fetch updates from EUR-Lex"""
        updates = []
        
        try:
            # EUR-Lex API for CSRD-related updates
            api_url = "https://eur-lex.europa.eu/legal-content/EN/ALL/"
            # This would need proper API integration
            # For now, return sample updates
            
            sample_updates = [
                {
                    'title': 'Commission Delegated Regulation on ESRS',
                    'source': 'EUR-Lex',
                    'date': timezone.now().date(),
                    'type': 'regulation',
                    'description': 'Amendment to ESRS technical standards',
                    'url': 'https://eur-lex.europa.eu/',
                    'impact': 'high'
                }
            ]
            
            updates.extend(sample_updates)
            
        except Exception as e:
            print(f"Error fetching EUR-Lex updates: {e}")
        
        return updates
    
    def analyze_update_impact(self, update_data: Dict[str, Any]) -> str:
        """Analyze impact of regulatory update using AI"""
        try:
            prompt = f"""
            Analyze the impact of this regulatory update on CSRD compliance:
            
            Title: {update_data['title']}
            Source: {update_data['source']}
            Type: {update_data['type']}
            Description: {update_data['description']}
            
            Provide:
            1. Impact Assessment (High/Medium/Low)
            2. Affected ESRS Standards
            3. Required Actions
            4. Timeline Considerations
            5. Implementation Complexity
            
            Keep it concise and actionable.
            """
            
            return self.ai_service.generate_content(prompt)
            
        except Exception as e:
            return f"Impact analysis failed: {str(e)}"
    
    def create_regulatory_update(self, update_data: Dict[str, Any]) -> RegulatoryUpdate:
        """Create a regulatory update record"""
        impact_assessment = self.analyze_update_impact(update_data)
        
        return RegulatoryUpdate.objects.create(
            title=update_data['title'],
            source=update_data['source'],
            update_type=update_data['type'],
            description=update_data['description'],
            source_url=update_data.get('url', ''),
            published_date=update_data.get('date'),
            impact_assessment=impact_assessment,
            status='active'
        )
    
    def get_recent_updates(self, days: int = 30) -> List[RegulatoryUpdate]:
        """Get recent regulatory updates"""
        since_date = timezone.now().date() - timezone.timedelta(days=days)
        
        return RegulatoryUpdate.objects.filter(
            published_date__gte=since_date
        ).order_by('-published_date')
    
    def monitor_regulatory_changes(self) -> Dict[str, Any]:
        """Monitor and fetch all regulatory changes"""
        results = {
            'efrag_updates': [],
            'eur_lex_updates': [],
            'created_count': 0,
            'errors': []
        }
        
        try:
            # Fetch EFRAG updates
            efrag_updates = self.fetch_efrag_updates()
            results['efrag_updates'] = efrag_updates
            
            # Fetch EUR-Lex updates
            eur_lex_updates = self.fetch_eur_lex_updates()
            results['eur_lex_updates'] = eur_lex_updates
            
            # Create update records
            all_updates = efrag_updates + eur_lex_updates
            for update_data in all_updates:
                try:
                    # Check if update already exists
                    existing = RegulatoryUpdate.objects.filter(
                        title=update_data['title'],
                        source=update_data['source']
                    ).first()
                    
                    if not existing:
                        self.create_regulatory_update(update_data)
                        results['created_count'] += 1
                        
                except Exception as e:
                    results['errors'].append(f"Failed to create update: {str(e)}")
            
        except Exception as e:
            results['errors'].append(f"Monitoring failed: {str(e)}")
        
        return results


class ComplianceReportingService:
    """Service for generating compliance reports"""
    
    def __init__(self):
        self.ai_service = ComplianceAIService()
    
    def generate_datapoint_coverage_report(self) -> Dict[str, Any]:
        """Generate report on datapoint coverage"""
        total_datapoints = ESRSDatapointCatalog.objects.count()
        mandatory_datapoints = ESRSDatapointCatalog.objects.filter(mandatory=True).count()
        
        # Group by standard
        standards_coverage = {}
        for standard in ['ESRS E1', 'ESRS E2', 'ESRS E3', 'ESRS E4', 'ESRS E5', 
                        'ESRS S1', 'ESRS S2', 'ESRS S3', 'ESRS S4', 'ESRS G1']:
            count = ESRSDatapointCatalog.objects.filter(standard=standard).count()
            standards_coverage[standard] = count
        
        return {
            'total_datapoints': total_datapoints,
            'mandatory_datapoints': mandatory_datapoints,
            'optional_datapoints': total_datapoints - mandatory_datapoints,
            'standards_coverage': standards_coverage,
            'generated_at': timezone.now().isoformat()
        }
    
    def generate_compliance_readiness_report(self) -> Dict[str, Any]:
        """Generate compliance readiness assessment"""
        # This would analyze actual compliance data
        # For now, provide framework
        
        return {
            'overall_readiness': 'In Progress',
            'mandatory_datapoints_ready': 0,
            'total_mandatory': ESRSDatapointCatalog.objects.filter(mandatory=True).count(),
            'key_gaps': [
                'GHG emissions data collection',
                'Workforce diversity metrics',
                'Water consumption tracking'
            ],
            'recommendations': [
                'Implement automated data collection systems',
                'Train data collectors on ESRS requirements',
                'Establish data quality controls'
            ],
            'generated_at': timezone.now().isoformat()
        }
