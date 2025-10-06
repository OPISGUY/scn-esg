from django.contrib import admin
from .models import SubscriptionTier, Subscription, Transaction, CarbonCreditTransaction


@admin.register(SubscriptionTier)
class SubscriptionTierAdmin(admin.ModelAdmin):
    list_display = ['name', 'tier', 'base_price_gbp', 'is_active', 'sort_order']
    list_filter = ['is_active', 'tier']
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'base_price_gbp']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('tier', 'name', 'description', 'base_price_gbp', 'is_active', 'sort_order')
        }),
        ('Stripe Price IDs', {
            'fields': ('stripe_price_id_gbp', 'stripe_price_id_usd', 'stripe_price_id_eur')
        }),
        ('Features & Limits', {
            'fields': ('features', 'limits'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'tier', 'status', 'amount', 'currency', 'billing_cycle', 'created_at']
    list_filter = ['status', 'tier', 'currency', 'billing_cycle']
    search_fields = ['user__email', 'user__username', 'stripe_subscription_id', 'stripe_customer_id']
    readonly_fields = ['stripe_subscription_id', 'stripe_customer_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User & Tier', {
            'fields': ('user', 'tier')
        }),
        ('Stripe Information', {
            'fields': ('stripe_subscription_id', 'stripe_customer_id')
        }),
        ('Subscription Details', {
            'fields': ('status', 'currency', 'amount', 'billing_cycle')
        }),
        ('Important Dates', {
            'fields': ('trial_end', 'current_period_start', 'current_period_end', 'cancel_at_period_end', 'canceled_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['subscription', 'amount', 'currency', 'status', 'payment_method_type', 'created_at']
    list_filter = ['status', 'currency', 'payment_method_type', 'card_brand']
    search_fields = ['subscription__user__email', 'stripe_payment_intent_id', 'stripe_invoice_id']
    readonly_fields = ['stripe_payment_intent_id', 'stripe_invoice_id', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Subscription', {
            'fields': ('subscription',)
        }),
        ('Stripe IDs', {
            'fields': ('stripe_payment_intent_id', 'stripe_invoice_id')
        }),
        ('Amount Details', {
            'fields': ('amount', 'currency', 'status')
        }),
        ('Payment Method', {
            'fields': ('payment_method_type', 'card_brand', 'last4')
        }),
        ('URLs', {
            'fields': ('invoice_url', 'receipt_url'),
            'classes': ('collapse',)
        }),
        ('Failure Info', {
            'fields': ('failure_code', 'failure_message'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CarbonCreditTransaction)
class CarbonCreditTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'credit_amount_tonnes', 'total_amount', 'currency', 'status', 'project_name', 'created_at']
    list_filter = ['status', 'currency', 'verification_standard']
    search_fields = ['user__email', 'project_name', 'project_id', 'stripe_payment_intent_id']
    readonly_fields = ['stripe_payment_intent_id', 'created_at', 'updated_at', 'certificate_generated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Credit Details', {
            'fields': ('credit_amount_tonnes', 'price_per_tonne', 'total_amount', 'currency')
        }),
        ('Project Information', {
            'fields': ('project_id', 'project_name', 'verification_standard', 'project_type', 'project_location')
        }),
        ('Transaction Status', {
            'fields': ('status', 'stripe_payment_intent_id')
        }),
        ('Certificate', {
            'fields': ('certificate_url', 'certificate_generated_at'),
            'classes': ('collapse',)
        }),
        ('Payment Details', {
            'fields': ('receipt_url', 'invoice_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
