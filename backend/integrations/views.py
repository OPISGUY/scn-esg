"""
API views for integrations
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid
import logging

from .models import (
    IntegrationProvider,
    IntegrationConnection,
    IntegrationSyncLog,
    WebhookEndpoint,
    IntegrationDataMapping
)
from .serializers import (
    IntegrationProviderSerializer,
    IntegrationConnectionSerializer,
    IntegrationConnectionCreateSerializer,
    IntegrationSyncLogSerializer,
    WebhookEndpointSerializer,
    IntegrationDataMappingSerializer,
    OAuthAuthorizeSerializer,
    OAuthCallbackSerializer,
    SyncTriggerSerializer
)
from .oauth_utils import OAuthHandler, CredentialEncryption
from .services import get_integration_client
from .tasks import sync_integration_data

logger = logging.getLogger(__name__)


class IntegrationProviderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing available integration providers
    """
    queryset = IntegrationProvider.objects.filter(is_active=True)
    serializer_class = IntegrationProviderSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get list of provider categories"""
        categories = IntegrationProvider.objects.filter(
            is_active=True
        ).values_list('category', flat=True).distinct()
        
        return Response({
            'categories': list(categories)
        })


class IntegrationConnectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing integration connections
    """
    serializer_class = IntegrationConnectionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return IntegrationConnection.objects.filter(
            user=self.request.user
        ).select_related('provider', 'company')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def trigger_sync(self, request, pk=None):
        """Manually trigger a data sync"""
        connection = self.get_object()
        
        serializer = SyncTriggerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create sync log
        sync_log = IntegrationSyncLog.objects.create(
            connection=connection,
            sync_type='manual',
            status='started'
        )
        
        # Trigger async task
        try:
            sync_integration_data.delay(
                connection_id=str(connection.id),
                sync_log_id=str(sync_log.id),
                **serializer.validated_data
            )
            
            return Response({
                'message': 'Sync started',
                'sync_log_id': sync_log.id
            }, status=status.HTTP_202_ACCEPTED)
        
        except Exception as e:
            logger.error(f"Failed to start sync: {str(e)}")
            sync_log.status = 'failed'
            sync_log.error_message = str(e)
            sync_log.save()
            
            return Response({
                'error': 'Failed to start sync',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        """Disconnect an integration"""
        connection = self.get_object()
        connection.status = 'disconnected'
        connection.auto_sync_enabled = False
        connection.save()
        
        return Response({
            'message': 'Integration disconnected successfully'
        })
    
    @action(detail=True, methods=['post'])
    def reconnect(self, request, pk=None):
        """Reconnect a disconnected integration"""
        connection = self.get_object()
        
        # Check if token is still valid
        if connection.is_token_expired():
            return Response({
                'error': 'Token expired. Please re-authorize.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        connection.status = 'active'
        connection.auto_sync_enabled = True
        connection.save()
        
        return Response({
            'message': 'Integration reconnected successfully'
        })
    
    @action(detail=True, methods=['get'])
    def sync_history(self, request, pk=None):
        """Get sync history for a connection"""
        connection = self.get_object()
        logs = connection.sync_logs.all()[:20]  # Last 20 syncs
        
        serializer = IntegrationSyncLogSerializer(logs, many=True)
        return Response(serializer.data)


class IntegrationSyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing sync logs
    """
    serializer_class = IntegrationSyncLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return IntegrationSyncLog.objects.filter(
            connection__user=self.request.user
        ).select_related('connection', 'connection__provider')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def oauth_authorize(request):
    """
    Initiate OAuth authorization flow
    """
    serializer = OAuthAuthorizeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    provider_id = serializer.validated_data['provider_id']
    redirect_uri = serializer.validated_data['redirect_uri']
    
    provider = get_object_or_404(IntegrationProvider, id=provider_id)
    
    if provider.auth_method != 'oauth2':
        return Response({
            'error': 'Provider does not use OAuth'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate state token for CSRF protection
    state = str(uuid.uuid4())
    
    # Store state in session
    request.session[f'oauth_state_{state}'] = {
        'provider_id': str(provider_id),
        'redirect_uri': redirect_uri,
        'timestamp': timezone.now().isoformat()
    }
    
    # Generate authorization URL
    oauth_handler = OAuthHandler(provider)
    auth_url = oauth_handler.get_authorization_url(redirect_uri, state)
    
    return Response({
        'authorization_url': auth_url,
        'state': state
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def oauth_callback(request):
    """
    Handle OAuth callback and exchange code for tokens
    """
    serializer = OAuthCallbackSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code = serializer.validated_data['code']
    state = serializer.validated_data['state']
    
    # Verify state
    session_key = f'oauth_state_{state}'
    state_data = request.session.get(session_key)
    
    if not state_data:
        return Response({
            'error': 'Invalid state parameter'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    provider_id = state_data['provider_id']
    redirect_uri = state_data['redirect_uri']
    
    # Clean up session
    del request.session[session_key]
    
    # Get provider
    provider = get_object_or_404(IntegrationProvider, id=provider_id)
    
    try:
        # Exchange code for tokens
        oauth_handler = OAuthHandler(provider)
        token_data = oauth_handler.exchange_code_for_token(code, redirect_uri)
        
        # Encrypt credentials
        encrypted_creds = CredentialEncryption.encrypt_credentials(token_data)
        
        # Create connection
        connection = IntegrationConnection.objects.create(
            user=request.user,
            provider=provider,
            connection_name=f"{provider.display_name} Connection",
            status='active',
            encrypted_credentials=encrypted_creds,
            access_token_expires_at=token_data.get('access_token_expires_at'),
            refresh_token_expires_at=token_data.get('refresh_token_expires_at'),
            next_sync_at=timezone.now() + timedelta(minutes=60)
        )
        
        serializer = IntegrationConnectionSerializer(connection)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"OAuth callback failed: {str(e)}")
        return Response({
            'error': 'Failed to complete authorization',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_with_api_key(request):
    """
    Connect integration using API key (non-OAuth providers)
    """
    serializer = IntegrationConnectionCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    provider_id = serializer.validated_data['provider_id']
    api_key = serializer.validated_data.get('api_key')
    connection_name = serializer.validated_data['connection_name']
    
    if not api_key:
        return Response({
            'error': 'API key is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    provider = get_object_or_404(IntegrationProvider, id=provider_id)
    
    if provider.auth_method != 'api_key':
        return Response({
            'error': 'Provider does not use API key authentication'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Encrypt credentials
    credentials = {'api_key': api_key}
    encrypted_creds = CredentialEncryption.encrypt_credentials(credentials)
    
    # Create connection
    connection = IntegrationConnection.objects.create(
        user=request.user,
        provider=provider,
        connection_name=connection_name,
        status='active',
        encrypted_credentials=encrypted_creds,
        next_sync_at=timezone.now() + timedelta(minutes=60)
    )
    
    serializer = IntegrationConnectionSerializer(connection)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def webhook_receiver(request, provider_name, connection_id):
    """
    Generic webhook receiver for all platforms
    
    This endpoint receives webhooks from external platforms
    URL pattern: /api/v1/integrations/webhooks/<provider>/<connection_id>/
    """
    try:
        connection = IntegrationConnection.objects.get(
            id=connection_id,
            provider__name=provider_name,
            status='active'
        )
    except IntegrationConnection.DoesNotExist:
        return Response({
            'error': 'Connection not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Verify webhook signature (provider-specific)
    # TODO: Implement signature verification
    
    # Log the webhook
    logger.info(f"Received webhook from {provider_name} for connection {connection_id}")
    
    # Process webhook data
    event_type = request.data.get('type') or request.data.get('event_type')
    
    # Update webhook endpoint stats
    webhook = WebhookEndpoint.objects.filter(
        connection=connection,
        event_type=event_type
    ).first()
    
    if webhook:
        webhook.last_received_at = timezone.now()
        webhook.total_events_received += 1
        webhook.save()
    
    # Trigger sync based on webhook data
    sync_integration_data.delay(
        connection_id=str(connection.id),
        sync_log_id=None,
        sync_type='webhook'
    )
    
    return Response({'status': 'received'}, status=status.HTTP_200_OK)
