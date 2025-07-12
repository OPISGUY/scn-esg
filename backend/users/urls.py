from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, auth_views, email_views

router = DefaultRouter()
router.register('', views.UserViewSet)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', auth_views.register, name='register'),
    path('auth/login/', auth_views.login, name='login'),
    path('auth/logout/', auth_views.logout, name='logout'),
    path('auth/profile/', auth_views.profile, name='profile'),
    path('auth/health/', auth_views.health, name='health'),
    path('auth/complete-onboarding/', auth_views.complete_onboarding, name='complete_onboarding'),
    
    # Email verification endpoints
    path('auth/send-verification/', email_views.send_verification_email_view, name='send_verification'),
    path('auth/verify-email/', email_views.verify_email, name='verify_email'),
    path('auth/forgot-password/', email_views.forgot_password, name='forgot_password'),
    path('auth/reset-password/', email_views.reset_password, name='reset_password'),
    
    # User management
    path('', include(router.urls)),
]
