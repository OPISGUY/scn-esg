"""
Platform-specific integration services
"""
from typing import Dict, Any, List
from .oauth_utils import IntegrationClient
import logging

logger = logging.getLogger(__name__)


class XeroIntegration(IntegrationClient):
    """Xero accounting integration"""
    
    def fetch_invoices(self, start_date=None, end_date=None) -> List[Dict[str, Any]]:
        """Fetch invoices from Xero"""
        endpoint = '/api.xro/2.0/Invoices'
        params = {}
        
        if start_date:
            params['ModifiedAfter'] = start_date.isoformat()
        
        response = self.make_request('GET', endpoint, params=params)
        return response.get('Invoices', [])
    
    def fetch_bank_transactions(self, start_date=None) -> List[Dict[str, Any]]:
        """Fetch bank transactions from Xero"""
        endpoint = '/api.xro/2.0/BankTransactions'
        params = {}
        
        if start_date:
            params['ModifiedAfter'] = start_date.isoformat()
        
        response = self.make_request('GET', endpoint, params=params)
        return response.get('BankTransactions', [])
    
    def map_to_carbon_data(self, transactions: List[Dict]) -> List[Dict]:
        """Map Xero transactions to carbon emission data"""
        carbon_entries = []
        
        for transaction in transactions:
            # Example mapping - customize based on your needs
            category = transaction.get('Type', '')
            amount = float(transaction.get('Total', 0))
            
            # Map financial categories to emission categories
            if 'travel' in category.lower() or 'transport' in category.lower():
                carbon_entries.append({
                    'category': 'transportation',
                    'amount': amount,
                    'date': transaction.get('Date'),
                    'description': transaction.get('Description', ''),
                    'external_id': transaction.get('BankTransactionID'),
                })
            elif 'fuel' in category.lower() or 'energy' in category.lower():
                carbon_entries.append({
                    'category': 'energy',
                    'amount': amount,
                    'date': transaction.get('Date'),
                    'description': transaction.get('Description', ''),
                    'external_id': transaction.get('BankTransactionID'),
                })
        
        return carbon_entries


class QuickBooksIntegration(IntegrationClient):
    """QuickBooks accounting integration"""
    
    def fetch_expenses(self, start_date=None) -> List[Dict[str, Any]]:
        """Fetch expenses from QuickBooks"""
        endpoint = '/v3/company/{realm_id}/query'
        query = "SELECT * FROM Purchase"
        
        if start_date:
            query += f" WHERE MetaData.LastUpdatedTime >= '{start_date.isoformat()}'"
        
        params = {'query': query}
        response = self.make_request('GET', endpoint, params=params)
        
        return response.get('QueryResponse', {}).get('Purchase', [])
    
    def map_to_carbon_data(self, expenses: List[Dict]) -> List[Dict]:
        """Map QuickBooks expenses to carbon emission data"""
        carbon_entries = []
        
        for expense in expenses:
            # Map QB categories to emission types
            line_items = expense.get('Line', [])
            
            for item in line_items:
                description = item.get('Description', '').lower()
                amount = float(item.get('Amount', 0))
                
                if 'utility' in description or 'electric' in description:
                    carbon_entries.append({
                        'category': 'electricity',
                        'amount': amount,
                        'date': expense.get('TxnDate'),
                        'description': item.get('Description'),
                        'external_id': expense.get('Id'),
                    })
        
        return carbon_entries


class SalesforceIntegration(IntegrationClient):
    """Salesforce CRM integration"""
    
    def fetch_accounts(self) -> List[Dict[str, Any]]:
        """Fetch accounts from Salesforce"""
        endpoint = '/services/data/v57.0/query/'
        params = {
            'q': 'SELECT Id, Name, Industry, NumberOfEmployees FROM Account'
        }
        
        response = self.make_request('GET', endpoint, params=params)
        return response.get('records', [])
    
    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        """Fetch opportunities from Salesforce"""
        endpoint = '/services/data/v57.0/query/'
        params = {
            'q': 'SELECT Id, Name, Amount, CloseDate FROM Opportunity WHERE IsClosed = false'
        }
        
        response = self.make_request('GET', endpoint, params=params)
        return response.get('records', [])


class AWSIntegration(IntegrationClient):
    """AWS Cloud integration for emissions tracking"""
    
    def fetch_ec2_usage(self, start_date, end_date) -> List[Dict[str, Any]]:
        """Fetch EC2 usage metrics"""
        # This would use AWS Cost Explorer API
        endpoint = '/cost-explorer/v1/GetCostAndUsage'
        
        params = {
            'TimePeriod': {
                'Start': start_date.strftime('%Y-%m-%d'),
                'End': end_date.strftime('%Y-%m-%d')
            },
            'Granularity': 'DAILY',
            'Metrics': ['UsageQuantity'],
            'GroupBy': [
                {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                {'Type': 'DIMENSION', 'Key': 'INSTANCE_TYPE'}
            ]
        }
        
        response = self.make_request('POST', endpoint, json=params)
        return response.get('ResultsByTime', [])
    
    def map_to_carbon_data(self, usage_data: List[Dict]) -> List[Dict]:
        """Map AWS usage to carbon emissions"""
        carbon_entries = []
        
        # AWS emission factors (example values - use real data)
        emission_factors = {
            'ec2': 0.000379,  # kg CO2 per vCPU hour
            's3': 0.0000019,  # kg CO2 per GB-month
        }
        
        for entry in usage_data:
            service = entry.get('Groups', [{}])[0].get('Keys', [''])[0]
            usage = float(entry.get('Total', {}).get('UsageQuantity', {}).get('Amount', 0))
            
            if 'ec2' in service.lower():
                carbon_entries.append({
                    'category': 'cloud_computing',
                    'emissions': usage * emission_factors['ec2'],
                    'date': entry.get('TimePeriod', {}).get('Start'),
                    'description': f"AWS {service} usage",
                })
        
        return carbon_entries


class AzureIntegration(IntegrationClient):
    """Microsoft Azure cloud integration"""
    
    def fetch_consumption(self, start_date, end_date) -> List[Dict[str, Any]]:
        """Fetch Azure consumption data"""
        endpoint = f'/subscriptions/{self.credentials.get("subscription_id")}/providers/Microsoft.Consumption/usageDetails'
        
        params = {
            'api-version': '2021-10-01',
            '$filter': f"properties/usageStart ge '{start_date.isoformat()}' and properties/usageEnd le '{end_date.isoformat()}'"
        }
        
        response = self.make_request('GET', endpoint, params=params)
        return response.get('value', [])


class GoogleCloudIntegration(IntegrationClient):
    """Google Cloud Platform integration"""
    
    def fetch_carbon_footprint(self, start_date, end_date) -> List[Dict[str, Any]]:
        """Fetch GCP carbon footprint data"""
        # GCP provides carbon footprint data directly
        endpoint = '/v1/projects/{project_id}/carbonFootprint'
        
        params = {
            'startDate': start_date.strftime('%Y-%m-%d'),
            'endDate': end_date.strftime('%Y-%m-%d')
        }
        
        response = self.make_request('GET', endpoint, params=params)
        return response.get('carbonFootprint', [])


class SlackIntegration(IntegrationClient):
    """Slack integration for notifications"""
    
    def send_notification(self, channel: str, message: str) -> Dict[str, Any]:
        """Send notification to Slack channel"""
        endpoint = '/api/chat.postMessage'
        
        data = {
            'channel': channel,
            'text': message,
        }
        
        return self.make_request('POST', endpoint, json=data)
    
    def send_esg_report(self, channel: str, report_data: Dict) -> Dict[str, Any]:
        """Send formatted ESG report to Slack"""
        endpoint = '/api/chat.postMessage'
        
        blocks = [
            {
                'type': 'header',
                'text': {
                    'type': 'plain_text',
                    'text': '📊 ESG Report Summary'
                }
            },
            {
                'type': 'section',
                'fields': [
                    {
                        'type': 'mrkdwn',
                        'text': f"*Total Emissions:*\n{report_data.get('total_emissions')} tonnes CO2"
                    },
                    {
                        'type': 'mrkdwn',
                        'text': f"*Period:*\n{report_data.get('period')}"
                    }
                ]
            }
        ]
        
        data = {
            'channel': channel,
            'blocks': blocks
        }
        
        return self.make_request('POST', endpoint, json=data)


class TeamsIntegration(IntegrationClient):
    """Microsoft Teams integration"""
    
    def send_adaptive_card(self, webhook_url: str, card_data: Dict) -> Dict[str, Any]:
        """Send adaptive card to Teams channel"""
        import requests
        
        response = requests.post(webhook_url, json=card_data)
        response.raise_for_status()
        return response.json()


# Integration factory
INTEGRATION_CLASSES = {
    'xero': XeroIntegration,
    'quickbooks': QuickBooksIntegration,
    'salesforce': SalesforceIntegration,
    'aws': AWSIntegration,
    'azure': AzureIntegration,
    'google_cloud': GoogleCloudIntegration,
    'slack': SlackIntegration,
    'teams': TeamsIntegration,
}


def get_integration_client(connection):
    """Factory function to get the appropriate integration client"""
    provider_name = connection.provider.name.lower()
    client_class = INTEGRATION_CLASSES.get(provider_name, IntegrationClient)
    return client_class(connection)
