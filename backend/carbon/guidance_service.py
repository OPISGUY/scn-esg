# backend/carbon/guidance_service.py
"""
Proactive Guidance Service for Smart Data Entry

This service provides:
1. Completeness scoring - tracks data coverage by scope and activity
2. Missing data detection - identifies gaps in emissions reporting
3. Onboarding wizard flow - guides new users through first footprint
4. Seasonal reminders - suggests data entry at appropriate times
5. Smart suggestions - recommends next actions based on context
"""

from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Tuple
import calendar


class GuidanceService:
    """Service for providing proactive guidance to users"""
    
    # Required activities for a complete footprint by scope
    SCOPE_ACTIVITIES = {
        'scope1': [
            'natural_gas',
            'fuel_oil',
            'diesel',
            'gasoline',
            'process_emissions',
        ],
        'scope2': [
            'electricity',
        ],
        'scope3': [
            'business_travel',
            'employee_commuting',
            'purchased_goods',
            'waste_disposal',
            'upstream_transport',
        ],
    }
    
    # Minimum thresholds for considering data "complete"
    COMPLETENESS_THRESHOLDS = {
        'scope1': 0.60,  # 60% of activities reported
        'scope2': 1.00,  # 100% - electricity is mandatory
        'scope3': 0.40,  # 40% of activities (Scope 3 is often partial)
    }
    
    def __init__(self, company):
        """Initialize guidance service for a company"""
        self.company = company
    
    def calculate_completeness_score(self, footprint) -> Dict:
        """
        Calculate completeness score for a carbon footprint
        
        Returns:
        {
            'overall_score': 0.75,  # 0-1 scale
            'scope1_score': 0.80,
            'scope2_score': 1.00,
            'scope3_score': 0.40,
            'missing_activities': ['natural_gas', 'business_travel'],
            'completion_percentage': 75,
            'grade': 'B',  # A/B/C/D/F
        }
        """
        from .models import CarbonFootprintData
        
        # Get all activities reported for this footprint
        reported_activities = set(
            CarbonFootprintData.objects.filter(footprint=footprint)
            .values_list('activity_type', flat=True)
            .distinct()
        )
        
        # Calculate completeness by scope
        scope_scores = {}
        missing_by_scope = {}
        
        for scope, required_activities in self.SCOPE_ACTIVITIES.items():
            required_set = set(required_activities)
            reported_in_scope = required_set.intersection(reported_activities)
            
            if len(required_set) > 0:
                score = len(reported_in_scope) / len(required_set)
            else:
                score = 0.0
            
            scope_scores[f'{scope}_score'] = round(score, 2)
            missing_by_scope[scope] = list(required_set - reported_in_scope)
        
        # Calculate overall score (weighted by importance)
        overall_score = (
            scope_scores['scope1_score'] * 0.35 +
            scope_scores['scope2_score'] * 0.35 +
            scope_scores['scope3_score'] * 0.30
        )
        
        # Determine grade
        if overall_score >= 0.90:
            grade = 'A'
        elif overall_score >= 0.75:
            grade = 'B'
        elif overall_score >= 0.60:
            grade = 'C'
        elif overall_score >= 0.40:
            grade = 'D'
        else:
            grade = 'F'
        
        # Flatten missing activities
        all_missing = []
        for scope, activities in missing_by_scope.items():
            all_missing.extend(activities)
        
        return {
            'overall_score': round(overall_score, 2),
            **scope_scores,
            'missing_activities': all_missing,
            'missing_by_scope': missing_by_scope,
            'completion_percentage': round(overall_score * 100),
            'grade': grade,
            'meets_minimum': all([
                scope_scores['scope1_score'] >= self.COMPLETENESS_THRESHOLDS['scope1'],
                scope_scores['scope2_score'] >= self.COMPLETENESS_THRESHOLDS['scope2'],
                scope_scores['scope3_score'] >= self.COMPLETENESS_THRESHOLDS['scope3'],
            ]),
        }
    
    def detect_missing_data(self, footprint) -> List[Dict]:
        """
        Identify missing data and generate alerts
        
        Returns list of alerts with priority and suggestions:
        [
            {
                'priority': 'high',
                'scope': 'scope2',
                'activity': 'electricity',
                'message': 'You haven't reported electricity usage yet.',
                'suggestion': 'Upload your utility bill or enter kWh manually.',
                'action': 'add_electricity',
            }
        ]
        """
        completeness = self.calculate_completeness_score(footprint)
        alerts = []
        
        for scope, missing_activities in completeness['missing_by_scope'].items():
            for activity in missing_activities:
                priority = self._determine_priority(scope, activity)
                
                alert = {
                    'priority': priority,
                    'scope': scope,
                    'activity': activity,
                    'message': self._generate_missing_data_message(activity),
                    'suggestion': self._generate_suggestion(activity),
                    'action': f'add_{activity}',
                }
                alerts.append(alert)
        
        # Sort by priority (high first)
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        alerts.sort(key=lambda x: priority_order[x['priority']])
        
        return alerts
    
    def _determine_priority(self, scope: str, activity: str) -> str:
        """Determine priority level for missing activity"""
        # Electricity is always high priority (mandatory)
        if activity == 'electricity':
            return 'high'
        
        # Scope 1 direct emissions are high priority
        if scope == 'scope1' and activity in ['natural_gas', 'fuel_oil', 'diesel', 'gasoline']:
            return 'high'
        
        # Scope 3 is typically lower priority
        if scope == 'scope3':
            return 'low'
        
        return 'medium'
    
    def _generate_missing_data_message(self, activity: str) -> str:
        """Generate friendly message for missing activity"""
        messages = {
            'electricity': "You haven't reported electricity usage yet. This is usually the biggest emission source!",
            'natural_gas': "Natural gas usage is missing. Do you use gas for heating, hot water, or processes?",
            'fuel_oil': "Fuel oil usage not reported. Do you use fuel oil for heating?",
            'diesel': "Diesel consumption is missing. Do you have diesel vehicles or generators?",
            'gasoline': "Gasoline usage not reported. Do you have company vehicles?",
            'business_travel': "Business travel emissions are missing. Does your team travel for work (flights, rental cars)?",
            'employee_commuting': "Employee commuting is missing. This can be a significant Scope 3 source.",
            'purchased_goods': "Purchased goods emissions are missing. Consider adding supplier data.",
            'waste_disposal': "Waste disposal emissions not reported. Track landfill and recycling data.",
        }
        return messages.get(activity, f"{activity.replace('_', ' ').title()} data is missing.")
    
    def _generate_suggestion(self, activity: str) -> str:
        """Generate actionable suggestion for missing activity"""
        suggestions = {
            'electricity': "Upload your utility bill or enter kWh usage for each month.",
            'natural_gas': "Check your utility bills for therms or kWh of natural gas.",
            'fuel_oil': "Enter gallons of fuel oil purchased or consumed.",
            'diesel': "Track diesel fuel purchases in gallons or liters.",
            'gasoline': "Record gasoline purchases from company credit cards.",
            'business_travel': "Upload flight booking confirmations or enter miles traveled.",
            'employee_commuting': "Survey employees about daily commute distance and mode.",
            'purchased_goods': "Contact suppliers for emissions data or estimate based on spend.",
            'waste_disposal': "Get waste hauler data on tons to landfill vs. recycled.",
        }
        return suggestions.get(activity, f"Add {activity.replace('_', ' ')} data when available.")
    
    def generate_onboarding_flow(self) -> List[Dict]:
        """
        Generate step-by-step onboarding wizard based on company profile
        
        Returns list of wizard steps:
        [
            {
                'step': 1,
                'title': 'Welcome to Carbon Tracking',
                'description': 'Let's set up your first footprint...',
                'questions': [...],
                'estimated_time': '5 minutes',
            }
        ]
        """
        # Detect company characteristics
        has_vehicles = self._company_likely_has_vehicles()
        has_facilities = self._company_likely_has_facilities()
        employee_count = getattr(self.company, 'employee_count', 0)
        
        steps = []
        
        # Step 1: Company profile
        steps.append({
            'step': 1,
            'title': 'Tell Us About Your Company',
            'description': 'Help us understand your business so we can guide you to the right data.',
            'questions': [
                {
                    'id': 'industry',
                    'type': 'select',
                    'label': 'What industry are you in?',
                    'options': ['Manufacturing', 'Office/Services', 'Retail', 'Healthcare', 'Technology', 'Other'],
                    'required': True,
                },
                {
                    'id': 'employee_count',
                    'type': 'number',
                    'label': 'How many employees do you have?',
                    'required': True,
                },
                {
                    'id': 'has_facilities',
                    'type': 'boolean',
                    'label': 'Do you own or lease office/facility space?',
                    'required': True,
                },
            ],
            'estimated_time': '2 minutes',
        })
        
        # Step 2: Electricity (always included)
        steps.append({
            'step': 2,
            'title': 'Electricity Usage (Scope 2)',
            'description': 'Electricity is typically the largest emission source. Lets start here.',
            'questions': [
                {
                    'id': 'electricity_method',
                    'type': 'select',
                    'label': 'How would you like to report electricity?',
                    'options': [
                        'Upload utility bills',
                        'Enter kWh manually',
                        'I need to find this data first'
                    ],
                    'required': True,
                },
            ],
            'activity': 'electricity',
            'scope': 'scope2',
            'estimated_time': '3 minutes',
        })
        
        # Step 3: Heating/Cooling (if has facilities)
        if has_facilities:
            steps.append({
                'step': 3,
                'title': 'Heating & Cooling (Scope 1)',
                'description': 'Do you use natural gas, fuel oil, or propane for heating?',
                'questions': [
                    {
                        'id': 'heating_type',
                        'type': 'multi_select',
                        'label': 'What fuel sources do you use?',
                        'options': ['Natural gas', 'Fuel oil', 'Propane', 'None (all-electric)', 'Not sure'],
                        'required': True,
                    },
                ],
                'activity': 'natural_gas',
                'scope': 'scope1',
                'estimated_time': '3 minutes',
            })
        
        # Step 4: Company vehicles (if applicable)
        if has_vehicles or employee_count > 10:
            steps.append({
                'step': 4,
                'title': 'Transportation (Scope 1 & 3)',
                'description': 'Company vehicles, deliveries, and business travel add up quickly.',
                'questions': [
                    {
                        'id': 'has_vehicles',
                        'type': 'boolean',
                        'label': 'Do you have company-owned vehicles?',
                        'required': True,
                    },
                    {
                        'id': 'vehicle_count',
                        'type': 'number',
                        'label': 'How many vehicles?',
                        'show_if': 'has_vehicles',
                    },
                    {
                        'id': 'has_travel',
                        'type': 'boolean',
                        'label': 'Do employees travel for business (flights, rental cars)?',
                        'required': True,
                    },
                ],
                'activity': 'vehicle_fuel',
                'scope': 'scope1',
                'estimated_time': '4 minutes',
            })
        
        # Step 5: Scope 3 basics
        steps.append({
            'step': 5,
            'title': 'Supply Chain & Other Sources (Scope 3)',
            'description': 'These are optional for now, but important for a complete picture.',
            'questions': [
                {
                    'id': 'track_scope3',
                    'type': 'boolean',
                    'label': 'Would you like to track Scope 3 emissions now?',
                    'help_text': 'You can always add this later.',
                    'required': False,
                },
            ],
            'activity': 'purchased_goods',
            'scope': 'scope3',
            'estimated_time': '5 minutes',
            'optional': True,
        })
        
        # Step 6: Summary
        steps.append({
            'step': 6,
            'title': 'You Are All Set!',
            'description': 'We have created your first footprint. Now lets start adding data.',
            'questions': [],
            'estimated_time': '1 minute',
            'final': True,
        })
        
        return steps
    
    def _company_likely_has_vehicles(self) -> bool:
        """Detect if company likely has vehicles based on industry"""
        industry = getattr(self.company, 'industry', '').lower()
        vehicle_industries = ['manufacturing', 'retail', 'logistics', 'construction', 'delivery']
        return any(ind in industry for ind in vehicle_industries)
    
    def _company_likely_has_facilities(self) -> bool:
        """Detect if company likely has physical facilities"""
        # Most companies have some facility unless they're 100% remote
        return True  # Default assumption
    
    def generate_seasonal_reminders(self, current_date: datetime = None) -> List[Dict]:
        """
        Generate time-appropriate reminders for data entry
        
        Examples:
        - End of month: "Ready to report March data?"
        - End of quarter: "Q1 is complete - update your quarterly footprint"
        - Year-end: "2025 is wrapping up - finalize your annual report"
        """
        if current_date is None:
            current_date = timezone.now()
        
        reminders = []
        
        # End of month reminder
        last_day = calendar.monthrange(current_date.year, current_date.month)[1]
        if current_date.day >= last_day - 5:  # Last 5 days of month
            prev_month = (current_date.replace(day=1) - timedelta(days=1)).strftime('%B')
            reminders.append({
                'type': 'monthly',
                'priority': 'high',
                'title': f'Time to Report {prev_month} Data',
                'message': f'The month of {prev_month} just ended. Ready to add your utility bills and fuel data?',
                'action': 'open_data_entry',
            })
        
        # End of quarter reminder
        if current_date.month in [3, 6, 9, 12] and current_date.day >= 25:
            quarter = (current_date.month - 1) // 3 + 1
            reminders.append({
                'type': 'quarterly',
                'priority': 'high',
                'title': f'Q{quarter} Data Collection',
                'message': f'Quarter {quarter} is ending. Make sure you have reported all emissions for the quarter.',
                'action': 'review_completeness',
            })
        
        # Year-end reminder
        if current_date.month == 12 and current_date.day >= 20:
            reminders.append({
                'type': 'annual',
                'priority': 'high',
                'title': f'{current_date.year} Annual Report',
                'message': f'{current_date.year} is almost over. Start preparing your annual sustainability report.',
                'action': 'generate_annual_report',
            })
        
        # Utility bill cycle reminder (mid-month)
        if 10 <= current_date.day <= 20:
            reminders.append({
                'type': 'utility_cycle',
                'priority': 'medium',
                'title': 'Utility Bills Arriving',
                'message': 'Your utility bills should be arriving soon. Upload them when they arrive for automatic data extraction.',
                'action': 'upload_documents',
            })
        
        return reminders
    
    def suggest_next_actions(self, footprint) -> List[Dict]:
        """
        Suggest smart next actions based on current state
        
        Returns prioritized list of recommendations:
        [
            {
                'priority': 'high',
                'title': 'Add Electricity Data',
                'reason': 'Electricity is missing and is usually your largest emission source',
                'action': 'add_electricity',
                'estimated_impact': '40-60% of total emissions',
            }
        ]
        """
        from .models import CarbonFootprintData
        
        actions = []
        completeness = self.calculate_completeness_score(footprint)
        
        # Check for missing critical data
        if 'electricity' in completeness['missing_activities']:
            actions.append({
                'priority': 'high',
                'title': 'Add Electricity Usage',
                'reason': 'Electricity is missing and typically represents 40-60% of total emissions',
                'action': 'add_electricity',
                'estimated_impact': '40-60% of total emissions',
                'icon': '⚡',
            })
        
        # Check for incomplete months
        data_count = CarbonFootprintData.objects.filter(footprint=footprint).count()
        if data_count < 3:
            actions.append({
                'priority': 'high',
                'title': 'Add More Monthly Data',
                'reason': f'You only have {data_count} data entries. Add more months for accurate trends.',
                'action': 'add_monthly_data',
                'estimated_impact': 'Better trend analysis',
                'icon': '📅',
            })
        
        # Suggest document upload if no documents yet
        from .models import UploadedDocument
        doc_count = UploadedDocument.objects.filter(company=self.company).count()
        if doc_count == 0:
            actions.append({
                'priority': 'medium',
                'title': 'Upload Utility Bills',
                'reason': 'Save time by uploading bills for automatic data extraction',
                'action': 'upload_documents',
                'estimated_impact': '70% faster data entry',
                'icon': '📄',
            })
        
        # Suggest Scope 3 if Scope 1+2 are complete
        if completeness['scope1_score'] >= 0.8 and completeness['scope2_score'] >= 0.8:
            if completeness['scope3_score'] < 0.3:
                actions.append({
                    'priority': 'medium',
                    'title': 'Start Tracking Scope 3',
                    'reason': 'Your Scope 1 & 2 data is solid. Scope 3 is often 50%+ of total emissions.',
                    'action': 'add_scope3',
                    'estimated_impact': 'Complete emissions picture',
                    'icon': '🌍',
                })
        
        # Suggest benchmarking if data is complete
        if completeness['overall_score'] >= 0.75:
            actions.append({
                'priority': 'low',
                'title': 'Compare to Industry Peers',
                'reason': 'Your data looks great! See how you stack up against similar companies.',
                'action': 'view_benchmarking',
                'estimated_impact': 'Identify improvement opportunities',
                'icon': '📊',
            })
        
        return actions
# Force Render rebuild - syntax fix
