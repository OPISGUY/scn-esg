"""
Tests for subscription tiers and checkout
"""
import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from subscriptions.models import SubscriptionTier, Subscription
from unittest.mock import patch, MagicMock

User = get_user_model()


@pytest.fixture
def api_client():
    """Fixture for API client"""
    return APIClient()


@pytest.fixture
def sample_user():
    """Create a sample user"""
    return User.objects.create_user(
        username='test@example.com',
        email='test@example.com',
        password='SecurePassword123!',
        first_name='Test',
        last_name='User',
    )


@pytest.fixture
def authenticated_client(api_client, sample_user):
    """Create authenticated client"""
    url = reverse('login')
    response = api_client.post(url, {
        'email': 'test@example.com',
        'password': 'SecurePassword123!',
    }, format='json')
    
    token = response.data['access']
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return api_client


@pytest.fixture
def sample_tiers():
    """Create sample subscription tiers"""
    tiers = []
    
    # Free tier
    tiers.append(SubscriptionTier.objects.create(
        tier='free',
        name='Free',
        description='Basic features',
        base_price_gbp=0.00,
        features={'carbon_tracking': True, 'ai_insights': False},
        limits={'data_points_per_month': 20},
        is_active=True,
        sort_order=1,
    ))
    
    # Starter tier
    tiers.append(SubscriptionTier.objects.create(
        tier='starter',
        name='Starter',
        description='For small teams',
        base_price_gbp=9.99,
        features={'carbon_tracking': True, 'ai_insights': True},
        limits={'data_points_per_month': 50},
        stripe_price_id_gbp='price_starter_gbp',
        stripe_price_id_usd='price_starter_usd',
        is_active=True,
        sort_order=2,
    ))
    
    # Professional tier
    tiers.append(SubscriptionTier.objects.create(
        tier='professional',
        name='Professional',
        description='For growing companies',
        base_price_gbp=19.99,
        features={'carbon_tracking': True, 'ai_insights': True, 'csrd_compliance': True},
        limits={'data_points_per_month': -1},  # Unlimited
        stripe_price_id_gbp='price_pro_gbp',
        stripe_price_id_usd='price_pro_usd',
        is_active=True,
        sort_order=3,
    ))
    
    return tiers


@pytest.mark.django_db
class TestPublicSubscriptionTiers:
    """Tests for public subscription tiers endpoint"""

    def test_get_public_tiers_unauthenticated(self, api_client, sample_tiers):
        """Test getting tiers without authentication"""
        url = reverse('public-subscription-tiers')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        
        # Verify tiers are sorted correctly
        assert response.data[0]['tier'] == 'free'
        assert response.data[1]['tier'] == 'starter'
        assert response.data[2]['tier'] == 'professional'

    def test_get_public_tiers_only_active(self, api_client, sample_tiers):
        """Test only active tiers are returned"""
        # Deactivate one tier
        starter_tier = SubscriptionTier.objects.get(tier='starter')
        starter_tier.is_active = False
        starter_tier.save()
        
        url = reverse('public-subscription-tiers')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        
        tiers = [t['tier'] for t in response.data]
        assert 'starter' not in tiers
        assert 'free' in tiers
        assert 'professional' in tiers


@pytest.mark.django_db
class TestCreateCheckoutSession:
    """Tests for creating Stripe checkout sessions"""

    @patch('subscriptions.views.StripeService.create_checkout_session')
    def test_create_checkout_authenticated(self, mock_stripe, authenticated_client, sample_tiers):
        """Test creating checkout session when authenticated"""
        # Mock Stripe response
        mock_stripe.return_value = {
            'session_id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/pay/cs_test_123',
            'customer_id': 'cus_test_123',
        }
        
        starter_tier = SubscriptionTier.objects.get(tier='starter')
        url = reverse('subscription-create-checkout-session')
        
        data = {
            'tier_id': starter_tier.id,
            'currency': 'GBP',
            'billing_cycle': 'monthly',
            'success_url': 'https://example.com/success',
            'cancel_url': 'https://example.com/cancel',
        }
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'session_id' in response.data
        assert 'url' in response.data
        assert mock_stripe.called

    def test_create_checkout_unauthenticated(self, api_client, sample_tiers):
        """Test creating checkout fails when not authenticated"""
        starter_tier = SubscriptionTier.objects.get(tier='starter')
        url = reverse('subscription-create-checkout-session')
        
        data = {
            'tier_id': starter_tier.id,
            'currency': 'GBP',
            'billing_cycle': 'monthly',
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_checkout_invalid_tier(self, authenticated_client):
        """Test creating checkout with invalid tier ID"""
        url = reverse('subscription-create-checkout-session')
        
        data = {
            'tier_id': 99999,  # Non-existent tier
            'currency': 'GBP',
            'billing_cycle': 'monthly',
        }
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_checkout_invalid_currency(self, authenticated_client, sample_tiers):
        """Test creating checkout with invalid currency"""
        starter_tier = SubscriptionTier.objects.get(tier='starter')
        url = reverse('subscription-create-checkout-session')
        
        data = {
            'tier_id': starter_tier.id,
            'currency': 'INVALID',
            'billing_cycle': 'monthly',
        }
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserSubscription:
    """Tests for user subscription management"""

    def test_get_subscription_authenticated(self, authenticated_client, sample_user, sample_tiers):
        """Test getting user subscription"""
        # Create subscription for user
        free_tier = SubscriptionTier.objects.get(tier='free')
        Subscription.objects.create(
            user=sample_user,
            tier=free_tier,
            status='active',
            currency='GBP',
            amount=0.00,
        )
        
        url = reverse('subscription-current')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['tier_details']['tier'] == 'free'

    def test_get_subscription_none_exists(self, authenticated_client):
        """Test getting subscription when none exists"""
        url = reverse('subscription-current')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestSubscriptionIntegration:
    """Integration tests for complete subscription flow"""

    @patch('subscriptions.views.StripeService.create_checkout_session')
    def test_complete_paid_signup_flow(self, mock_stripe, api_client, sample_tiers):
        """Test complete flow: register -> authenticate -> create checkout"""
        # Mock Stripe
        mock_stripe.return_value = {
            'session_id': 'cs_test_123',
            'url': 'https://checkout.stripe.com/pay/cs_test_123',
            'customer_id': 'cus_test_123',
        }
        
        # Step 1: Register
        register_url = reverse('register')
        register_data = {
            'email': 'newuser@example.com',
            'password': 'SecurePassword123!',
            'first_name': 'New',
            'last_name': 'User',
        }
        register_response = api_client.post(register_url, register_data, format='json')
        assert register_response.status_code == status.HTTP_201_CREATED
        
        # Step 2: Authenticate with token
        token = register_response.data['access']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Step 3: Create checkout session
        starter_tier = SubscriptionTier.objects.get(tier='starter')
        checkout_url = reverse('subscription-create-checkout-session')
        checkout_data = {
            'tier_id': starter_tier.id,
            'currency': 'GBP',
            'billing_cycle': 'monthly',
        }
        checkout_response = api_client.post(checkout_url, checkout_data, format='json')
        
        assert checkout_response.status_code == status.HTTP_200_OK
        assert 'url' in checkout_response.data
        assert mock_stripe.called

    def test_free_tier_signup_flow(self, api_client, sample_tiers):
        """Test complete free tier signup flow"""
        # Register with free tier intent
        register_url = reverse('register')
        register_data = {
            'email': 'freeuser@example.com',
            'password': 'SecurePassword123!',
            'first_name': 'Free',
            'last_name': 'User',
        }
        register_response = api_client.post(register_url, register_data, format='json')
        
        assert register_response.status_code == status.HTTP_201_CREATED
        assert 'access' in register_response.data
        
        # Verify user can login
        login_url = reverse('login')
        login_data = {
            'email': 'freeuser@example.com',
            'password': 'SecurePassword123!',
        }
        login_response = api_client.post(login_url, login_data, format='json')
        
        assert login_response.status_code == status.HTTP_200_OK
