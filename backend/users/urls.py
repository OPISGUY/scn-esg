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
    
    # Email verification endpoints (NEW - Phase 2)
    path('auth/send-verification/', views.send_verification_email_view, name='send_verification'),
    path('auth/verify-email/<str:uidb64>/<str:token>/', views.verify_email_view, name='verify_email'),
    path('auth/resend-verification/', views.send_verification_email_view, name='resend_verification'),
    
    # Password reset endpoints (NEW - Phase 2)
    path('auth/password-reset/', views.password_reset_request_view, name='password_reset_request'),
    path('auth/password-reset-confirm/<str:uidb64>/<str:token>/', views.password_reset_confirm_view, name='password_reset_confirm'),
    
    # Legacy email endpoints (kept for backward compatibility)
    path('auth/verify-email-legacy/', email_views.verify_email, name='verify_email_legacy'),
    path('auth/forgot-password/', email_views.forgot_password, name='forgot_password'),
    path('auth/reset-password/', email_views.reset_password, name='reset_password'),
    
    # User management
    path('', include(router.urls)),
]
