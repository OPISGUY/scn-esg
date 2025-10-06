from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class SubscriptionTier(models.Model):
    """Subscription tier definitions with Stripe Price IDs"""
    
    # Tier choices
    FREE = 'free'
    STARTER = 'starter'
    PROFESSIONAL = 'professional'
    ENTERPRISE = 'enterprise'
    
    TIER_CHOICES = [
        (FREE, 'Free'),
        (STARTER, 'Starter'),
        (PROFESSIONAL, 'Professional'),
        (ENTERPRISE, 'Enterprise'),
    ]
    
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    base_price_gbp = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Feature limits stored as JSON
    features = models.JSONField(default=dict, help_text="Feature flags: e.g., {'ai_insights': True, 'csrd_compliance': False}")
    limits = models.JSONField(default=dict, help_text="Usage limits: e.g., {'data_points_per_month': 50, 'users': 1, 'storage_mb': 50}")
    
    # Stripe Price IDs for different currencies
    stripe_price_id_gbp = models.CharField(max_length=100, blank=True, help_text="Stripe Price ID for GBP")
    stripe_price_id_usd = models.CharField(max_length=100, blank=True, help_text="Stripe Price ID for USD")
    stripe_price_id_eur = models.CharField(max_length=100, blank=True, help_text="Stripe Price ID for EUR")
    
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0, help_text="Display order (0=first)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sort_order', 'base_price_gbp']
        verbose_name = 'Subscription Tier'
        verbose_name_plural = 'Subscription Tiers'
    
    def __str__(self):
        return f"{self.name} - £{self.base_price_gbp}/mo"
    
    def get_stripe_price_id(self, currency='GBP'):
        """Get Stripe Price ID for specific currency"""
        currency_map = {
            'GBP': self.stripe_price_id_gbp,
            'USD': self.stripe_price_id_usd,
            'EUR': self.stripe_price_id_eur,
        }
        return currency_map.get(currency.upper(), self.stripe_price_id_gbp)


class Subscription(models.Model):
    """User subscription records"""
    
    STATUS_CHOICES = [
        ('trialing', 'Trial'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('unpaid', 'Unpaid'),
        ('incomplete', 'Incomplete'),
    ]
    
    BILLING_CYCLE_CHOICES = [
        ('monthly', 'Monthly'),
        ('annual', 'Annual'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    tier = models.ForeignKey(SubscriptionTier, on_delete=models.PROTECT)
    
    # Stripe IDs
    stripe_subscription_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    
    # Subscription details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='incomplete')
    currency = models.CharField(max_length=3, default='GBP')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLE_CHOICES, default='monthly')
    
    # Important dates
    trial_end = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    canceled_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
    
    def __str__(self):
        return f"{self.user.email} - {self.tier.name} ({self.status})"
    
    def is_active(self):
        """Check if subscription is in an active state"""
        return self.status in ['trialing', 'active']
    
    def is_free_tier(self):
        """Check if this is a FREE tier subscription"""
        return self.tier.tier == SubscriptionTier.FREE
    
    def cancel(self):
        """Cancel subscription at period end"""
        self.cancel_at_period_end = True
        self.canceled_at = timezone.now()
        self.save()


class Transaction(models.Model):
    """Payment transaction log"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='transactions')
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    stripe_invoice_id = models.CharField(max_length=100, blank=True)
    
    # Amount details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Payment method details
    payment_method_type = models.CharField(max_length=50, blank=True)  # card, paypal, etc.
    card_brand = models.CharField(max_length=20, blank=True)  # visa, mastercard, amex
    last4 = models.CharField(max_length=4, blank=True)  # Card last 4 digits
    
    # URLs
    invoice_url = models.URLField(blank=True)
    receipt_url = models.URLField(blank=True)
    
    # Failure details
    failure_code = models.CharField(max_length=50, blank=True)
    failure_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
    
    def __str__(self):
        return f"{self.subscription.user.email} - {self.currency}{self.amount} ({self.status})"


class CarbonCreditTransaction(models.Model):
    """Separate model for carbon credit purchases"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carbon_credit_transactions')
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    
    # Credit details
    credit_amount_tonnes = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount of CO2e credits in tonnes")
    price_per_tonne = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    
    # Project details
    project_id = models.CharField(max_length=100)  # Reference to carbon project
    project_name = models.CharField(max_length=255)
    verification_standard = models.CharField(max_length=50, help_text="VCS, Gold Standard, etc.")
    project_type = models.CharField(max_length=100, blank=True, help_text="Reforestation, renewable energy, etc.")
    project_location = models.CharField(max_length=255, blank=True)
    
    # Transaction status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Certificate
    certificate_url = models.URLField(blank=True, help_text="Generated certificate PDF URL")
    certificate_generated_at = models.DateTimeField(null=True, blank=True)
    
    # Payment details
    receipt_url = models.URLField(blank=True)
    invoice_id = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Carbon Credit Transaction'
        verbose_name_plural = 'Carbon Credit Transactions'
    
    def __str__(self):
        return f"{self.user.email} - {self.credit_amount_tonnes}t CO2e ({self.status})"
