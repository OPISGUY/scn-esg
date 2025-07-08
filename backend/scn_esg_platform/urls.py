"""
URL configuration for scn_esg_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Health check endpoint for deployment monitoring"""
    return JsonResponse({
        'status': 'healthy',
        'version': '7.0.0',
        'environment': 'production' if not settings.DEBUG else 'development'
    })

def api_root(request):
    """API root endpoint with available endpoints"""
    return JsonResponse({
        'message': 'SCN ESG Platform API',
        'version': '7.0.0',
        'status': 'live',
        'endpoints': {
            'health': '/api/v1/health/',
            'auth': '/api/v1/auth/',
            'users': '/api/v1/users/',
            'companies': '/api/v1/companies/',
            'carbon': '/api/v1/carbon/',
            'ewaste': '/api/v1/ewaste/',
            'analytics': '/api/v1/analytics/',
            'admin': '/admin/',
            'compliance': '/compliance/'
        }
    })

urlpatterns = [
    # Root API endpoint
    path('', api_root, name='api_root'),
    
    path('admin/', admin.site.urls),
    
    # Health check endpoint
    path('api/v1/health/', health_check, name='health_check'),
    
    # API endpoints
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/companies/', include('companies.urls')),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/carbon/', include('carbon.urls')),
    path('api/v1/ewaste/', include('ewaste.urls')),
    path('api/v1/analytics/', include('analytics.urls')),
    path('compliance/', include('compliance.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
