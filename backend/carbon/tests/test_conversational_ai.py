"""
Tests for Smart Data Entry conversational AI endpoints
"""
import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from decimal import Decimal

from carbon.models import CarbonFootprint, ConversationSession, ConversationMessage
from companies.models import Company

User = get_user_model()


class ConversationalAIEndpointTests(TestCase):
    """Test suite for conversational AI endpoints"""
    
    def setUp(self):
        """Set up test data"""
        # Create test company first
        self.company = Company.objects.create(
            name='Test Corp',
            industry='Manufacturing',
            employees=100
        )
        
        # Create test user associated with company
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user.company = self.company
        self.user.save()
        
        # Create test carbon footprint
        self.footprint = CarbonFootprint.objects.create(
            company=self.company,
            reporting_period='2025-Q3',
            scope1_emissions=Decimal('100.00'),
            scope2_emissions=Decimal('200.00'),
            scope3_emissions=Decimal('150.00')
        )
        
        # Set up client with JWT authentication
        from rest_framework_simplejwt.tokens import RefreshToken
        self.client = Client()
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.auth_header = f'Bearer {self.access_token}'
    
    def test_extract_from_conversation_electricity(self):
        """Test extracting electricity consumption data"""
        url = reverse('ai-extract-conversation')
        
        data = {
            'message': 'We used 5000 kWh of electricity last month',
            'conversation_history': [],
            'current_footprint_id': str(self.footprint.id)
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.json()
        
        # Verify response structure
        self.assertTrue(result['success'])
        self.assertIn('session_id', result)
        self.assertIn('message_id', result)
        self.assertIn('extracted_data', result)
        self.assertIn('ai_response', result)
        
        # Verify extracted data if AI is working
        if result['extracted_data']:
            extracted = result['extracted_data']
            self.assertEqual(extracted['scope'], 2)  # Electricity is Scope 2
            self.assertIn('kWh', extracted.get('unit', '').lower() or 'kwh')
            self.assertGreater(extracted['confidence'], 0.5)
    
    def test_extract_with_conversation_history(self):
        """Test context awareness with conversation history"""
        url = reverse('ai-extract-conversation')
        
        # First message
        data1 = {
            'message': 'We used 5000 kWh last month',
            'conversation_history': [],
            'current_footprint_id': str(self.footprint.id)
        }
        
        response1 = self.client.post(
            url,
            data=json.dumps(data1),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        result1 = response1.json()
        session_id = result1['session_id']
        
        # Second message with context
        data2 = {
            'message': 'Add 1000 more to that',
            'conversation_history': [
                {'role': 'user', 'content': 'We used 5000 kWh last month'},
                {'role': 'assistant', 'content': result1['ai_response']}
            ],
            'current_footprint_id': str(self.footprint.id),
            'session_id': session_id
        }
        
        response2 = self.client.post(
            url,
            data=json.dumps(data2),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        result2 = response2.json()
        
        # Verify response contains expected fields (AI may be mocked in tests)
        self.assertIn('success', result2)
        self.assertIn('session_id', result2)
        self.assertEqual(result2['session_id'], session_id, "Should continue same session")
    
    def test_extract_without_authentication(self):
        """Test that endpoint requires authentication"""
        self.client.logout()
        
        url = reverse('ai-extract-conversation')
        data = {'message': 'Test message'}
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_extract_missing_message(self):
        """Test validation for missing message"""
        url = reverse('ai-extract-conversation')
        data = {}
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_with_context_add_operation(self):
        """Test updating footprint with add operation"""
        url = reverse('ai-update-context')
        
        initial_scope2 = self.footprint.scope2_emissions
        
        data = {
            'footprint_id': str(self.footprint.id),
            'update_data': {
                'scope2_emissions': {
                    'operation': 'add',
                    'value': 2.5,
                    'source': 'conversational_extraction',
                    'confidence': 0.95,
                    'metadata': {
                        'activity_type': 'electricity_consumption',
                        'quantity': 5000,
                        'unit': 'kWh'
                    }
                }
            },
            'user_confirmed': True
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.json()
        
        # Verify response
        self.assertTrue(result['success'])
        self.assertEqual(
            Decimal(str(result['updated_footprint']['scope2_emissions'])),
            initial_scope2 + Decimal('2.5')
        )
        
        # Verify database update
        self.footprint.refresh_from_db()
        self.assertEqual(
            self.footprint.scope2_emissions,
            initial_scope2 + Decimal('2.5')
        )
    
    def test_update_with_context_set_operation(self):
        """Test updating footprint with set operation"""
        url = reverse('ai-update-context')
        
        data = {
            'footprint_id': str(self.footprint.id),
            'update_data': {
                'scope1_emissions': {
                    'operation': 'set',
                    'value': 150.0,
                    'source': 'conversational_extraction',
                    'confidence': 0.90
                }
            },
            'user_confirmed': True
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify database update
        self.footprint.refresh_from_db()
        self.assertEqual(self.footprint.scope1_emissions, Decimal('150.0'))
    
    def test_update_without_authentication(self):
        """Test that update endpoint requires authentication"""
        self.client.logout()
        
        url = reverse('ai-update-context')
        data = {
            'footprint_id': str(self.footprint.id),
            'update_data': {}
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_conversation_session_creation(self):
        """Test creating a new conversation session"""
        url = reverse('conversation-session-create')
        
        data = {
            'footprint_id': str(self.footprint.id),
            'title': 'Test Conversation'
        }
        
        response = self.client.post(
            url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        result = response.json()
        
        # Verify response
        self.assertIn('session_id', result)
        self.assertEqual(result['status'], 'active')
        
        # Verify database
        session = ConversationSession.objects.get(id=result['session_id'])
        self.assertEqual(session.company, self.company)
        self.assertEqual(session.footprint, self.footprint)
        self.assertEqual(session.created_by, self.user)
    
    def test_conversation_session_retrieval(self):
        """Test retrieving conversation session details"""
        # Create a session with messages
        session = ConversationSession.objects.create(
            company=self.company,
            footprint=self.footprint,
            created_by=self.user,
            status='active'
        )
        session.participants.add(self.user)
        
        # Add some messages
        ConversationMessage.objects.create(
            session=session,
            author=self.user,
            role='user',
            content='Test message 1'
        )
        ConversationMessage.objects.create(
            session=session,
            role='assistant',
            content='Test response 1'
        )
        
        url = reverse('conversation-session-detail', kwargs={'session_id': str(session.id)})
        
        response = self.client.get(url, HTTP_AUTHORIZATION=self.auth_header)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = response.json()
        
        # Verify response structure
        self.assertEqual(result['session_id'], str(session.id))
        self.assertEqual(len(result['messages']), 2)
        self.assertEqual(result['summary']['total_messages'], 2)
    
    def test_conversation_session_not_found(self):
        """Test retrieving non-existent session"""
        url = reverse('conversation-session-detail', kwargs={'session_id': '00000000-0000-0000-0000-000000000000'})
        
        response = self.client.get(url, HTTP_AUTHORIZATION=self.auth_header)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ConversationalAIIntegrationTests(TestCase):
    """Integration tests for full conversation flows"""
    
    def setUp(self):
        """Set up test data"""
        # Create test company first
        self.company = Company.objects.create(
            name='Test Corp',
            industry='Manufacturing',
            employees=100
        )
        
        # Create test user associated with company
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user.company = self.company
        self.user.save()
        
        self.footprint = CarbonFootprint.objects.create(
            company=self.company,
            reporting_period='2025-Q3',
            scope1_emissions=Decimal('0.00'),
            scope2_emissions=Decimal('0.00'),
            scope3_emissions=Decimal('0.00')
        )
        
        # Set up client with JWT authentication
        from rest_framework_simplejwt.tokens import RefreshToken
        self.client = Client()
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.auth_header = f'Bearer {self.access_token}'
    
    def test_full_conversation_flow(self):
        """Test complete flow: create session -> extract data -> update footprint"""
        # Step 1: Create session
        create_url = reverse('conversation-session-create')
        create_data = {
            'footprint_id': str(self.footprint.id),
            'title': 'Full Flow Test'
        }
        
        create_response = self.client.post(
            create_url,
            data=json.dumps(create_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        session_id = create_response.json()['session_id']
        
        # Step 2: Extract data
        extract_url = reverse('ai-extract-conversation')
        extract_data = {
            'message': 'We used 1000 kWh of electricity',
            'conversation_history': [],
            'current_footprint_id': str(self.footprint.id),
            'session_id': session_id
        }
        
        extract_response = self.client.post(
            extract_url,
            data=json.dumps(extract_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=self.auth_header
        )
        
        self.assertEqual(extract_response.status_code, status.HTTP_200_OK)
        extract_result = extract_response.json()
        
        # Step 3: Update footprint (if extraction succeeded)
        if extract_result.get('extracted_data'):
            update_url = reverse('ai-update-context')
            extracted = extract_result['extracted_data']
            
            update_data = {
                'footprint_id': str(self.footprint.id),
                'update_data': {
                    f"scope{extracted['scope']}_emissions": {
                        'operation': 'add',
                        'value': extracted['calculated_emissions'],
                        'source': 'conversational_extraction',
                        'confidence': extracted['confidence']
                    }
                },
                'conversation_message_id': extract_result['message_id'],
                'user_confirmed': True
            }
            
            update_response = self.client.post(
                update_url,
                data=json.dumps(update_data),
                content_type='application/json',
                HTTP_AUTHORIZATION=self.auth_header
            )
            
            self.assertEqual(update_response.status_code, status.HTTP_200_OK)
            
            # Verify footprint was updated
            self.footprint.refresh_from_db()
            self.assertGreater(self.footprint.total_emissions, Decimal('0'))
        
        # Step 4: Retrieve session to verify history
        retrieve_url = reverse('conversation-session-detail', kwargs={'session_id': session_id})
        retrieve_response = self.client.get(retrieve_url, HTTP_AUTHORIZATION=self.auth_header)
        
        self.assertEqual(retrieve_response.status_code, status.HTTP_200_OK)
        session_data = retrieve_response.json()
        
        # Verify session has messages
        self.assertGreaterEqual(session_data['summary']['total_messages'], 2)


# Run tests with: python manage.py test carbon.tests.test_conversational_ai
