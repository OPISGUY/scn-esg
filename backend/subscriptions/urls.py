from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionTierViewSet,
    SubscriptionViewSet,
    TransactionViewSet,
    create_carbon_credit_payment,
    stripe_webhook,
)

router = DefaultRouter()
router.register(r'tiers', SubscriptionTierViewSet, basename='subscription-tier')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('carbon-credits/create-payment/', create_carbon_credit_payment, name='carbon-credit-payment'),
    path('webhooks/stripe/', stripe_webhook, name='stripe-webhook'),
]
