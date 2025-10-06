"""
URL configuration for integrations app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'providers', views.IntegrationProviderViewSet, basename='integration-provider')
router.register(r'connections', views.IntegrationConnectionViewSet, basename='integration-connection')
router.register(r'sync-logs', views.IntegrationSyncLogViewSet, basename='integration-sync-log')

app_name = 'integrations'

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # OAuth endpoints
    path('oauth/authorize/', views.oauth_authorize, name='oauth-authorize'),
    path('oauth/callback/', views.oauth_callback, name='oauth-callback'),
    
    # API key connection
    path('connect/api-key/', views.connect_with_api_key, name='connect-api-key'),
    
    # Webhook receiver
    path('webhooks/<str:provider_name>/<uuid:connection_id>/', views.webhook_receiver, name='webhook-receiver'),
]
