"""
Management command to seed subscription tiers with Stripe Price IDs
Usage: python manage.py seed_subscription_tiers
"""
from django.core.management.base import BaseCommand
from subscriptions.models import SubscriptionTier


class Command(BaseCommand):
    help = 'Seed subscription tiers with Stripe Price IDs'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding subscription tiers...')
        
        tiers_data = [
            {
                'tier': SubscriptionTier.FREE,
                'name': 'Free',
                'description': 'Basic tracking for individuals and small teams',
                'base_price_gbp': 0.00,
                'stripe_price_id_gbp': 'price_1SEgOh5ijEjjetJRlpXSLhK2',
                'sort_order': 0,
                'features': {
                    'carbon_tracking': True,
                    'carbon_data_points_per_month': 20,
                    'ewaste_tracking': True,
                    'ewaste_items': 50,
                    'esports': False,
                    'csrd_compliance': False,
                    'ai_insights': False,
                    'api_access': False,
                    'custom_branding': False,
                    'priority_support': False,
                },
                'limits': {
                    'users': 1,
                    'storage_mb': 25,
                    'data_retention_months': 6,
                    'reports_per_month': 1,
                }
            },
            {
                'tier': SubscriptionTier.STARTER,
                'name': 'Starter',
                'description': 'For small businesses and individual sustainability managers',
                'base_price_gbp': 9.99,
                'stripe_price_id_gbp': 'price_1SEgJC5ijEjjetJR9jjqJrlr',
                'sort_order': 1,
                'features': {
                    'carbon_tracking': True,
                    'carbon_data_points_per_month': 50,
                    'ewaste_tracking': True,
                    'ewaste_items': 100,
                    'csrd_compliance': True,
                    'csrd_datapoints': 10,
                    'ai_insights': True,
                    'ai_queries_per_month': 10,
                    'reports_per_month': 'unlimited',
                    'pdf_export': True,
                    'email_support': True,
                    'support_sla_hours': 48,
                    'carbon_marketplace_access': 'read_only',
                    'api_access': False,
                    'custom_branding': False,
                },
                'limits': {
                    'users': 1,
                    'storage_mb': 50,
                    'data_retention_months': 12,
                }
            },
            {
                'tier': SubscriptionTier.PROFESSIONAL,
                'name': 'Professional',
                'description': 'For growing companies and sustainability teams',
                'base_price_gbp': 19.99,
                'stripe_price_id_gbp': 'price_1SEgJC5ijEjjetJRlgQm9CJ7',
                'sort_order': 2,
                'features': {
                    'carbon_tracking': True,
                    'carbon_data_points_per_month': 'unlimited',
                    'ewaste_tracking': True,
                    'ewaste_items': 'unlimited',
                    'csrd_compliance': True,
                    'csrd_datapoints': 'all',
                    'ai_insights': True,
                    'ai_queries_per_month': 100,
                    'carbon_marketplace': True,
                    'scenario_modeling': True,
                    'custom_report_templates': True,
                    'priority_support': True,
                    'support_sla_hours': 24,
                    'slack_teams_integration': True,
                    'data_import_export': True,
                    'mobile_app_full': True,
                    'quarterly_strategy_sessions': 1,
                    'api_access': False,
                    'white_label': False,
                },
                'limits': {
                    'users': 5,
                    'storage_mb': 500,
                    'data_retention_months': 36,
                }
            },
            {
                'tier': SubscriptionTier.ENTERPRISE,
                'name': 'Enterprise',
                'description': 'For large organizations with advanced needs',
                'base_price_gbp': 30.00,
                'stripe_price_id_gbp': 'price_1SEgJC5ijEjjetJRXTbog8XM',
                'sort_order': 3,
                'features': {
                    'carbon_tracking': True,
                    'carbon_data_points_per_month': 'unlimited',
                    'ewaste_tracking': True,
                    'ewaste_items': 'unlimited',
                    'csrd_compliance': True,
                    'csrd_datapoints': 'all',
                    'ai_insights': True,
                    'ai_queries_per_month': 'unlimited',
                    'carbon_marketplace': True,
                    'advanced_trading_tools': True,
                    'api_access': True,
                    'api_types': ['REST', 'GraphQL'],
                    'white_label': True,
                    'dedicated_account_manager': True,
                    'priority_support': True,
                    'support_channels': ['phone', 'chat', 'email'],
                    'support_sla_hours': 4,
                    'multi_entity_management': True,
                    'custom_integrations': True,
                    'sso_saml': True,
                    'advanced_permissions': True,
                    'audit_trails': True,
                    'strategy_sessions': 'unlimited',
                    'beta_access': True,
                    'uptime_sla': '99.9%',
                },
                'limits': {
                    'users': 'unlimited',
                    'storage_gb': 10,
                    'data_retention': 'permanent',
                    'minimum_users': 3,
                }
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for tier_data in tiers_data:
            tier, created = SubscriptionTier.objects.update_or_create(
                tier=tier_data['tier'],
                defaults=tier_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {tier.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'  ↻ Updated: {tier.name}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nSuccessfully seeded {created_count} new tiers and updated {updated_count} existing tiers'
        ))
