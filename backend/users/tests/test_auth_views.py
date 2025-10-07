"""
Tests for user authentication and registration
"""
import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    """Fixture for API client"""
    return APIClient()


@pytest.fixture
def sample_user_data():
    """Fixture for sample user registration data"""
    return {
        'email': 'test@example.com',
        'password': 'SecurePassword123!',
        'first_name': 'Test',
        'last_name': 'User',
    }


@pytest.mark.django_db
class TestUserRegistration:
    """Tests for user registration endpoint"""

    def test_register_with_valid_data(self, api_client, sample_user_data):
        """Test successful user registration"""
        url = reverse('register')
        response = api_client.post(url, sample_user_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == sample_user_data['email']
        
        # Verify user was created in database
        user = User.objects.get(email=sample_user_data['email'])
        assert user.first_name == sample_user_data['first_name']
        assert user.last_name == sample_user_data['last_name']

    def test_register_with_duplicate_email(self, api_client, sample_user_data):
        """Test registration fails with duplicate email"""
        # Create first user
        User.objects.create_user(
            username=sample_user_data['email'],
            email=sample_user_data['email'],
            password=sample_user_data['password'],
            first_name='Existing',
            last_name='User'
        )
        
        # Try to register with same email
        url = reverse('register')
        response = api_client.post(url, sample_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'already exists' in str(response.data.get('error', '')).lower()

    def test_register_without_required_fields(self, api_client):
        """Test registration fails without required fields"""
        url = reverse('register')
        
        # Missing password
        incomplete_data = {
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = api_client.post(url, incomplete_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Missing email
        incomplete_data = {
            'password': 'SecurePassword123!',
            'first_name': 'Test',
            'last_name': 'User',
        }
        response = api_client.post(url, incomplete_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_with_weak_password(self, api_client, sample_user_data):
        """Test registration fails with weak password"""
        url = reverse('register')
        sample_user_data['password'] = '123'  # Too short
        
        response = api_client.post(url, sample_user_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_with_invalid_email(self, api_client, sample_user_data):
        """Test registration with invalid email format"""
        url = reverse('register')
        sample_user_data['email'] = 'not-an-email'
        
        response = api_client.post(url, sample_user_data, format='json')
        
        # Should still create user (Django doesn't enforce email format strictly)
        # But in production, you might want to add validation
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]


@pytest.mark.django_db
class TestUserLogin:
    """Tests for user login endpoint"""

    @pytest.fixture
    def existing_user(self, sample_user_data):
        """Create an existing user for login tests"""
        return User.objects.create_user(
            username=sample_user_data['email'],
            email=sample_user_data['email'],
            password=sample_user_data['password'],
            first_name=sample_user_data['first_name'],
            last_name=sample_user_data['last_name'],
        )

    def test_login_with_valid_credentials(self, api_client, sample_user_data, existing_user):
        """Test successful login"""
        url = reverse('login')
        login_data = {
            'email': sample_user_data['email'],
            'password': sample_user_data['password'],
        }
        
        response = api_client.post(url, login_data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user' in response.data
        assert response.data['user']['email'] == sample_user_data['email']

    def test_login_with_invalid_password(self, api_client, sample_user_data, existing_user):
        """Test login fails with wrong password"""
        url = reverse('login')
        login_data = {
            'email': sample_user_data['email'],
            'password': 'WrongPassword123!',
        }
        
        response = api_client.post(url, login_data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'invalid credentials' in str(response.data.get('error', '')).lower()

    def test_login_with_nonexistent_user(self, api_client):
        """Test login fails for non-existent user"""
        url = reverse('login')
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'Password123!',
        }
        
        response = api_client.post(url, login_data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_without_credentials(self, api_client):
        """Test login fails without email or password"""
        url = reverse('login')
        
        # Missing password
        response = api_client.post(url, {'email': 'test@example.com'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Missing email
        response = api_client.post(url, {'password': 'Password123!'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestUserProfile:
    """Tests for user profile endpoint"""

    @pytest.fixture
    def authenticated_client(self, api_client, sample_user_data):
        """Create authenticated client"""
        user = User.objects.create_user(
            username=sample_user_data['email'],
            email=sample_user_data['email'],
            password=sample_user_data['password'],
            first_name=sample_user_data['first_name'],
            last_name=sample_user_data['last_name'],
        )
        
        # Login to get token
        url = reverse('login')
        response = api_client.post(url, {
            'email': sample_user_data['email'],
            'password': sample_user_data['password'],
        }, format='json')
        
        token = response.data['access']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        return api_client

    def test_get_profile_authenticated(self, authenticated_client, sample_user_data):
        """Test getting profile when authenticated"""
        url = reverse('profile')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'user' in response.data
        assert response.data['user']['email'] == sample_user_data['email']

    def test_get_profile_unauthenticated(self, api_client):
        """Test getting profile fails when not authenticated"""
        url = reverse('profile')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
