"""
OAuth and credential encryption utilities for integrations
"""
import os
import base64
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from cryptography.fernet import Fernet


class CredentialEncryption:
    """Handle encryption/decryption of API credentials"""
    
    @staticmethod
    def get_encryption_key() -> bytes:
        """Get or generate encryption key from settings"""
        # In production, this should be stored in environment variable
        key = getattr(settings, 'INTEGRATION_ENCRYPTION_KEY', None)
        if not key:
            # Generate a key - WARNING: This should be stored persistently
            key = Fernet.generate_key()
        
        if isinstance(key, str):
            key = key.encode()
        
        return key
    
    @staticmethod
    def encrypt_credentials(credentials: Dict[str, Any]) -> str:
        """Encrypt credential dictionary to string"""
        key = CredentialEncryption.get_encryption_key()
        f = Fernet(key)
        
        json_str = json.dumps(credentials)
        encrypted = f.encrypt(json_str.encode())
        return base64.b64encode(encrypted).decode()
    
    @staticmethod
    def decrypt_credentials(encrypted_data: str) -> Dict[str, Any]:
        """Decrypt credentials string back to dictionary"""
        key = CredentialEncryption.get_encryption_key()
        f = Fernet(key)
        
        encrypted = base64.b64decode(encrypted_data.encode())
        decrypted = f.decrypt(encrypted)
        return json.loads(decrypted.decode())


class OAuthHandler:
    """Handle OAuth 2.0 flows for external platforms"""
    
    def __init__(self, provider):
        self.provider = provider
    
    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """Generate OAuth authorization URL"""
        from urllib.parse import urlencode
        
        params = {
            'client_id': self._get_client_id(),
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': ' '.join(self.provider.oauth_scopes),
            'state': state,
        }
        
        return f"{self.provider.oauth_authorize_url}?{urlencode(params)}"
    
    def exchange_code_for_token(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        import requests
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': self._get_client_id(),
            'client_secret': self._get_client_secret(),
        }
        
        response = requests.post(self.provider.oauth_token_url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        
        # Calculate expiration times
        now = timezone.now()
        token_data['access_token_expires_at'] = now + timedelta(
            seconds=token_data.get('expires_in', 3600)
        )
        
        if 'refresh_token' in token_data:
            # Most refresh tokens last 90 days, but this varies by provider
            token_data['refresh_token_expires_at'] = now + timedelta(days=90)
        
        return token_data
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh an expired access token"""
        import requests
        
        data = {
            'grant_type': 'refresh_token',
            'refresh_token': refresh_token,
            'client_id': self._get_client_id(),
            'client_secret': self._get_client_secret(),
        }
        
        response = requests.post(self.provider.oauth_token_url, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        
        # Calculate new expiration
        now = timezone.now()
        token_data['access_token_expires_at'] = now + timedelta(
            seconds=token_data.get('expires_in', 3600)
        )
        
        return token_data
    
    def _get_client_id(self) -> str:
        """Get OAuth client ID from settings"""
        provider_name = self.provider.name.upper()
        return getattr(
            settings,
            f'{provider_name}_CLIENT_ID',
            os.getenv(f'{provider_name}_CLIENT_ID', '')
        )
    
    def _get_client_secret(self) -> str:
        """Get OAuth client secret from settings"""
        provider_name = self.provider.name.upper()
        return getattr(
            settings,
            f'{provider_name}_CLIENT_SECRET',
            os.getenv(f'{provider_name}_CLIENT_SECRET', '')
        )


class IntegrationClient:
    """Base class for platform-specific API clients"""
    
    def __init__(self, connection):
        self.connection = connection
        self.provider = connection.provider
        self.credentials = CredentialEncryption.decrypt_credentials(
            connection.encrypted_credentials
        )
    
    def get_headers(self) -> Dict[str, str]:
        """Get authentication headers for API requests"""
        if self.provider.auth_method == 'oauth2':
            # Check if token needs refresh
            if self.connection.needs_refresh():
                self.refresh_token()
            
            return {
                'Authorization': f"Bearer {self.credentials.get('access_token')}",
                'Content-Type': 'application/json',
            }
        
        elif self.provider.auth_method == 'api_key':
            return {
                'Authorization': f"Bearer {self.credentials.get('api_key')}",
                'Content-Type': 'application/json',
            }
        
        return {'Content-Type': 'application/json'}
    
    def refresh_token(self):
        """Refresh OAuth token if needed"""
        if self.provider.auth_method != 'oauth2':
            return
        
        oauth_handler = OAuthHandler(self.provider)
        new_tokens = oauth_handler.refresh_access_token(
            self.credentials.get('refresh_token')
        )
        
        # Update credentials
        self.credentials.update(new_tokens)
        self.connection.encrypted_credentials = CredentialEncryption.encrypt_credentials(
            self.credentials
        )
        self.connection.access_token_expires_at = new_tokens['access_token_expires_at']
        self.connection.save()
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make authenticated API request"""
        import requests
        
        url = f"{self.provider.api_base_url}{endpoint}"
        headers = self.get_headers()
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            **kwargs
        )
        
        response.raise_for_status()
        return response.json()
