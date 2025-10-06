from rest_framework import serializers
from .models import SubscriptionTier, Subscription, Transaction, CarbonCreditTransaction


class SubscriptionTierSerializer(serializers.ModelSerializer):
    """Serializer for subscription tiers"""
    
    class Meta:
        model = SubscriptionTier
        fields = [
            'id',
            'tier',
            'name',
            'description',
            'base_price_gbp',
            'features',
            'limits',
            'stripe_price_id_gbp',
            'stripe_price_id_usd',
            'stripe_price_id_eur',
            'is_active',
            'sort_order',
        ]
        read_only_fields = ['id']


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for user subscriptions"""
    tier_details = SubscriptionTierSerializer(source='tier', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    is_active_subscription = serializers.BooleanField(source='is_active', read_only=True)
    is_free = serializers.BooleanField(source='is_free_tier', read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id',
            'user',
            'user_email',
            'tier',
            'tier_details',
            'stripe_subscription_id',
            'stripe_customer_id',
            'status',
            'currency',
            'amount',
            'billing_cycle',
            'trial_end',
            'current_period_start',
            'current_period_end',
            'cancel_at_period_end',
            'canceled_at',
            'is_active_subscription',
            'is_free',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'stripe_subscription_id',
            'stripe_customer_id',
            'status',
            'trial_end',
            'current_period_start',
            'current_period_end',
            'created_at',
            'updated_at',
        ]


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for payment transactions"""
    subscription_user = serializers.EmailField(source='subscription.user.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id',
            'subscription',
            'subscription_user',
            'stripe_payment_intent_id',
            'stripe_invoice_id',
            'amount',
            'currency',
            'status',
            'payment_method_type',
            'card_brand',
            'last4',
            'invoice_url',
            'receipt_url',
            'failure_code',
            'failure_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CarbonCreditTransactionSerializer(serializers.ModelSerializer):
    """Serializer for carbon credit transactions"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CarbonCreditTransaction
        fields = [
            'id',
            'user',
            'user_email',
            'stripe_payment_intent_id',
            'credit_amount_tonnes',
            'price_per_tonne',
            'total_amount',
            'currency',
            'project_id',
            'project_name',
            'verification_standard',
            'project_type',
            'project_location',
            'status',
            'certificate_url',
            'certificate_generated_at',
            'receipt_url',
            'invoice_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'stripe_payment_intent_id',
            'status',
            'certificate_url',
            'certificate_generated_at',
            'created_at',
            'updated_at',
        ]


class CreateCheckoutSessionSerializer(serializers.Serializer):
    """Serializer for creating Stripe checkout session"""
    tier_id = serializers.IntegerField(required=True)
    currency = serializers.ChoiceField(choices=['GBP', 'USD', 'EUR'], default='GBP')
    billing_cycle = serializers.ChoiceField(choices=['monthly', 'annual'], default='monthly')
    success_url = serializers.URLField(required=False)
    cancel_url = serializers.URLField(required=False)


class CreateCarbonCreditPaymentSerializer(serializers.Serializer):
    """Serializer for creating carbon credit payment intent"""
    project_id = serializers.CharField(required=True)
    tonnes = serializers.DecimalField(max_digits=10, decimal_places=2, required=True, min_value=0.01)
    currency = serializers.ChoiceField(choices=['GBP', 'USD', 'EUR'], default='GBP')
