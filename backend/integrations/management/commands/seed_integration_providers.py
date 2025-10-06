"""
Management command to seed integration providers
"""
from django.core.management.base import BaseCommand
from integrations.models import IntegrationProvider, IntegrationDataMapping


class Command(BaseCommand):
    help = 'Seed integration providers in the database'

    def handle(self, *args, **options):
        providers_data = [
            # Accounting
            {
                'name': 'xero',
                'display_name': 'Xero',
                'category': 'accounting',
                'description': 'Sync financial data and emissions automatically from Xero accounting',
                'website_url': 'https://www.xero.com',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://login.xero.com/identity/connect/authorize',
                'oauth_token_url': 'https://identity.xero.com/connect/token',
                'oauth_scopes': ['accounting.transactions.read', 'accounting.contacts.read'],
                'api_base_url': 'https://api.xero.com',
                'supports_webhooks': True,
                'supports_real_time_sync': True,
            },
            {
                'name': 'quickbooks',
                'display_name': 'QuickBooks',
                'category': 'accounting',
                'description': 'Import transactions and calculate carbon footprint from QuickBooks',
                'website_url': 'https://quickbooks.intuit.com',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://appcenter.intuit.com/connect/oauth2',
                'oauth_token_url': 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
                'oauth_scopes': ['com.intuit.quickbooks.accounting'],
                'api_base_url': 'https://quickbooks.api.intuit.com',
                'supports_webhooks': True,
                'supports_real_time_sync': False,
            },
            # Cloud Providers
            {
                'name': 'aws',
                'display_name': 'AWS',
                'category': 'cloud',
                'description': 'Track cloud infrastructure emissions from Amazon Web Services',
                'website_url': 'https://aws.amazon.com',
                'auth_method': 'api_key',
                'api_base_url': 'https://api.aws.amazon.com',
                'supports_webhooks': False,
                'supports_real_time_sync': False,
            },
            {
                'name': 'azure',
                'display_name': 'Microsoft Azure',
                'category': 'cloud',
                'description': 'Monitor Microsoft cloud carbon footprint',
                'website_url': 'https://azure.microsoft.com',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                'oauth_token_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                'oauth_scopes': ['https://management.azure.com/.default'],
                'api_base_url': 'https://management.azure.com',
                'supports_webhooks': True,
                'supports_real_time_sync': False,
            },
            {
                'name': 'google_cloud',
                'display_name': 'Google Cloud',
                'category': 'cloud',
                'description': 'Calculate GCP service emissions',
                'website_url': 'https://cloud.google.com',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://accounts.google.com/o/oauth2/v2/auth',
                'oauth_token_url': 'https://oauth2.googleapis.com/token',
                'oauth_scopes': ['https://www.googleapis.com/auth/cloud-platform.read-only'],
                'api_base_url': 'https://cloudresourcemanager.googleapis.com',
                'supports_webhooks': False,
                'supports_real_time_sync': False,
            },
            # CRM
            {
                'name': 'salesforce',
                'display_name': 'Salesforce',
                'category': 'crm',
                'description': 'Integrate customer and sustainability data from Salesforce',
                'website_url': 'https://www.salesforce.com',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://login.salesforce.com/services/oauth2/authorize',
                'oauth_token_url': 'https://login.salesforce.com/services/oauth2/token',
                'oauth_scopes': ['api', 'refresh_token'],
                'api_base_url': 'https://yourinstance.salesforce.com',
                'supports_webhooks': True,
                'supports_real_time_sync': True,
            },
            # Communication
            {
                'name': 'slack',
                'display_name': 'Slack',
                'category': 'communication',
                'description': 'Get ESG alerts and updates in Slack',
                'website_url': 'https://slack.com',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://slack.com/oauth/v2/authorize',
                'oauth_token_url': 'https://slack.com/api/oauth.v2.access',
                'oauth_scopes': ['chat:write', 'chat:write.public'],
                'api_base_url': 'https://slack.com/api',
                'supports_webhooks': True,
                'supports_real_time_sync': True,
            },
            {
                'name': 'teams',
                'display_name': 'Microsoft Teams',
                'category': 'communication',
                'description': 'Collaborate on sustainability goals in Microsoft Teams',
                'website_url': 'https://www.microsoft.com/en-us/microsoft-teams',
                'auth_method': 'oauth2',
                'oauth_authorize_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                'oauth_token_url': 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                'oauth_scopes': ['ChannelMessage.Send'],
                'api_base_url': 'https://graph.microsoft.com',
                'supports_webhooks': True,
                'supports_real_time_sync': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for provider_data in providers_data:
            provider, created = IntegrationProvider.objects.update_or_create(
                name=provider_data['name'],
                defaults=provider_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created provider: {provider.display_name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'Updated provider: {provider.display_name}'))

        self.stdout.write(self.style.SUCCESS(
            f'\nSeeding complete: {created_count} created, {updated_count} updated'
        ))
