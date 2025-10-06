# Landing Page & Subscription System Implementation Plan

_Created: 5 October 2025_  
_Last Updated: 5 October 2025_  
_Status: Phase A2 Complete (53%) - Ready for Backend Integration_  
_Priority: High - Revenue Generation & User Acquisition_

---

## Executive Summary

This document outlines the complete implementation of a public-facing landing page, three-tier subscription system (£9.99–£30/month), and integrated payment processing. The plan includes carbon credit marketplace monetization, multi-currency support, and automated user provisioning upon successful payment.

**Phase A2 Status - COMPLETED ✅:**
- ✅ Modern, conversion-optimized landing page (10 sections)
- ✅ Three-tier pricing display with feature comparison
- ✅ Multi-currency support (GBP, USD, EUR) with real-time conversion
- ✅ Mobile-responsive navigation with hamburger menu
- ✅ SEO optimization (meta tags, Open Graph, JSON-LD, sitemap, robots.txt)
- ✅ Framer Motion animations throughout
- ✅ Smooth scroll navigation to all sections

**Phase A3 - READY TO START:**
- ⏳ Payment provider integration (Stripe primary, PayPal secondary)
- ⏳ Backend subscription models and API endpoints
- ⏳ Automated account provisioning and tier assignment
- ⏳ Carbon credit marketplace payment flow
- ⏳ Admin dashboard for subscription management

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Subscription Tiers & Pricing](#subscription-tiers--pricing)
3. [Landing Page Design](#landing-page-design)
4. [Payment Provider Integration](#payment-provider-integration)
5. [Carbon Credit Marketplace Integration](#carbon-credit-marketplace-integration)
6. [CSRD Compliance Management Module](#csrd-compliance-management-module)
7. [Backend Implementation](#backend-implementation)
8. [Frontend Implementation](#frontend-implementation)
9. [Security & Compliance](#security--compliance)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Plan](#deployment-plan)
12. [Analytics & Monitoring](#analytics--monitoring)
13. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

### High-Level Flow
```
Public Visitor → Landing Page → Pricing Selection → Payment Gateway
                                                    ↓
Admin Dashboard ← Backend Provisioning ← Webhook Handler ← Payment Success
                                                    ↓
                                              Welcome Email → User Dashboard
```

### Technology Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion (animations)
- **Backend**: Django REST Framework + Celery (async tasks)
- **Payment**: Stripe (primary), PayPal (secondary)
- **Database**: PostgreSQL with encrypted payment metadata
- **Email**: Existing email service + transactional templates
- **Analytics**: Vercel Analytics + Google Analytics 4 + Mixpanel

### Key Integration Points
1. **Stripe Checkout**: Embedded sessions for subscription signup
2. **Webhook Listeners**: `backend/api/v1/webhooks/stripe/` and `/paypal/`
3. **User Provisioning**: Celery task chains for account creation
4. **Currency Exchange**: Exchange rate API (e.g., Open Exchange Rates)

---

## Subscription Tiers & Pricing

### Tier Definitions

#### **Starter Tier - £9.99/month**
**Target Audience**: Small businesses, individual sustainability managers

**Features Included:**
- ✅ Basic carbon footprint tracking (up to 50 data points/month)
- ✅ CSRD compliance gap analysis (limited to 10 datapoints)
- ✅ Monthly ESG reports (PDF export)
- ✅ E-waste tracking (up to 100 items)
- ✅ AI-powered insights (10 queries/month)
- ✅ Email support (48hr response SLA)
- ✅ Community forum access
- ✅ Mobile app access (view-only)
- ❌ Carbon credit marketplace (read-only)
- ❌ API access
- ❌ Custom branding

**Limits:**
- 1 user account
- 50 MB data storage
- Standard data retention (12 months)

---

#### **Professional Tier - £19.99/month**
**Target Audience**: Growing companies, sustainability teams (2-10 users)

**Features Included:**
- ✅ **All Starter features, plus:**
- ✅ Unlimited carbon data points
- ✅ Full CSRD compliance suite (all ESRS datapoints)
- ✅ Advanced AI analytics (100 queries/month)
- ✅ Carbon credit marketplace (buy & sell)
- ✅ Scenario modeling & forecasting
- ✅ Custom report templates
- ✅ Priority email support (24hr SLA)
- ✅ Slack/Teams integration
- ✅ Data import/export (CSV, Excel)
- ✅ Mobile app (full editing)
- ✅ Quarterly strategy sessions (1hr video call)
- ❌ API access
- ❌ White-label reporting

**Limits:**
- Up to 5 user accounts
- 500 MB data storage
- Extended data retention (36 months)

---

#### **Enterprise Tier - £30/month per user**
**Target Audience**: Large organizations, multi-site operations

**Features Included:**
- ✅ **All Professional features, plus:**
- ✅ Unlimited users
- ✅ Full API access (REST + GraphQL)
- ✅ White-label reporting with custom branding
- ✅ Unlimited AI queries
- ✅ Dedicated account manager
- ✅ Priority phone + chat support (4hr SLA)
- ✅ Advanced carbon credit trading tools
- ✅ Multi-entity/multi-site management
- ✅ Custom integrations (ERP, CRM connectors)
- ✅ SSO/SAML authentication
- ✅ Advanced role-based permissions
- ✅ Audit trails & compliance exports
- ✅ Monthly strategy sessions (unlimited)
- ✅ Early access to beta features
- ✅ 99.9% uptime SLA with credits

**Limits:**
- Unlimited users (billed per user)
- 10 GB+ data storage
- Permanent data retention

**Minimum Commitment**: 3 users (£90/month minimum)

---

### Pricing Strategy Considerations

**Currency Support (Launch):**
- 🇬🇧 GBP (base currency)
- 🇺🇸 USD (1.27x conversion rate)
- 🇪🇺 EUR (1.16x conversion rate)
- Auto-update rates weekly via API

**Billing Options:**
- Monthly (default)
- Annual (15% discount - 2 months free)
- Custom (Enterprise only - negotiated)

**Payment Methods Supported:**
- Credit/Debit cards (Visa, Mastercard, Amex)
- PayPal
- Direct debit (GBP only, via Stripe)
- Invoice (Enterprise only, NET-30 terms)

**Trial & Discounts:**
- 14-day free trial (all tiers)
- No credit card required for trial
- Educational discount: 30% off (requires verification)
- Non-profit discount: 40% off (requires 501(c)(3) or equivalent)
- Volume discount: 20+ users → 10% off

---

## Landing Page Design

### Page Structure & Sections

#### 1. **Hero Section** (Above the Fold) ✅ COMPLETE
**Goal**: Capture attention in 3 seconds, communicate core value

**Implementation Status:**
- ✅ Gradient background (green → blue)
- ✅ Animated dashboard preview with breathing cards
- ✅ Navigation with desktop links + mobile hamburger menu
- ✅ CTAs: "Start Free Trial" and "Watch Demo" buttons
- ✅ Smooth scroll functionality to #features, #pricing, #faq
- ✅ Framer Motion fade-in animations with staggered delays
- ✅ Mobile-responsive design (<768px breakpoint)

**Layout:**
```
+----------------------------------------------------------+
|  [Logo]                    [Login] [Start Free Trial]   |
+----------------------------------------------------------+
|                                                          |
|    Transform Your Sustainability Journey                |
|    ─────────────────────────────────                    |
|    Enterprise-grade ESG intelligence, compliance,       |
|    and carbon management in one platform                |
|                                                          |
|    [Start 14-Day Free Trial] [Watch Demo ▶]            |
|                                                          |
|    ✓ No credit card required  ✓ Setup in 5 minutes     |
|                                                          |
|    [Animated Dashboard Preview]                         |
|                                                          |
+----------------------------------------------------------+
```

**Visual Elements:**
- Gradient background (green → blue, eco-friendly colors)
- Animated dashboard screenshot/video showing real platform
- Trust badges: "CSRD Compliant" "SOC 2 Ready" "ISO 27001 Ready"
- Value proposition: "Enterprise-grade ESG intelligence platform"

---

#### 2. **Social Proof Section** ✅ COMPLETE
**Goal**: Build credibility through key metrics and platform capabilities

**Implementation Status:**
- ✅ 4 key metrics displayed with icons
- ✅ Scroll-triggered fade-in animations
- ✅ Staggered delays for each metric card
- ✅ Trust badges for ISO 27001, GDPR, SOC 2, Google Gemini AI

**Layout:**
- Key metrics displayed prominently:
  - "Built for CSRD Compliance"
  - "1,144+ ESRS Datapoints"
  - "AI-Powered Insights"
  - "Trusted Security Standards"
- Trust badges:
  - "ISO 27001 Certified"
  - "GDPR Compliant"
  - "SOC 2 Type II"
  - "Powered by Google Gemini AI"

---

#### 3. **Problem/Solution Section** ✅ COMPLETE
**Goal**: Empathize with pain points, position platform as solution

**Implementation Status:**
- ✅ 3 problem-solution pairs with emojis
- ✅ Data-driven rendering from problems array
- ✅ Staggered card animations (0.2s delays)
- ✅ Hover effects on cards

**Format**: 3-column layout

| Pain Point | Our Solution | Result |
|------------|--------------|--------|
| 😓 Manual data entry | 🤖 AI-powered data imports | ⚡ 10x faster reporting |
| 📊 Complex CSRD compliance | ✅ Auto-mapped ESRS datapoints | 🎯 100% audit-ready |
| 💸 Opaque carbon markets | 🏪 Transparent marketplace | 💰 15% cost savings |

---

#### 4. **Features Showcase** ✅ COMPLETE
**Goal**: Demonstrate platform capabilities with visuals

**Implementation Status:**
- ✅ Tab-based interface with 4 categories
- ✅ Section ID anchor (#features) for smooth scroll
- ✅ Fade-in animation on section title
- ✅ Interactive tab switching maintained

**Interactive Tabs:**
1. **Carbon Management**
   - Real-time emissions tracking
   - Scope 1/2/3 breakdowns
   - Reduction scenario modeling
   - Visual: Animated carbon dashboard

2. **CSRD Compliance**
   - ESRS datapoint mapping
   - Gap analysis reports
   - Audit trail exports
   - Visual: Compliance checklist UI

3. **AI Insights**
   - Natural language queries
   - Predictive analytics
   - Automated recommendations
   - Visual: Chat interface demo

4. **Carbon Credits**
   - Verified project marketplace
   - Portfolio management
   - Transaction history
   - Visual: Trading interface

---

#### 5. **Pricing Section** (Core CTA) ✅ COMPLETE
**Goal**: Convert visitors into trial signups

**Implementation Status:**
- ✅ 3-tier pricing cards (Starter, Professional, Enterprise)
- ✅ Currency selector component (GBP/USD/EUR)
- ✅ Real-time price conversion with dynamic display
- ✅ Professional tier highlighted as "Most Popular"
- ✅ Section ID anchor (#pricing) for smooth scroll
- ✅ Staggered card animations with hover lift effects
- ✅ Feature lists for each tier
- ✅ CTA buttons: "Start Free Trial" and "Contact Sales"

**Layout**: 3-column comparison table

```
+------------------+------------------+------------------+
|   Starter        | Professional ⭐  |   Enterprise     |
|   £9.99/mo       |   £19.99/mo      |   £30/mo/user    |
+------------------+------------------+------------------+
| • Feature list   | • Feature list   | • Feature list   |
| • (bulleted)     | • (bulleted)     | • (bulleted)     |
|                  |                  |                  |
| [Start Trial]    | [Start Trial]    | [Contact Sales]  |
+------------------+------------------+------------------+
```

**Design Notes:**
- Professional tier highlighted (most popular)
- Feature comparison toggle (compact vs. detailed)
- Annual billing toggle showing savings
- Currency selector (GBP/USD/EUR)
- "Used by 300+ companies" badge on Professional

---

#### 6. **How It Works Section** ✅ COMPLETE
**Goal**: Reduce friction by explaining onboarding

**Implementation Status:**
- ✅ 3-step process with numbered cards
- ✅ Section ID anchor (#how-it-works) for smooth scroll
- ✅ Data-driven rendering from steps array
- ✅ Staggered step animations (0.2s delays)
- ✅ Hover effects on step numbers (scale + rotate)

**3-Step Visual Flow:**
1. **Sign Up** (30 seconds)  
   → Email + password, select tier

2. **Import Data** (5 minutes)  
   → CSV upload, API connect, or manual entry

3. **Get Insights** (Instant)  
   → AI analysis, reports, compliance scores

---

#### 7. **Integration Partners Section** ✅ COMPLETE
**Goal**: Show ecosystem compatibility

**Implementation Status:**
- ✅ 8 integration partners with icons and categories
- ✅ 4 compliance standards (GRI, CDP, TCFD, CSRD)
- ✅ Grid layout with staggered animations
- ✅ Hover scale effects on integration cards
- ✅ Separate sections for integrations and standards

**Logos Grid:**
- Accounting: Xero, QuickBooks, SAP
- Cloud: AWS, Azure, Google Cloud
- Communication: Slack, Microsoft Teams
- Standards: CSRD, GRI, CDP, TCFD

---

#### 8. **FAQ Section** ✅ COMPLETE
**Goal**: Address objections, reduce support load

**Implementation Status:**
- ✅ Section ID anchor (#faq) for smooth scroll
- ✅ Framer Motion import ready
- ✅ Accordion-style Q&A format
- ⚠️ Note: Animations partially implemented, can be enhanced

**Key Questions:**
- What's included in the free trial?
- Can I cancel anytime?
- Is my data secure?
- Do you support my country's regulations?
- What payment methods do you accept?
- Can I upgrade/downgrade later?

---

#### 9. **Final CTA Section** ✅ COMPLETE
**Goal**: Last conversion opportunity before footer

**Implementation Status:**
- ✅ Gradient background matching hero section
- ✅ Dual CTAs: "Start Free Trial" and "Schedule Demo"
- ✅ Fade-in animations with hover/tap effects
- ✅ Trust indicators below CTAs

**Copy:**
> ## Ready to Transform Your ESG Strategy?
> Join hundreds of companies reducing emissions and achieving compliance.
> 
> [Start Free Trial] [Schedule Demo]
> 
> ✓ 14-day trial ✓ No credit card ✓ Cancel anytime

---

#### 10. **Footer** ✅ COMPLETE
**Implementation Status:**
- ✅ Multi-column layout with link sections
- ✅ Product, Company, Resources, Legal, Social links
- ✅ Responsive grid layout

**Standard Links:**
- Product: Features, Pricing, Integrations
- Company: About, Careers, Press
- Resources: Blog, Case Studies, Documentation
- Legal: Privacy, Terms, Cookie Policy, GDPR
- Social: LinkedIn, Twitter, YouTube

---

### Mobile Navigation ✅ COMPLETE

**Implementation Status:**
- ✅ MobileMenu component with slide-in animation
- ✅ Hamburger menu button in HeroSection (visible <768px)
- ✅ Overlay backdrop with click-to-close
- ✅ Keyboard navigation (ESC key to close)
- ✅ Body scroll lock when menu open
- ✅ Staggered menu item animations (0.1s delays)
- ✅ CTA section with "Start Free Trial" button
- ✅ Smooth scroll to section anchors on click

### SEO Optimization ✅ COMPLETE

**Implementation Status:**
- ✅ Comprehensive meta tags in index.html
- ✅ Open Graph tags for social sharing (Facebook)
- ✅ Twitter Card meta tags
- ✅ JSON-LD structured data (SoftwareApplication schema)
- ✅ All 3 pricing tiers listed in schema with proper pricing markup
- ✅ public/sitemap.xml with all major routes
- ✅ public/robots.txt with crawler directives
- ✅ Canonical URL and theme-color meta tags
- ✅ Mobile app meta tags for iOS/Android

### Landing Page Variations (A/B Testing) - FUTURE PHASE

**Variant A (Control)**: Current design (LIVE)  
**Variant B**: Video hero (replace screenshot with explainer video) - PLANNED  
**Variant C**: Calculator lead magnet (carbon footprint calculator → email capture) - PLANNED  
**Variant D**: Industry-specific landing pages (Manufacturing, Tech, Retail) - PLANNED

---

## Payment Provider Integration

### Primary Provider: Stripe

#### Why Stripe?
- ✅ Excellent developer experience
- ✅ Native subscription management
- ✅ Strong fraud protection
- ✅ Multi-currency support (135+ currencies)
- ✅ Webhooks for automation
- ✅ Customer portal for self-service
- ✅ SCA/PSD2 compliant
- ✅ Usage-based billing (for future metering)

#### Implementation Approach

**Phase 1: Stripe Setup** ⏳ NEXT PHASE (A3.1)
1. Create Stripe account (separate test/live environments)
2. Configure webhook endpoints in Stripe dashboard
3. Set up subscription products in Stripe:
   - `prod_starter_monthly_gbp`
   - `prod_professional_monthly_gbp`
   - `prod_enterprise_monthly_gbp`
   - Duplicate for annual variants
4. Enable payment methods: cards, PayPal, direct debit

**Landing Page Integration Points (READY):**
- ✅ Pricing section displays 3 tiers with features
- ✅ Currency conversion logic in place (GBP/USD/EUR)
- ✅ "Start Free Trial" CTAs throughout landing page
- ⏳ Need to connect CTAs to Stripe Checkout flow
- ⏳ Need to create signup flow with tier selection

**Phase 2: Backend Integration** ⏳ NEXT PHASE (A3.2-A3.4)

**Django App Structure:**
```
backend/payments/
├── __init__.py
├── models.py          # Subscription, Transaction, Invoice models
├── serializers.py     # DRF serializers
├── services.py        # Stripe SDK logic
├── views.py           # API endpoints
├── webhooks.py        # Webhook handlers
├── tasks.py           # Celery async tasks
├── utils.py           # Currency conversion, etc.
└── tests/
    └── test_stripe.py
```

**Key Models:**

```python
# backend/payments/models.py

class SubscriptionTier(models.Model):
    """Subscription tier definitions"""
    STARTER = 'starter'
    PROFESSIONAL = 'professional'
    ENTERPRISE = 'enterprise'
    
    TIER_CHOICES = [
        (STARTER, 'Starter'),
        (PROFESSIONAL, 'Professional'),
        (ENTERPRISE, 'Enterprise'),
    ]
    
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    base_price_gbp = models.DecimalField(max_digits=10, decimal_places=2)
    features = models.JSONField(default=dict)
    limits = models.JSONField(default=dict)
    stripe_price_id = models.CharField(max_length=100)  # Different per currency
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['base_price_gbp']


class Subscription(models.Model):
    """User subscription records"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    tier = models.ForeignKey(SubscriptionTier, on_delete=models.PROTECT)
    stripe_subscription_id = models.CharField(max_length=100, unique=True)
    stripe_customer_id = models.CharField(max_length=100)
    
    status = models.CharField(max_length=20, choices=[
        ('trialing', 'Trial'),
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('unpaid', 'Unpaid'),
    ])
    
    currency = models.CharField(max_length=3, default='GBP')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, choices=[
        ('monthly', 'Monthly'),
        ('annual', 'Annual'),
    ], default='monthly')
    
    trial_end = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField()
    current_period_end = models.DateTimeField()
    cancel_at_period_end = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def is_active(self):
        return self.status in ['trialing', 'active']


class Transaction(models.Model):
    """Payment transaction log"""
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='transactions')
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    status = models.CharField(max_length=20)
    
    payment_method_type = models.CharField(max_length=50)  # card, paypal, etc.
    last4 = models.CharField(max_length=4, blank=True)  # Card last 4 digits
    
    invoice_url = models.URLField(blank=True)
    receipt_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class CarbonCreditTransaction(models.Model):
    """Separate model for carbon credit purchases"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stripe_payment_intent_id = models.CharField(max_length=100, unique=True)
    
    credit_amount_tonnes = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_tonne = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3)
    
    project_id = models.CharField(max_length=100)  # Reference to carbon project
    project_name = models.CharField(max_length=255)
    verification_standard = models.CharField(max_length=50)  # VCS, Gold Standard, etc.
    
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ])
    
    certificate_url = models.URLField(blank=True)  # Generated certificate
    
    created_at = models.DateTimeField(auto_now_add=True)
```

**API Endpoints:**

```python
# backend/payments/views.py

class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    Subscription management endpoints
    
    GET /api/v1/subscriptions/tiers/ - List all available tiers
    POST /api/v1/subscriptions/create-checkout-session/ - Start Stripe checkout
    GET /api/v1/subscriptions/current/ - Get current user subscription
    POST /api/v1/subscriptions/cancel/ - Cancel subscription
    POST /api/v1/subscriptions/resume/ - Resume canceled subscription
    POST /api/v1/subscriptions/upgrade/ - Upgrade tier
    POST /api/v1/subscriptions/downgrade/ - Downgrade tier
    GET /api/v1/subscriptions/billing-portal/ - Get Stripe portal URL
    """
    pass


class PaymentWebhookView(APIView):
    """
    Stripe webhook handler
    
    POST /api/v1/webhooks/stripe/
    
    Handles events:
    - checkout.session.completed
    - customer.subscription.created
    - customer.subscription.updated
    - customer.subscription.deleted
    - invoice.payment_succeeded
    - invoice.payment_failed
    - payment_intent.succeeded
    - payment_intent.payment_failed
    """
    pass


class CarbonCreditCheckoutView(APIView):
    """
    POST /api/v1/carbon-credits/checkout/
    
    Create payment intent for carbon credit purchase
    """
    pass
```

**Webhook Handler Example:**

```python
# backend/payments/webhooks.py

import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .tasks import provision_user_account, send_welcome_email

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_complete(session)
    
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_update(subscription)
    
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        handle_payment_failure(invoice)
    
    return JsonResponse({'status': 'success'})


def handle_checkout_complete(session):
    """Process successful checkout"""
    # Extract metadata
    user_email = session['customer_details']['email']
    tier_id = session['metadata']['tier_id']
    
    # Trigger async provisioning
    provision_user_account.delay(
        email=user_email,
        stripe_customer_id=session['customer'],
        stripe_subscription_id=session['subscription'],
        tier_id=tier_id
    )
```

**Celery Task for User Provisioning:**

```python
# backend/payments/tasks.py

from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Subscription, SubscriptionTier
from .services import StripeService

User = get_user_model()

@shared_task
def provision_user_account(email, stripe_customer_id, stripe_subscription_id, tier_id):
    """
    Create user account and subscription after successful payment
    """
    # Fetch subscription details from Stripe
    stripe_service = StripeService()
    subscription_data = stripe_service.get_subscription(stripe_subscription_id)
    
    # Create or update user
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': email.split('@')[0],
            'is_active': True,
        }
    )
    
    # Create subscription record
    tier = SubscriptionTier.objects.get(id=tier_id)
    subscription = Subscription.objects.create(
        user=user,
        tier=tier,
        stripe_subscription_id=stripe_subscription_id,
        stripe_customer_id=stripe_customer_id,
        status=subscription_data['status'],
        currency=subscription_data['currency'].upper(),
        amount=subscription_data['plan']['amount'] / 100,
        billing_cycle='monthly' if subscription_data['plan']['interval'] == 'month' else 'annual',
        current_period_start=subscription_data['current_period_start'],
        current_period_end=subscription_data['current_period_end'],
        trial_end=subscription_data.get('trial_end'),
    )
    
    # Send welcome email
    send_welcome_email.delay(user.id, tier.name)
    
    return subscription.id
```

---

### Secondary Provider: PayPal

**Use Case**: Users without credit cards, international markets where PayPal is preferred

**Integration Approach**:
1. Use PayPal Subscriptions API
2. Mirror Stripe product structure
3. Separate webhook handler: `/api/v1/webhooks/paypal/`
4. Unified `Subscription` model (add `paypal_subscription_id` field)

**Implementation Priority**: Phase 2 (after Stripe is stable)

---

### Currency Conversion Service

**Provider**: Open Exchange Rates API (or similar)

**Features**:
- Fetch live rates daily
- Cache rates in Redis (1hr TTL)
- Fallback to static rates if API down
- Store historical rates for reporting

**API Endpoint**:
```
GET /api/v1/payments/exchange-rates/?from=GBP&to=USD
```

**Rate Update Task**:
```python
@shared_task
def update_exchange_rates():
    """Celery beat task - runs daily at 00:00 UTC"""
    from .services import ExchangeRateService
    
    service = ExchangeRateService()
    rates = service.fetch_latest_rates()
    
    # Store in cache and database
    cache.set('exchange_rates', rates, timeout=86400)
    ExchangeRate.objects.create(rates=rates)
```

---

## Carbon Credit Marketplace Integration

### Payment Flow for Carbon Credits

**User Journey:**
1. Browse carbon projects (existing UI)
2. Select project + quantity (tonnes)
3. Review order:
   - Project details
   - Price per tonne
   - Total cost
   - Currency selector
4. Checkout (Stripe Payment Intent)
5. Payment confirmation
6. Certificate generation (PDF)
7. Blockchain verification record (future)

### Backend Changes

**New API Endpoints:**
```
POST /api/v1/carbon-credits/create-payment-intent/
POST /api/v1/carbon-credits/confirm-payment/
GET /api/v1/carbon-credits/transactions/
GET /api/v1/carbon-credits/certificates/{id}/
```

**Payment Intent Creation:**
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_carbon_credit_payment_intent(request):
    """
    Create Stripe Payment Intent for carbon credit purchase
    
    Request body:
    {
        "project_id": "proj_123",
        "tonnes": 5.0,
        "currency": "GBP"
    }
    """
    project_id = request.data.get('project_id')
    tonnes = Decimal(request.data.get('tonnes'))
    currency = request.data.get('currency', 'GBP')
    
    # Fetch project details
    project = CarbonProject.objects.get(id=project_id)
    
    # Calculate total
    price_per_tonne = project.get_price_in_currency(currency)
    total_amount = tonnes * price_per_tonne
    
    # Create Stripe Payment Intent
    intent = stripe.PaymentIntent.create(
        amount=int(total_amount * 100),  # Convert to cents
        currency=currency.lower(),
        metadata={
            'type': 'carbon_credit',
            'project_id': project_id,
            'tonnes': str(tonnes),
            'user_id': request.user.id,
        },
        receipt_email=request.user.email,
    )
    
    # Store pending transaction
    CarbonCreditTransaction.objects.create(
        user=request.user,
        stripe_payment_intent_id=intent.id,
        credit_amount_tonnes=tonnes,
        price_per_tonne=price_per_tonne,
        total_amount=total_amount,
        currency=currency,
        project_id=project_id,
        project_name=project.name,
        verification_standard=project.standard,
        status='pending',
    )
    
    return Response({
        'client_secret': intent.client_secret,
        'amount': total_amount,
        'currency': currency,
    })
```

**Webhook Handler Addition:**
```python
elif event['type'] == 'payment_intent.succeeded':
    payment_intent = event['data']['object']
    
    if payment_intent['metadata'].get('type') == 'carbon_credit':
        handle_carbon_credit_purchase(payment_intent)


def handle_carbon_credit_purchase(payment_intent):
    """Process successful carbon credit purchase"""
    transaction = CarbonCreditTransaction.objects.get(
        stripe_payment_intent_id=payment_intent['id']
    )
    
    transaction.status = 'completed'
    transaction.save()
    
    # Generate certificate
    generate_carbon_certificate.delay(transaction.id)
    
    # Update user's carbon credit balance
    update_user_carbon_balance.delay(
        transaction.user.id,
        transaction.credit_amount_tonnes
    )
```

**Certificate Generation Task:**
```python
@shared_task
def generate_carbon_certificate(transaction_id):
    """Generate PDF certificate for carbon credit purchase"""
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    
    transaction = CarbonCreditTransaction.objects.get(id=transaction_id)
    
    # Create PDF
    pdf_path = f'/tmp/certificate_{transaction.id}.pdf'
    c = canvas.Canvas(pdf_path, pagesize=letter)
    
    # Add certificate content
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, 700, "Carbon Credit Certificate")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, 650, f"Certificate ID: {transaction.id}")
    c.drawString(100, 630, f"Issued to: {transaction.user.email}")
    c.drawString(100, 610, f"Amount: {transaction.credit_amount_tonnes} tonnes CO₂e")
    c.drawString(100, 590, f"Project: {transaction.project_name}")
    c.drawString(100, 570, f"Standard: {transaction.verification_standard}")
    c.drawString(100, 550, f"Date: {transaction.created_at.strftime('%Y-%m-%d')}")
    
    c.save()
    
    # Upload to cloud storage (S3/GCS)
    from .services import upload_certificate_to_storage
    certificate_url = upload_certificate_to_storage(pdf_path, transaction.id)
    
    # Update transaction
    transaction.certificate_url = certificate_url
    transaction.save()
    
    # Send email with certificate
    send_certificate_email.delay(transaction.user.id, certificate_url)
```

---

## CSRD Compliance Management Module

### Overview

The CSRD Compliance Management module is currently non-functional and requires comprehensive implementation. This section will transform it into a fully operational compliance tracking and management system that helps companies navigate the Corporate Sustainability Reporting Directive (CSRD) and European Sustainability Reporting Standards (ESRS).

**Current State:**
- Basic UI components exist (`CSRDCompliance.tsx`)
- Backend models defined but incomplete
- No data entry workflows
- No assessment capabilities
- No AI-powered analysis
- Missing reporting features

**Target State:**
- Complete ESRS datapoint catalog (1,144+ datapoints)
- Interactive materiality assessment
- Data collection workflows for each datapoint
- Gap analysis and readiness scoring
- AI-powered recommendations
- Automated report generation (PDF/Excel)
- Timeline tracking and deadline management
- Multi-user collaboration features

---

### CSRD/ESRS Background

**What is CSRD?**
The Corporate Sustainability Reporting Directive is an EU regulation requiring companies to disclose detailed sustainability information across:
- **Environmental** (E1-E5): Climate, pollution, water, biodiversity, circular economy
- **Social** (S1-S4): Workforce, value chain, communities, consumers
- **Governance** (G1): Business conduct

**Who Must Comply?**
- Large EU companies (500+ employees, €40M+ revenue)
- Listed SMEs (from 2026)
- Non-EU companies with significant EU operations (€150M+ EU revenue)

**Reporting Timeline:**
- 2024: Large listed companies (first reports in 2025)
- 2025: All large companies (first reports in 2026)
- 2026: Listed SMEs (first reports in 2027)

---

### Module Architecture

#### Data Model Enhancements

**Current Models (to be enhanced):**
```python
# backend/compliance/models.py

class CSRDAssessment(models.Model):
    """Main assessment container - already exists, needs enhancements"""
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    status = models.CharField(...)  # Add more statuses
    overall_readiness_score = models.IntegerField()
    # ADD: Double materiality assessment results
    # ADD: Reporting period fields
    # ADD: Approval workflow fields

class ESRSDataPoint(models.Model):
    """Individual ESRS datapoints - needs restructuring"""
    assessment = models.ForeignKey(CSRDAssessment, on_delete=models.CASCADE)
    esrs_category = models.CharField(...)  # E1, S2, G1, etc.
    # ADD: Link to ESRSDatapointCatalog (master data)
    # ADD: Data collection status
    # ADD: Quality assurance fields
```

**New Models to Add:**

```python
# backend/compliance/models.py additions

class MaterialityAssessment(models.Model):
    """Double materiality assessment results"""
    csrd_assessment = models.OneToOneField(CSRDAssessment, on_delete=models.CASCADE)
    
    # Impact Materiality: Company's effect on people/planet
    impact_materiality_completed = models.BooleanField(default=False)
    impact_material_topics = models.JSONField(default=list)  # ['E1', 'S1', 'G1']
    
    # Financial Materiality: Sustainability's effect on company value
    financial_materiality_completed = models.BooleanField(default=False)
    financial_material_topics = models.JSONField(default=list)
    
    # Combined materiality matrix
    materiality_matrix = models.JSONField(default=dict)
    # Example: {'E1': {'impact': 'high', 'financial': 'medium'}, ...}
    
    stakeholder_consultations = models.JSONField(default=list)
    # Example: [{'stakeholder': 'Employees', 'date': '2025-01-15', 'topics': ['S1', 'S2']}, ...]
    
    approved_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    approved_at = models.DateTimeField(null=True)
    
    class Meta:
        verbose_name = 'Materiality Assessment'


class DatapointDataEntry(models.Model):
    """Actual data values for specific ESRS datapoints"""
    esrs_datapoint = models.ForeignKey(ESRSDataPoint, on_delete=models.CASCADE, related_name='data_entries')
    
    # Reporting period
    reporting_year = models.IntegerField()
    reporting_period_start = models.DateField()
    reporting_period_end = models.DateField()
    
    # Data values (polymorphic)
    data_type = models.CharField(max_length=20, choices=[
        ('numeric', 'Numeric Value'),
        ('text', 'Text/Description'),
        ('boolean', 'Yes/No'),
        ('percentage', 'Percentage'),
        ('list', 'Multiple Values'),
        ('table', 'Tabular Data'),
    ])
    
    numeric_value = models.DecimalField(max_digits=20, decimal_places=4, null=True, blank=True)
    text_value = models.TextField(blank=True)
    boolean_value = models.BooleanField(null=True)
    json_value = models.JSONField(null=True, blank=True)  # For complex data
    
    unit = models.CharField(max_length=50, blank=True)  # tonnes CO2e, kWh, EUR, etc.
    
    # Data quality
    data_source = models.CharField(max_length=255)  # "ERP System", "Manual Entry", etc.
    confidence_level = models.CharField(max_length=20, choices=[
        ('high', 'High Confidence'),
        ('medium', 'Medium Confidence'),
        ('low', 'Low Confidence - Estimated'),
    ], default='medium')
    
    supporting_documents = models.JSONField(default=list)  # File URLs/IDs
    calculation_methodology = models.TextField(blank=True)
    
    # Verification
    verified_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='verified_datapoints')
    verified_at = models.DateTimeField(null=True)
    verification_notes = models.TextField(blank=True)
    
    # Change tracking
    entered_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entered_datapoints')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-reporting_year', 'esrs_datapoint']
        unique_together = ['esrs_datapoint', 'reporting_year']


class DatapointComment(models.Model):
    """Comments and discussions on datapoints"""
    datapoint = models.ForeignKey(ESRSDataPoint, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_text = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class ComplianceReport(models.Model):
    """Generated compliance reports"""
    csrd_assessment = models.ForeignKey(CSRDAssessment, on_delete=models.CASCADE, related_name='reports')
    
    report_type = models.CharField(max_length=50, choices=[
        ('gap_analysis', 'Gap Analysis Report'),
        ('readiness', 'Readiness Assessment'),
        ('full_disclosure', 'Full CSRD Disclosure'),
        ('sustainability_statement', 'Sustainability Statement'),
        ('assurance_package', 'Assurance Package'),
    ])
    
    reporting_period_start = models.DateField()
    reporting_period_end = models.DateField()
    
    # Report formats
    pdf_file_url = models.URLField(blank=True)
    excel_file_url = models.URLField(blank=True)
    xml_file_url = models.URLField(blank=True)  # ESEF format
    
    # Report metadata
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    generated_at = models.DateTimeField(auto_now_add=True)
    report_version = models.IntegerField(default=1)
    
    # Approval workflow
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('review', 'Under Review'),
        ('approved', 'Approved'),
        ('published', 'Published'),
    ], default='draft')
    
    approved_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='approved_reports')
    approved_at = models.DateTimeField(null=True)
    
    class Meta:
        ordering = ['-generated_at']
```

---

### Frontend Components Redesign

#### Component Structure

```
src/components/csrd/
├── CSRDDashboard.tsx                 # Main dashboard (replaces CSRDCompliance.tsx)
├── MaterialityAssessment/
│   ├── MaterialityMatrix.tsx         # Interactive double materiality matrix
│   ├── StakeholderInput.tsx          # Stakeholder consultation tracker
│   └── TopicSelection.tsx            # ESRS topic selector
├── DatapointManagement/
│   ├── DatapointCatalog.tsx          # Browse all 1,144 ESRS datapoints
│   ├── DatapointDetail.tsx           # Individual datapoint view
│   ├── DataEntryForm.tsx             # Form for entering datapoint values
│   ├── DatapointFilters.tsx          # Filter by category, materiality, status
│   └── BulkImport.tsx                # CSV/Excel import for multiple datapoints
├── GapAnalysis/
│   ├── ReadinessScore.tsx            # Overall compliance readiness (0-100%)
│   ├── GapVisualizations.tsx         # Charts showing completion by category
│   ├── PriorityActions.tsx           # Recommended actions to close gaps
│   └── Timeline.tsx                  # Compliance timeline with milestones
├── Reporting/
│   ├── ReportGenerator.tsx           # Configure and generate reports
│   ├── ReportTemplates.tsx           # Pre-built report templates
│   ├── ReportPreview.tsx             # Preview before download
│   └── ReportHistory.tsx             # List of previously generated reports
├── Collaboration/
│   ├── TaskAssignment.tsx            # Assign datapoints to team members
│   ├── CommentThread.tsx             # Discussion threads on datapoints
│   └── ApprovalWorkflow.tsx          # Review and approval process
└── AIInsights/
    ├── AIRecommendations.tsx         # AI-generated compliance suggestions
    ├── BenchmarkComparison.tsx       # Compare against industry peers
    └── PolicyScanner.tsx             # Scan company policies for ESRS alignment
```

---

### Core Features Implementation

#### 1. CSRD Dashboard (Home Screen)

**Purpose**: High-level overview of compliance status

**Widgets:**
```tsx
// src/components/csrd/CSRDDashboard.tsx

import React, { useState, useEffect } from 'react';
import { ProgressRing } from '../common/ProgressRing';
import { StatusCard } from '../common/StatusCard';
import { api } from '../../services/api';

export const CSRDDashboard: React.FC = () => {
  const [assessment, setAssessment] = useState<any>(null);
  const [stats, setStats] = useState({
    overallReadiness: 0,
    materialTopics: 0,
    datapointsCompleted: 0,
    totalDatapoints: 0,
    daysUntilDeadline: 0,
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    const response = await api.get('/compliance/dashboard-stats/');
    setStats(response.data);
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">CSRD Compliance Hub</h1>
        <p className="text-green-100">
          Your journey to CSRD compliance starts here. Track progress, manage datapoints, and generate reports.
        </p>
      </div>
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Overall Readiness Score */}
        <StatusCard
          title="Overall Readiness"
          icon="📊"
          primaryMetric={
            <ProgressRing 
              percentage={stats.overallReadiness} 
              size="large"
              color={stats.overallReadiness > 70 ? 'green' : 'orange'}
            />
          }
          subtitle={`${stats.overallReadiness}% ready for reporting`}
        />
        
        {/* Material Topics */}
        <StatusCard
          title="Material Topics"
          icon="🎯"
          primaryMetric={<span className="text-4xl font-bold">{stats.materialTopics}</span>}
          subtitle="ESRS standards identified as material"
          action={{ label: 'Review Materiality', link: '/csrd/materiality' }}
        />
        
        {/* Data Collection Progress */}
        <StatusCard
          title="Data Collection"
          icon="📝"
          primaryMetric={
            <div className="text-4xl font-bold">
              {stats.datapointsCompleted} / {stats.totalDatapoints}
            </div>
          }
          subtitle="Datapoints completed"
          action={{ label: 'Enter Data', link: '/csrd/datapoints' }}
        />
        
        {/* Reporting Deadline */}
        <StatusCard
          title="Reporting Deadline"
          icon="⏰"
          primaryMetric={
            <div className="text-4xl font-bold text-red-600">
              {stats.daysUntilDeadline}
            </div>
          }
          subtitle="Days until next report due"
          action={{ label: 'View Timeline', link: '/csrd/timeline' }}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton icon="🔍" label="Start Materiality Assessment" link="/csrd/materiality/new" />
          <ActionButton icon="📋" label="Browse Datapoints" link="/csrd/datapoints" />
          <ActionButton icon="📤" label="Import Data" link="/csrd/import" />
          <ActionButton icon="📄" label="Generate Report" link="/csrd/reports/new" />
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <ActivityFeed />
      </div>
      
      {/* AI Recommendations */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI-Powered Recommendations
        </h2>
        <AIRecommendationsList />
      </div>
    </div>
  );
};
```

---

#### 2. Materiality Assessment Module

**Purpose**: Help companies conduct double materiality assessment

**Key Features:**
- Interactive materiality matrix (2x2 grid)
- Stakeholder input tracking
- Topic scoring (impact vs. financial materiality)
- Automated report generation

**Component Example:**
```tsx
// src/components/csrd/MaterialityAssessment/MaterialityMatrix.tsx

export const MaterialityMatrix: React.FC = () => {
  const [topics, setTopics] = useState<MaterialityTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const handleTopicDrag = (topicId: string, impactScore: number, financialScore: number) => {
    // Update topic position in matrix
    api.put(`/compliance/materiality/${topicId}/`, {
      impact_materiality_score: impactScore,
      financial_materiality_score: financialScore,
    });
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Double Materiality Matrix</h2>
      
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded mb-6">
        <p className="text-sm text-blue-900">
          Drag each ESRS topic onto the matrix based on:
          <br />
          <strong>Y-axis (Impact Materiality):</strong> How significantly your company impacts this topic
          <br />
          <strong>X-axis (Financial Materiality):</strong> How significantly this topic affects your company's financial performance
        </p>
      </div>
      
      {/* Matrix Grid */}
      <div className="relative w-full h-[600px] border-2 border-gray-300 rounded-lg bg-white">
        {/* Quadrants */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Low Impact, Low Financial */}
          <div className="border-r border-b border-gray-200 bg-gray-50 p-4">
            <span className="text-xs text-gray-500">Not Material</span>
          </div>
          
          {/* High Financial, Low Impact */}
          <div className="border-b border-gray-200 bg-yellow-50 p-4">
            <span className="text-xs text-yellow-700">Financial Material</span>
          </div>
          
          {/* High Impact, Low Financial */}
          <div className="border-r border-gray-200 bg-green-50 p-4">
            <span className="text-xs text-green-700">Impact Material</span>
          </div>
          
          {/* High Impact, High Financial */}
          <div className="bg-red-50 p-4">
            <span className="text-xs text-red-700">Double Material ⚠️</span>
          </div>
        </div>
        
        {/* Axis Labels */}
        <div className="absolute -left-24 top-1/2 transform -rotate-90 text-sm font-semibold text-gray-700">
          Impact Materiality →
        </div>
        <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-700">
          Financial Materiality →
        </div>
        
        {/* Draggable Topics */}
        {topics.map(topic => (
          <DraggableTopic
            key={topic.id}
            topic={topic}
            onDragEnd={handleTopicDrag}
          />
        ))}
      </div>
      
      {/* Topic Legend */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        {ESRS_CATEGORIES.map(category => (
          <div key={category.code} className="flex items-center">
            <div className={`w-4 h-4 rounded mr-2 ${category.color}`} />
            <span className="text-sm">{category.code}: {category.name}</span>
          </div>
        ))}
      </div>
      
      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Save & Continue to Datapoints
        </button>
      </div>
    </div>
  );
};
```

---

#### 3. Datapoint Management

**Purpose**: Browse, filter, and manage all ESRS datapoints

**Key Features:**
- Catalog of 1,144 ESRS datapoints
- Advanced filtering (category, mandatory/voluntary, status)
- Search functionality
- Bulk operations
- Data entry forms

**Component Structure:**
```tsx
// src/components/csrd/DatapointManagement/DatapointCatalog.tsx

export const DatapointCatalog: React.FC = () => {
  const [datapoints, setDatapoints] = useState<Datapoint[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    mandatory: null,
    searchQuery: '',
  });
  const [view, setView] = useState<'grid' | 'list' | 'table'>('list');
  
  const categoryStats = {
    E1: { total: 123, completed: 45 },
    E2: { total: 98, completed: 12 },
    E3: { total: 87, completed: 34 },
    E4: { total: 76, completed: 8 },
    E5: { total: 112, completed: 56 },
    S1: { total: 234, completed: 178 },
    S2: { total: 89, completed: 23 },
    S3: { total: 67, completed: 34 },
    S4: { total: 45, completed: 12 },
    G1: { total: 213, completed: 98 },
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">ESRS Datapoints</h1>
          <p className="text-gray-600">
            Manage all {datapoints.length} datapoints across 10 ESRS standards
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            📤 Import Data
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            📥 Export Progress
          </button>
        </div>
      </div>
      
      {/* Category Progress Tabs */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(categoryStats).map(([code, stats]) => (
            <button
              key={code}
              onClick={() => setFilters({ ...filters, category: code })}
              className={`p-4 rounded-lg border-2 transition ${
                filters.category === code
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-bold">{code}</div>
              <div className="text-sm text-gray-600">
                {stats.completed} / {stats.total}
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search datapoints..."
            className="border rounded px-4 py-2"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          />
          
          <select
            className="border rounded px-4 py-2"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="verified">Verified</option>
          </select>
          
          <select
            className="border rounded px-4 py-2"
            value={filters.mandatory === null ? '' : filters.mandatory}
            onChange={(e) => setFilters({ 
              ...filters, 
              mandatory: e.target.value === '' ? null : e.target.value === 'true' 
            })}
          >
            <option value="">All Datapoints</option>
            <option value="true">Mandatory Only</option>
            <option value="false">Voluntary Only</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              📋 List
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              📊 Table
            </button>
          </div>
        </div>
      </div>
      
      {/* Datapoint List */}
      <div className="space-y-4">
        {datapoints.map(datapoint => (
          <DatapointCard
            key={datapoint.id}
            datapoint={datapoint}
            onEdit={() => openDataEntryModal(datapoint)}
          />
        ))}
      </div>
    </div>
  );
};
```

---

#### 4. Data Entry Forms

**Purpose**: Structured forms for entering datapoint values

**Key Features:**
- Dynamic form generation based on datapoint type
- Validation rules
- File attachments
- Calculation helpers
- Auto-save drafts

**Example Form:**
```tsx
// src/components/csrd/DatapointManagement/DataEntryForm.tsx

export const DataEntryForm: React.FC<{ datapointId: string }> = ({ datapointId }) => {
  const [datapoint, setDatapoint] = useState<Datapoint | null>(null);
  const [formData, setFormData] = useState({
    reportingYear: new Date().getFullYear(),
    value: '',
    unit: '',
    dataSource: '',
    confidenceLevel: 'medium',
    methodology: '',
    supportingDocs: [],
  });
  
  const renderInputField = () => {
    // Dynamic field rendering based on datapoint type
    switch (datapoint?.metric_type) {
      case 'numeric':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">
              {datapoint.title} *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                className="flex-1 border rounded px-4 py-2"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Enter value"
              />
              <select
                className="border rounded px-4 py-2"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="">Select unit</option>
                {datapoint.allowed_units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            {datapoint.calculation_guidance && (
              <p className="text-sm text-gray-600 mt-2">
                💡 {datapoint.calculation_guidance}
              </p>
            )}
          </div>
        );
      
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">
              {datapoint.title} *
            </label>
            <textarea
              className="w-full border rounded px-4 py-2"
              rows={6}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Enter description..."
            />
            <div className="text-sm text-gray-500 mt-1">
              {formData.value.length} / {datapoint.max_length || '∞'} characters
            </div>
          </div>
        );
      
      case 'boolean':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">
              {datapoint.title} *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="boolean-value"
                  value="true"
                  checked={formData.value === 'true'}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="boolean-value"
                  value="false"
                  checked={formData.value === 'false'}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        );
      
      case 'table':
        return <DataTable datapoint={datapoint} />;
      
      default:
        return null;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datapoint Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="font-semibold text-blue-900">
              {datapoint?.datapoint_code}: {datapoint?.title}
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {datapoint?.description}
            </p>
            {datapoint?.mandatory && (
              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                Mandatory
              </span>
            )}
          </div>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => window.open(datapoint?.guidance_url, '_blank')}
          >
            📖 View Guidance
          </button>
        </div>
      </div>
      
      {/* Reporting Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Reporting Year *</label>
          <select
            className="w-full border rounded px-4 py-2"
            value={formData.reportingYear}
            onChange={(e) => setFormData({ ...formData, reportingYear: parseInt(e.target.value) })}
          >
            {[2024, 2025, 2026, 2027, 2028].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Dynamic Input Field */}
      {renderInputField()}
      
      {/* Data Source */}
      <div>
        <label className="block text-sm font-medium mb-2">Data Source *</label>
        <input
          type="text"
          className="w-full border rounded px-4 py-2"
          value={formData.dataSource}
          onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
          placeholder="e.g., ERP system, manual calculation, third-party audit"
        />
      </div>
      
      {/* Confidence Level */}
      <div>
        <label className="block text-sm font-medium mb-2">Data Confidence Level</label>
        <select
          className="w-full border rounded px-4 py-2"
          value={formData.confidenceLevel}
          onChange={(e) => setFormData({ ...formData, confidenceLevel: e.target.value })}
        >
          <option value="high">High - Verified by external audit</option>
          <option value="medium">Medium - Internal verification</option>
          <option value="low">Low - Estimated/Incomplete</option>
        </select>
      </div>
      
      {/* Methodology */}
      <div>
        <label className="block text-sm font-medium mb-2">Calculation Methodology</label>
        <textarea
          className="w-full border rounded px-4 py-2"
          rows={3}
          value={formData.methodology}
          onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
          placeholder="Explain how this value was calculated or determined..."
        />
      </div>
      
      {/* Supporting Documents */}
      <div>
        <label className="block text-sm font-medium mb-2">Supporting Documents</label>
        <FileUpload
          onUpload={(files) => setFormData({ ...formData, supportingDocs: files })}
          acceptedTypes={['.pdf', '.xlsx', '.csv', '.jpg', '.png']}
          maxSize={10 * 1024 * 1024} // 10MB
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload evidence such as invoices, reports, certificates, etc.
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          type="button"
          className="text-gray-600 hover:text-gray-800"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <div className="flex gap-2">
          <button
            type="button"
            className="px-6 py-2 border rounded hover:bg-gray-50"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit for Verification
          </button>
        </div>
      </div>
    </form>
  );
};
```

---

#### 5. Gap Analysis & Readiness Dashboard

**Purpose**: Visualize compliance readiness and identify gaps

**Key Features:**
- Overall readiness score (0-100%)
- Category-level progress
- Priority action list
- Timeline tracking

**Visualization Components:**
```tsx
// src/components/csrd/GapAnalysis/ReadinessScore.tsx

export const ReadinessScore: React.FC = () => {
  const [scoreData, setScoreData] = useState({
    overall: 0,
    categories: {},
    trending: 'up',
  });
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">CSRD Readiness Score</h2>
      
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-64 h-64">
          {/* Circular progress indicator */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="#e5e7eb"
              strokeWidth="16"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke={scoreData.overall > 70 ? '#10b981' : '#f59e0b'}
              strokeWidth="16"
              fill="none"
              strokeDasharray={`${(scoreData.overall / 100) * 754} 754`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold">{scoreData.overall}%</div>
            <div className="text-gray-600">Ready</div>
            {scoreData.trending === 'up' && (
              <div className="text-green-600 text-sm mt-2">↑ +5% this week</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="space-y-3">
        {Object.entries(scoreData.categories).map(([category, score]) => (
          <div key={category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{category}</span>
              <span>{score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  score > 70 ? 'bg-green-600' : 'bg-yellow-600'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

#### 6. Report Generation

**Purpose**: Generate compliance reports in multiple formats

**Report Types:**
1. **Gap Analysis Report**: Shows missing datapoints and action plan
2. **Readiness Assessment**: Executive summary of compliance status
3. **Full CSRD Disclosure**: Complete sustainability statement
4. **Assurance Package**: Data package for external auditors

**Component:**
```tsx
// src/components/csrd/Reporting/ReportGenerator.tsx

export const ReportGenerator: React.FC = () => {
  const [config, setConfig] = useState({
    reportType: 'gap_analysis',
    reportingPeriod: { start: '', end: '' },
    includedCategories: [],
    format: 'pdf',
    language: 'en',
  });
  
  const handleGenerate = async () => {
    try {
      const response = await api.post('/compliance/generate-report/', config);
      
      // Download report
      window.open(response.data.download_url, '_blank');
      
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Generate Compliance Report</h1>
      
      {/* Report Type Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Report Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {REPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setConfig({ ...config, reportType: type.id })}
              className={`p-4 border-2 rounded-lg text-left transition ${
                config.reportType === type.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-lg font-semibold">{type.name}</div>
              <div className="text-sm text-gray-600 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Configuration Options */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
        
        {/* Reporting Period */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Period Start</label>
            <input
              type="date"
              className="w-full border rounded px-4 py-2"
              value={config.reportingPeriod.start}
              onChange={(e) => setConfig({
                ...config,
                reportingPeriod: { ...config.reportingPeriod, start: e.target.value }
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Period End</label>
            <input
              type="date"
              className="w-full border rounded px-4 py-2"
              value={config.reportingPeriod.end}
              onChange={(e) => setConfig({
                ...config,
                reportingPeriod: { ...config.reportingPeriod, end: e.target.value }
              })}
            />
          </div>
        </div>
        
        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Included ESRS Categories</label>
          <div className="grid grid-cols-5 gap-2">
            {ESRS_CATEGORIES.map(cat => (
              <label key={cat.code} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.includedCategories.includes(cat.code)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...config.includedCategories, cat.code]
                      : config.includedCategories.filter(c => c !== cat.code);
                    setConfig({ ...config, includedCategories: updated });
                  }}
                  className="mr-2"
                />
                {cat.code}
              </label>
            ))}
          </div>
        </div>
        
        {/* Format Selection */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <select
              className="w-full border rounded px-4 py-2"
              value={config.format}
              onChange={(e) => setConfig({ ...config, format: e.target.value })}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="xml">XML (ESEF)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              className="w-full border rounded px-4 py-2"
              value={config.language}
              onChange={(e) => setConfig({ ...config, language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="de">German</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Generate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};
```

---

### Backend API Endpoints

**New endpoints to implement:**

```python
# backend/compliance/urls.py

urlpatterns = [
    # Dashboard
    path('dashboard-stats/', views.DashboardStatsView.as_view()),
    
    # Materiality Assessment
    path('materiality/', views.MaterialityAssessmentViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('materiality/<uuid:pk>/', views.MaterialityAssessmentViewSet.as_view({'get': 'retrieve', 'put': 'update'})),
    path('materiality/<uuid:pk>/matrix/', views.update_materiality_matrix),
    
    # Datapoint Management
    path('datapoints/', views.DatapointViewSet.as_view({'get': 'list'})),
    path('datapoints/<uuid:pk>/', views.DatapointViewSet.as_view({'get': 'retrieve'})),
    path('datapoints/<uuid:pk>/enter-data/', views.enter_datapoint_data),
    path('datapoints/bulk-import/', views.bulk_import_datapoints),
    
    # Gap Analysis
    path('gap-analysis/<uuid:assessment_id>/', views.generate_gap_analysis),
    path('readiness-score/<uuid:assessment_id>/', views.calculate_readiness_score),
    
    # Reporting
    path('generate-report/', views.generate_compliance_report),
    path('reports/', views.ReportListView.as_view()),
    path('reports/<uuid:pk>/download/', views.download_report),
    
    # AI Services
    path('ai/recommendations/<uuid:assessment_id>/', views.get_ai_recommendations),
    path('ai/analyze-datapoint/', views.analyze_datapoint_with_ai),
]
```

---

### AI Integration

**AI-Powered Features:**

1. **Smart Data Suggestions**
   - Pre-fill datapoints based on existing company data
   - Suggest values based on industry benchmarks

2. **Gap Analysis**
   - Identify missing mandatory datapoints
   - Prioritize datapoints by impact

3. **Automated Report Drafting**
   - Generate narrative text for disclosures
   - Suggest improvements to existing descriptions

4. **Compliance Assistant Chatbot**
   - Answer ESRS-related questions
   - Guide users through data entry

**Implementation Example:**
```python
# backend/compliance/ai_services.py

from google import generativeai as genai

class CSRDComplianceAI:
    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def suggest_datapoint_value(self, datapoint, company_context):
        """AI suggests a value for a datapoint based on company info"""
        prompt = f"""
        Company: {company_context['name']}
        Industry: {company_context['industry']}
        Size: {company_context['employee_count']} employees
        
        ESRS Datapoint: {datapoint['code']} - {datapoint['title']}
        Description: {datapoint['description']}
        
        Based on typical values for similar companies, suggest a reasonable estimate 
        for this datapoint. Explain your reasoning.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_disclosure_narrative(self, datapoint, entered_data):
        """Generate narrative text for CSRD disclosure"""
        prompt = f"""
        Generate a professional disclosure narrative for CSRD reporting:
        
        Datapoint: {datapoint['title']}
        Value: {entered_data['value']} {entered_data['unit']}
        Context: {entered_data['methodology']}
        
        Write 2-3 paragraphs explaining this metric, including methodology, 
        significance, and trends. Use formal ESG reporting language.
        """
        
        response = self.model.generate_content(prompt)
        return response.text
```

---

### 📋 TRACK B: CSRD Compliance Module

#### Phase B1: Foundation & Database Models (Weeks 1-2)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B1.1** Enhance existing compliance models
  - [ ] Update `CSRDAssessment` model with additional fields
  - [ ] Add reporting period fields
  - [ ] Add approval workflow fields
  - [ ] Create migrations
  
- [ ] **B1.2** Create new models
  - [ ] Create `MaterialityAssessment` model
  - [ ] Create `DatapointDataEntry` model
  - [ ] Create `DatapointComment` model
  - [ ] Create `ComplianceReport` model
  - [ ] Generate migrations
  - [ ] Run migrations locally
  
- [ ] **B1.3** Update serializers and viewsets
  - [ ] Create serializers for new models
  - [ ] Update existing serializers
  - [ ] Create viewsets for all models
  
- [ ] **B1.4** Build CSRD dashboard API endpoints
  - [ ] `GET /api/v1/compliance/dashboard-stats/`
  - [ ] Returns: readiness score, material topics count, datapoints progress
  - [ ] Test endpoint
  
- [ ] **B1.5** Create basic dashboard UI
  - [ ] Create `src/components/csrd/CSRDDashboard.tsx`
  - [ ] Replace existing `CSRDCompliance.tsx` with new dashboard
  - [ ] Add progress ring component
  - [ ] Add status cards
  - [ ] Add quick actions section
  - [ ] Make responsive

**Completion Criteria:**
- ✅ All models created and migrated
- ✅ Dashboard API endpoint returning data
- ✅ Dashboard UI displays key metrics
- ✅ Navigation links to all future sections

---

#### Phase B2: Materiality Assessment (Weeks 3-4)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B2.1** Build materiality API endpoints
  - [ ] `GET /api/v1/compliance/materiality/`
  - [ ] `POST /api/v1/compliance/materiality/`
  - [ ] `PUT /api/v1/compliance/materiality/<id>/`
  - [ ] `PUT /api/v1/compliance/materiality/<id>/matrix/`
  - [ ] Test all endpoints
  
- [ ] **B2.2** Create materiality matrix component
  - [ ] Create `MaterialityMatrix.tsx`
  - [ ] Implement drag-and-drop functionality
  - [ ] Create draggable topic chips
  - [ ] Add quadrant colors and labels
  - [ ] Add axis labels
  - [ ] Wire up to API
  
- [ ] **B2.3** Create stakeholder input tracker
  - [ ] Create `StakeholderInput.tsx`
  - [ ] Add stakeholder list
  - [ ] Add consultation date tracking
  - [ ] Add topic assignment per stakeholder
  - [ ] Save to MaterialityAssessment.stakeholder_consultations
  
- [ ] **B2.4** Create topic selection component
  - [ ] Create `TopicSelection.tsx`
  - [ ] List all 10 ESRS categories
  - [ ] Allow selection of material topics
  - [ ] Show description for each topic
  - [ ] Integrate with materiality matrix
  
- [ ] **B2.5** Add materiality report generation
  - [ ] Generate materiality assessment report (PDF)
  - [ ] Include matrix visualization
  - [ ] Include stakeholder consultation summary
  - [ ] Add approval workflow

**Completion Criteria:**
- ✅ Users can conduct double materiality assessment
- ✅ Matrix is interactive and saves positions
- ✅ Stakeholder consultations tracked
- ✅ Materiality report generates successfully

---

#### Phase B3: Datapoint Management (Weeks 5-6)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B3.1** Import ESRS datapoint catalog
  - [ ] Source official ESRS datapoint list (1,144 datapoints)
  - [ ] Create CSV import script
  - [ ] Populate `ESRSDatapointCatalog` model
  - [ ] Verify all datapoints imported correctly
  
- [ ] **B3.2** Build datapoint catalog API
  - [ ] `GET /api/v1/compliance/datapoints/`
  - [ ] Add filtering by category, mandatory, status
  - [ ] Add search functionality
  - [ ] Add pagination
  - [ ] Test performance with 1,144 records
  
- [ ] **B3.3** Create datapoint catalog UI
  - [ ] Create `DatapointCatalog.tsx`
  - [ ] Add category progress tabs
  - [ ] Add filter controls
  - [ ] Add search bar
  - [ ] Implement list/table view toggle
  - [ ] Add "Import Data" and "Export Progress" buttons
  
- [ ] **B3.4** Create datapoint card component
  - [ ] Create `DatapointCard.tsx`
  - [ ] Show datapoint code, title, status
  - [ ] Show mandatory/voluntary badge
  - [ ] Add "Edit" button
  - [ ] Show completion indicator
  
- [ ] **B3.5** Build dynamic data entry forms
  - [ ] Create `DataEntryForm.tsx`
  - [ ] Implement numeric input field
  - [ ] Implement text/textarea field
  - [ ] Implement boolean (yes/no) field
  - [ ] Implement table/grid field
  - [ ] Add unit selector
  - [ ] Add data source field
  - [ ] Add confidence level selector
  - [ ] Add methodology textarea
  - [ ] Add file upload for supporting documents
  
- [ ] **B3.6** Build data entry API endpoints
  - [ ] `POST /api/v1/compliance/datapoints/<id>/enter-data/`
  - [ ] Validate input based on datapoint type
  - [ ] Store in `DatapointDataEntry` model
  - [ ] Update datapoint completion status
  - [ ] Test all field types
  
- [ ] **B3.7** Implement bulk import
  - [ ] Create `BulkImport.tsx` component
  - [ ] Accept CSV/Excel file upload
  - [ ] Parse and validate data
  - [ ] Map columns to datapoints
  - [ ] Show preview before import
  - [ ] Import data entries in batch
  - [ ] Show success/error summary

**Completion Criteria:**
- ✅ All 1,144 ESRS datapoints browsable
- ✅ Users can filter and search datapoints
- ✅ Data entry forms work for all field types
- ✅ Bulk import successfully imports multiple datapoints
- ✅ Progress tracked accurately

---

#### Phase B4: Gap Analysis & AI Integration (Weeks 7-8)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B4.1** Build readiness scoring algorithm
  - [ ] Calculate completion percentage per category
  - [ ] Weight by mandatory vs. voluntary
  - [ ] Calculate overall readiness score (0-100%)
  - [ ] Factor in data quality (confidence levels)
  - [ ] Store in `CSRDAssessment.overall_readiness_score`
  
- [ ] **B4.2** Create gap analysis API endpoint
  - [ ] `GET /api/v1/compliance/gap-analysis/<assessment_id>/`
  - [ ] Return missing mandatory datapoints
  - [ ] Return incomplete voluntary datapoints
  - [ ] Prioritize by category and deadline
  - [ ] Include recommendations
  
- [ ] **B4.3** Build gap analysis UI components
  - [ ] Create `ReadinessScore.tsx` (circular progress)
  - [ ] Create `GapVisualizations.tsx` (charts)
  - [ ] Create `PriorityActions.tsx` (action list)
  - [ ] Create `Timeline.tsx` (compliance timeline)
  - [ ] Make all components interactive
  
- [ ] **B4.4** Integrate Google Gemini AI
  - [ ] Create `CSRDComplianceAI` service class
  - [ ] Implement datapoint value suggestion
  - [ ] Implement disclosure narrative generation
  - [ ] Implement gap analysis recommendations
  - [ ] Test AI responses for quality
  
- [ ] **B4.5** Build AI recommendations UI
  - [ ] Create `AIRecommendations.tsx`
  - [ ] Display AI-generated suggestions
  - [ ] Allow users to accept/reject suggestions
  - [ ] Track which suggestions were implemented
  
- [ ] **B4.6** Create benchmark comparison
  - [ ] Create `BenchmarkComparison.tsx`
  - [ ] Compare company's progress vs. industry average
  - [ ] Show category-level comparisons
  - [ ] Anonymize benchmark data

**Completion Criteria:**
- ✅ Readiness score calculates accurately
- ✅ Gap analysis identifies missing datapoints
- ✅ AI provides relevant recommendations
- ✅ Benchmarking shows meaningful comparisons

---

#### Phase B5: Report Generation (Weeks 9-10)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B5.1** Design report templates
  - [ ] Gap Analysis Report template
  - [ ] Readiness Assessment template
  - [ ] Full CSRD Disclosure template
  - [ ] Assurance Package template
  - [ ] Create mockups for each
  
- [ ] **B5.2** Build report generation engine
  - [ ] Install reportlab: `pip install reportlab`
  - [ ] Create PDF generation service
  - [ ] Implement Excel export with openpyxl
  - [ ] Implement XML/ESEF export (if needed)
  - [ ] Add company branding to reports
  
- [ ] **B5.3** Create report generation API
  - [ ] `POST /api/v1/compliance/generate-report/`
  - [ ] Accept report config (type, period, categories, format)
  - [ ] Generate report asynchronously with Celery
  - [ ] Upload to cloud storage
  - [ ] Return download URL
  
- [ ] **B5.4** Build report generator UI
  - [ ] Create `ReportGenerator.tsx`
  - [ ] Add report type selection
  - [ ] Add configuration options
  - [ ] Add preview functionality
  - [ ] Show generation progress
  - [ ] Provide download link
  
- [ ] **B5.5** Create report history UI
  - [ ] Create `ReportHistory.tsx`
  - [ ] List all generated reports
  - [ ] Show report metadata (type, date, status)
  - [ ] Add download and delete actions
  - [ ] Add approval workflow UI

**Completion Criteria:**
- ✅ All report types generate successfully
- ✅ Reports include all required data
- ✅ Reports are professionally formatted
- ✅ Users can download in multiple formats
- ✅ Report history tracks all generated reports

---

#### Phase B6: Collaboration Features (Week 11)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B6.1** Implement task assignment
  - [ ] Create `TaskAssignment.tsx`
  - [ ] Allow assigning datapoints to team members
  - [ ] Send email notifications
  - [ ] Track assignment status
  
- [ ] **B6.2** Implement comment threads
  - [ ] Create `CommentThread.tsx`
  - [ ] Add comments to datapoints
  - [ ] Add @mentions
  - [ ] Mark comments as resolved
  - [ ] Real-time updates (optional)
  
- [ ] **B6.3** Build approval workflow
  - [ ] Create `ApprovalWorkflow.tsx`
  - [ ] Add "Submit for Review" action
  - [ ] Add "Approve" / "Request Changes" actions
  - [ ] Track approval history
  - [ ] Send notifications at each step

**Completion Criteria:**
- ✅ Team members can be assigned tasks
- ✅ Comments facilitate collaboration
- ✅ Approval workflow ensures data quality

---

#### Phase B7: Testing, Polish & Launch (Week 12)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **B7.1** End-to-end testing
  - [ ] Test full user journey (assessment → data entry → report)
  - [ ] Test all ESRS categories
  - [ ] Test edge cases (missing data, invalid input)
  - [ ] Test performance with large datasets
  
- [ ] **B7.2** Performance optimization
  - [ ] Optimize database queries (add indexes)
  - [ ] Implement caching for datapoint catalog
  - [ ] Lazy load datapoint list
  - [ ] Optimize API response sizes
  
- [ ] **B7.3** User acceptance testing
  - [ ] Recruit 3-5 beta users
  - [ ] Conduct guided testing sessions
  - [ ] Collect feedback
  - [ ] Prioritize and fix critical issues
  
- [ ] **B7.4** Create user documentation
  - [ ] Write user guide (CSRD_USER_GUIDE.md)
  - [ ] Create video tutorials (5-10 min each)
  - [ ] Add in-app tooltips and hints
  - [ ] Create FAQ section
  
- [ ] **B7.5** Soft launch
  - [ ] Deploy to production
  - [ ] Announce to select user group
  - [ ] Monitor usage and errors
  - [ ] Provide white-glove support
  - [ ] Gather feedback for iteration

**Completion Criteria:**
- ✅ All features tested and working
- ✅ Performance meets targets (< 2s page load)
- ✅ User documentation complete
- ✅ Beta users successfully using the platform
- ✅ No critical bugs in production

---

## Frontend Implementation

### Landing Page Component Structure

```
src/components/landing/
├── LandingPage.tsx           # Main container
├── HeroSection.tsx            # Hero with CTA
├── SocialProofSection.tsx     # Logos & testimonials
├── ProblemSolutionSection.tsx # Pain points
├── FeaturesShowcase.tsx       # Interactive tabs
├── PricingSection.tsx         # Subscription tiers (KEY)
├── HowItWorksSection.tsx      # 3-step process
├── IntegrationsSection.tsx    # Partner logos
├── FAQSection.tsx             # Accordion FAQs
├── FinalCTASection.tsx        # Last conversion opportunity
└── Footer.tsx                 # Links & legal

src/components/payments/
├── CheckoutModal.tsx          # Stripe Elements wrapper
├── SubscriptionCard.tsx       # Individual tier card
├── CurrencySelector.tsx       # GBP/USD/EUR toggle
├── BillingToggle.tsx          # Monthly/Annual switch
├── PaymentForm.tsx            # Stripe card input
└── SubscriptionSuccess.tsx    # Post-payment confirmation

src/components/carbon-credits/
├── CarbonCheckout.tsx         # Carbon credit payment flow
└── CertificateViewer.tsx      # Display purchased certificates
```

### Key Components

#### Pricing Section Component

```tsx
// src/components/landing/PricingSection.tsx

import React, { useState } from 'react';
import { SubscriptionCard } from '../payments/SubscriptionCard';
import { CurrencySelector } from '../payments/CurrencySelector';
import { BillingToggle } from '../payments/BillingToggle';

interface PricingTier {
  id: string;
  name: string;
  price: { GBP: number; USD: number; EUR: number };
  features: string[];
  limits: string[];
  cta: string;
  popular?: boolean;
}

export const PricingSection: React.FC = () => {
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const tiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: { GBP: 9.99, USD: 12.69, EUR: 11.59 },
      features: [
        'Basic carbon tracking (50 points/month)',
        'CSRD gap analysis (10 datapoints)',
        'Monthly ESG reports',
        'E-waste tracking (100 items)',
        'AI insights (10 queries/month)',
        'Email support (48hr SLA)',
      ],
      limits: ['1 user', '50 MB storage'],
      cta: 'Start Free Trial',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { GBP: 19.99, USD: 25.39, EUR: 23.18 },
      features: [
        'Unlimited carbon data points',
        'Full CSRD compliance suite',
        'Advanced AI analytics (100 queries)',
        'Carbon credit marketplace access',
        'Custom report templates',
        'Priority support (24hr SLA)',
        'Slack/Teams integration',
      ],
      limits: ['Up to 5 users', '500 MB storage'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { GBP: 30, USD: 38.10, EUR: 34.80 },
      features: [
        'Unlimited users',
        'Full API access',
        'White-label reporting',
        'Unlimited AI queries',
        'Dedicated account manager',
        'Priority phone support (4hr SLA)',
        'SSO/SAML authentication',
        '99.9% uptime SLA',
      ],
      limits: ['Per user pricing', 'Minimum 3 users'],
      cta: 'Contact Sales',
    },
  ];
  
  const getCurrencySymbol = (curr: string) => {
    return { GBP: '£', USD: '$', EUR: '€' }[curr] || '£';
  };
  
  const getPrice = (tier: PricingTier) => {
    const basePrice = tier.price[currency];
    return billingCycle === 'annual' ? basePrice * 10 : basePrice; // 2 months free
  };
  
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start with a 14-day free trial. No credit card required.
          </p>
          
          {/* Controls */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <BillingToggle 
              value={billingCycle} 
              onChange={setBillingCycle}
            />
            <CurrencySelector 
              value={currency} 
              onChange={setCurrency}
            />
          </div>
        </div>
        
        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <SubscriptionCard
              key={tier.id}
              tier={tier}
              price={getPrice(tier)}
              currency={currency}
              currencySymbol={getCurrencySymbol(currency)}
              billingCycle={billingCycle}
              onSelect={() => handleSelectTier(tier.id)}
              highlighted={tier.popular}
            />
          ))}
        </div>
        
        {/* Trust Badges */}
        <div className="mt-12 text-center text-gray-600">
          <p className="mb-4">Join the future of ESG compliance</p>
          <div className="flex justify-center gap-8">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  );
};
```

#### Stripe Checkout Modal

```tsx
// src/components/payments/CheckoutModal.tsx

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutModalProps {
  tierId: string;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  onClose: () => void;
}

const CheckoutForm: React.FC<{ tierId: string; currency: string }> = ({ tierId, currency }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create checkout session
      const response = await api.post('/subscriptions/create-checkout-session/', {
        tier_id: tierId,
        currency,
      });
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.session_id,
      });
      
      if (error) {
        setError(error.message || 'Payment failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Start Free Trial'}
      </button>
      
      <p className="text-sm text-gray-600 text-center">
        Your card will not be charged during the 14-day trial period.
      </p>
    </form>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  tierId, 
  currency, 
  billingCycle,
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Complete Checkout</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <Elements stripe={stripePromise}>
          <CheckoutForm tierId={tierId} currency={currency} />
        </Elements>
      </div>
    </div>
  );
};
```

#### Carbon Credit Checkout

```tsx
// src/components/carbon-credits/CarbonCheckout.tsx

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CarbonCheckoutProps {
  projectId: string;
  projectName: string;
  tonnes: number;
  pricePerTonne: number;
  currency: string;
  onSuccess: () => void;
}

const CarbonCheckoutForm: React.FC<Omit<CarbonCheckoutProps, 'onSuccess'>> = ({
  projectId,
  projectName,
  tonnes,
  pricePerTonne,
  currency,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const totalAmount = tonnes * pricePerTonne;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment intent
      const { data } = await api.post('/carbon-credits/create-payment-intent/', {
        project_id: projectId,
        tonnes,
        currency,
      });
      
      // Confirm payment
      const { error: stripeError } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });
      
      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else {
        // Success - redirect to certificate page
        window.location.href = '/dashboard/carbon-credits/success';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-semibold mb-4">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Project:</span>
            <span className="font-medium">{projectName}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{tonnes} tonnes CO₂e</span>
          </div>
          <div className="flex justify-between">
            <span>Price per tonne:</span>
            <span>{currency} {pricePerTonne.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{currency} {totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Card Details</label>
        <div className="border rounded-lg p-3">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Processing Payment...' : `Pay ${currency} ${totalAmount.toFixed(2)}`}
      </button>
      
      <p className="text-xs text-gray-600 text-center">
        Your certificate will be issued immediately upon successful payment.
      </p>
    </form>
  );
};

export const CarbonCheckout: React.FC<CarbonCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CarbonCheckoutForm {...props} />
    </Elements>
  );
};
```

---

### Routing Updates

```tsx
// src/App.tsx - Add new routes

import { LandingPage } from './components/landing/LandingPage';
import { SubscriptionSuccess } from './components/payments/SubscriptionSuccess';

// Update routes
<Routes>
  {/* Public landing page */}
  <Route path="/" element={<LandingPage />} />
  
  {/* Payment success pages */}
  <Route path="/subscription-success" element={<SubscriptionSuccess />} />
  <Route path="/carbon-credit-success" element={<CarbonCreditSuccess />} />
  
  {/* Existing authenticated routes */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  {/* ... */}
</Routes>
```

---

## Security & Compliance

### Data Protection

1. **PCI DSS Compliance**
   - ✅ Never store card details (Stripe handles this)
   - ✅ Use Stripe Elements for card input
   - ✅ HTTPS everywhere
   - ✅ Webhook signature verification

2. **GDPR Compliance**
   - User consent for payment data processing
   - Data retention policy (7 years for tax records)
   - Right to erasure (with legal retention exceptions)
   - Privacy policy updated to mention payment providers

3. **Encryption**
   - Database: Encrypt sensitive fields (Stripe customer IDs)
   - Transit: TLS 1.3 for all API calls
   - At rest: Django field-level encryption for metadata

### Fraud Prevention

1. **Stripe Radar** (built-in)
   - ML-based fraud detection
   - 3D Secure for high-risk transactions
   - Rate limiting on checkout endpoints

2. **Application-Level**
   - Rate limit: 5 checkout attempts per 15 minutes per IP
   - CAPTCHA on signup form
   - Email verification before trial activation
   - Geographic restrictions (block high-risk countries)

### Legal Requirements

**Documents to Create:**
1. **Terms of Service** (updated)
   - Subscription terms
   - Cancellation policy
   - Refund policy (prorated refunds within 30 days)

2. **Privacy Policy** (updated)
   - Payment data handling
   - Third-party processor disclosure (Stripe, PayPal)

3. **Cookie Policy**
   - Analytics cookies (Stripe.js, Google Analytics)

4. **Service Level Agreement (SLA)**
   - Enterprise tier only
   - 99.9% uptime guarantee
   - Credit calculation for downtime

---

## Testing Strategy

### Unit Tests

**Backend:**
```python
# backend/payments/tests/test_stripe.py

class StripeServiceTestCase(TestCase):
    def test_create_checkout_session(self):
        """Test Stripe checkout session creation"""
        pass
    
    def test_handle_webhook_checkout_complete(self):
        """Test webhook processing for successful checkout"""
        pass
    
    def test_subscription_upgrade(self):
        """Test tier upgrade logic"""
        pass
    
    def test_currency_conversion(self):
        """Test multi-currency pricing"""
        pass
```

**Frontend:**
```tsx
// src/components/payments/__tests__/PricingSection.test.tsx

describe('PricingSection', () => {
  test('renders all three tiers', () => {});
  test('currency selector updates prices', () => {});
  test('annual toggle shows discounted prices', () => {});
  test('clicking CTA opens checkout modal', () => {});
});
```

### Integration Tests

```python
# backend/tests/test_payment_flow.py

class PaymentFlowIntegrationTest(TestCase):
    def test_full_subscription_flow(self):
        """
        End-to-end test:
        1. Create checkout session
        2. Simulate Stripe webhook
        3. Verify user account created
        4. Verify subscription active
        5. Verify welcome email sent
        """
        pass
```

### Manual Testing Checklist

**Pre-Launch:**
- [ ] Test all three tiers in test mode
- [ ] Test annual vs. monthly billing
- [ ] Test all three currencies
- [ ] Test trial activation
- [ ] Test cancellation flow
- [ ] Test upgrade/downgrade
- [ ] Test failed payment scenario
- [ ] Test webhook delivery (use Stripe CLI)
- [ ] Test carbon credit purchase
- [ ] Test certificate generation
- [ ] Test email notifications
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing (iOS/Android)

---

## Deployment Plan & Implementation Tracker

### Implementation Overview

This plan is divided into **two parallel tracks**:
- **Track A**: Landing Page & Subscription System (Weeks 1-5)
- **Track B**: CSRD Compliance Module (Weeks 1-12, overlapping)

We'll use a systematic approach, checking off tasks as completed and updating the plan to avoid duplication.

---

### 📋 TRACK A: Landing Page & Subscription System

#### Phase A1: Infrastructure Setup (Week 1)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **A1.1** Create Stripe account (live + test environments)
  - [ ] Register at stripe.com
  - [ ] Verify business details
  - [ ] Enable test mode
  - [ ] Document account IDs
  
- [ ] **A1.2** Configure subscription products in Stripe Dashboard
  - [ ] Create "Starter Monthly GBP" product (£9.99)
  - [ ] Create "Professional Monthly GBP" product (£19.99)
  - [ ] Create "Enterprise Monthly GBP" product (£30.00 per user)
  - [ ] Create annual variants with 15% discount
  - [ ] Duplicate all products for USD and EUR
  - [ ] Set up 14-day trial period on all products
  - [ ] Document all Price IDs in environment config
  
- [ ] **A1.3** Set up webhook endpoints
  - [ ] Create webhook endpoint URL: `/api/v1/webhooks/stripe/`
  - [ ] Register webhook in Stripe Dashboard
  - [ ] Configure events to listen for (see Webhook Event Reference in appendix)
  - [ ] Generate webhook signing secret
  - [ ] Test webhook delivery with Stripe CLI
  
- [ ] **A1.4** Add environment variables to Vercel
  ```bash
  # Stripe
  STRIPE_PUBLISHABLE_KEY=pk_test_... (later pk_live_...)
  STRIPE_SECRET_KEY=sk_test_... (later sk_live_...)
  STRIPE_WEBHOOK_SECRET=whsec_...
  
  # PayPal (Phase 2)
  PAYPAL_CLIENT_ID=...
  PAYPAL_SECRET=...
  
  # Exchange Rates
  EXCHANGE_RATE_API_KEY=...
  
  # Frontend
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  ```
  
- [ ] **A1.5** Create backend payment models
  - [ ] Create `backend/payments/` Django app
  - [ ] Define models: SubscriptionTier, Subscription, Transaction, CarbonCreditTransaction
  - [ ] Create serializers
  - [ ] Generate migrations
  - [ ] Run migrations locally
  
- [ ] **A1.6** Deploy backend to Vercel
  - [ ] Commit payment models
  - [ ] Push to main branch
  - [ ] Run migrations on production database
  - [ ] Verify API endpoints are accessible

**Completion Criteria:**
- ✅ Stripe account active with test products configured
- ✅ Webhook endpoint receiving test events
- ✅ Environment variables set in Vercel
- ✅ Database migrations applied successfully
- ✅ Payment models accessible via Django admin

---

#### Phase A2: Landing Page Development (Week 2)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **A2.1** Create landing page component structure
  - [ ] Create `src/components/landing/` directory
  - [ ] Create `LandingPage.tsx` main container
  - [ ] Set up routing: `/` → LandingPage (unauthenticated)
  - [ ] Set up routing: `/dashboard` → Dashboard (authenticated)
  
- [ ] **A2.2** Build Hero Section
  - [ ] Implement gradient background
  - [ ] Add headline and value proposition
  - [ ] Create primary CTA buttons ("Start Free Trial", "Watch Demo")
  - [ ] Add trust badges
  - [ ] Implement animated dashboard preview (optional video)
  - [ ] Make fully responsive (mobile-first)
  
- [ ] **A2.3** Build Social Proof Section
  - [ ] Display key metrics (ESRS datapoints, security standards)
  - [ ] Add trust badges (ISO, GDPR, SOC 2)
  - [ ] Style with icon components
  
- [ ] **A2.4** Build Problem/Solution Section
  - [ ] Create 3-column layout
  - [ ] Add pain points, solutions, and results
  - [ ] Add icons/illustrations
  
- [ ] **A2.5** Build Features Showcase
  - [ ] Create interactive tab component
  - [ ] Add tabs: Carbon Management, CSRD Compliance, AI Insights, Carbon Credits
  - [ ] Create mockup visuals for each tab
  - [ ] Implement smooth transitions
  
- [ ] **A2.6** Build Pricing Section (Core CTA)
  - [ ] Create `PricingSection.tsx`
  - [ ] Create `SubscriptionCard.tsx` component
  - [ ] Create `CurrencySelector.tsx` (GBP/USD/EUR toggle)
  - [ ] Create `BillingToggle.tsx` (Monthly/Annual)
  - [ ] Implement 3-column tier comparison
  - [ ] Highlight Professional tier as "Most Popular"
  - [ ] Wire up "Start Free Trial" buttons
  
- [ ] **A2.7** Build How It Works Section
  - [ ] Create 3-step visual flow
  - [ ] Add icons and descriptions
  
- [ ] **A2.8** Build Integration Partners Section
  - [ ] Create logo grid (Xero, QuickBooks, Slack, etc.)
  - [ ] Add hover effects
  
- [ ] **A2.9** Build FAQ Section
  - [ ] Create accordion component
  - [ ] Add 10+ common questions and answers
  - [ ] Implement expand/collapse functionality
  
- [ ] **A2.10** Build Final CTA Section
  - [ ] Repeat primary CTA with different copy
  - [ ] Add secondary "Schedule Demo" button
  
- [ ] **A2.11** Build Footer
  - [ ] Add navigation links (Product, Company, Resources, Legal)
  - [ ] Add social media links
  - [ ] Add copyright notice
  
- [ ] **A2.12** Implement responsive design
  - [ ] Test on mobile (320px - 768px)
  - [ ] Test on tablet (768px - 1024px)
  - [ ] Test on desktop (1024px+)
  - [ ] Fix any layout issues
  
- [ ] **A2.13** Add animations with Framer Motion
  - [ ] Install framer-motion: `npm install framer-motion`
  - [ ] Add scroll animations (fade in, slide up)
  - [ ] Add hover animations on cards
  - [ ] Keep animations subtle and performant
  
- [ ] **A2.14** SEO optimization
  - [ ] Add meta tags (title, description, keywords)
  - [ ] Create Open Graph image (1200x630px)
  - [ ] Add JSON-LD schema markup (Organization, Product)
  - [ ] Test with Google Rich Results Test
  - [ ] Add sitemap.xml
  - [ ] Add robots.txt
  
- [ ] **A2.15** Deploy to Vercel
  - [ ] Commit all landing page components
  - [ ] Push to main branch
  - [ ] Verify deployment at production URL
  - [ ] Test all sections render correctly

**Completion Criteria:**
- ✅ Landing page accessible at root URL
- ✅ All sections render correctly
- ✅ Responsive on all device sizes
- ✅ Animations smooth and performant
- ✅ SEO score > 90 in Lighthouse

---

#### Phase A3: Payment Integration (Week 3)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **A3.1** Install Stripe libraries
  - [ ] Backend: `pip install stripe`
  - [ ] Frontend: `npm install @stripe/stripe-js @stripe/react-stripe-js`
  
- [ ] **A3.2** Implement backend API endpoints
  - [ ] `POST /api/v1/subscriptions/create-checkout-session/`
  - [ ] `GET /api/v1/subscriptions/current/`
  - [ ] `POST /api/v1/subscriptions/cancel/`
  - [ ] `POST /api/v1/subscriptions/resume/`
  - [ ] `POST /api/v1/subscriptions/upgrade/`
  - [ ] `GET /api/v1/subscriptions/billing-portal/`
  - [ ] Write tests for each endpoint
  
- [ ] **A3.3** Implement webhook handler
  - [ ] Create `backend/payments/webhooks.py`
  - [ ] Handle `checkout.session.completed`
  - [ ] Handle `customer.subscription.updated`
  - [ ] Handle `customer.subscription.deleted`
  - [ ] Handle `invoice.payment_succeeded`
  - [ ] Handle `invoice.payment_failed`
  - [ ] Add signature verification
  - [ ] Add logging and error handling
  - [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe/`
  
- [ ] **A3.4** Implement user provisioning pipeline
  - [ ] Create Celery task: `provision_user_account`
  - [ ] Create user account on successful payment
  - [ ] Assign subscription tier
  - [ ] Set trial period
  - [ ] Send welcome email
  - [ ] Test full flow in test mode
  
- [ ] **A3.5** Create email templates
  - [ ] Welcome email (subscription activated)
  - [ ] Trial ending email (3 days before)
  - [ ] Payment successful email
  - [ ] Payment failed email (dunning)
  - [ ] Subscription canceled email
  - [ ] Test email delivery
  
- [ ] **A3.6** Build frontend checkout flow
  - [ ] Create `CheckoutModal.tsx`
  - [ ] Integrate Stripe Elements
  - [ ] Handle form submission
  - [ ] Redirect to Stripe Checkout
  - [ ] Create success page: `/subscription-success`
  - [ ] Create cancel page: `/subscription-canceled`
  
- [ ] **A3.7** Implement subscription management UI
  - [ ] Create "Subscription" tab in dashboard
  - [ ] Show current plan and billing info
  - [ ] Add "Upgrade" button
  - [ ] Add "Cancel" button with confirmation
  - [ ] Add "Billing Portal" link (Stripe-hosted)
  
- [ ] **A3.8** Testing in Stripe test mode
  - [ ] Test successful subscription signup
  - [ ] Test trial period activation
  - [ ] Test payment failure scenarios
  - [ ] Test webhook delivery
  - [ ] Test user provisioning
  - [ ] Test email notifications
  - [ ] Test upgrade flow
  - [ ] Test cancellation flow
  
- [ ] **A3.9** QA approval
  - [ ] Conduct end-to-end testing
  - [ ] Fix any bugs found
  - [ ] Get stakeholder sign-off
  
- [ ] **A3.10** Switch to live Stripe keys
  - [ ] Update environment variables with live keys
  - [ ] Re-test webhook delivery
  - [ ] Monitor Stripe Dashboard for first live transaction
  - [ ] Gradual rollout (internal team first)

**Completion Criteria:**
- ✅ Users can sign up for trial via landing page
- ✅ Webhooks successfully provision accounts
- ✅ Email notifications send correctly
- ✅ Subscription management UI functional
- ✅ All tests passing in live mode

---

#### Phase A4: Carbon Credit Integration (Week 4)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **A4.1** Create carbon credit payment intent endpoint
  - [ ] `POST /api/v1/carbon-credits/create-payment-intent/`
  - [ ] Calculate total amount (tonnes × price)
  - [ ] Apply currency conversion
  - [ ] Create Stripe PaymentIntent
  - [ ] Store pending transaction
  
- [ ] **A4.2** Implement webhook handler for carbon credits
  - [ ] Handle `payment_intent.succeeded` for carbon credits
  - [ ] Mark transaction as completed
  - [ ] Trigger certificate generation
  - [ ] Update user's carbon credit balance
  
- [ ] **A4.3** Build certificate generation service
  - [ ] Create PDF certificate template
  - [ ] Include transaction details (ID, amount, project, date)
  - [ ] Upload certificate to cloud storage (S3/GCS)
  - [ ] Store certificate URL in database
  - [ ] Send certificate email to user
  
- [ ] **A4.4** Build frontend carbon credit checkout
  - [ ] Create `CarbonCheckout.tsx` component
  - [ ] Add quantity selector (tonnes)
  - [ ] Display total price with currency selector
  - [ ] Integrate Stripe CardElement
  - [ ] Handle payment submission
  - [ ] Show loading state
  - [ ] Redirect to success page
  
- [ ] **A4.5** Create certificate viewer UI
  - [ ] Create `CertificateViewer.tsx`
  - [ ] Display certificate details
  - [ ] Add download PDF button
  - [ ] List all user's certificates
  - [ ] Add filtering by date/project
  
- [ ] **A4.6** Test end-to-end carbon credit purchase
  - [ ] Test in Stripe test mode
  - [ ] Verify payment intent creation
  - [ ] Verify webhook delivery
  - [ ] Verify certificate generation
  - [ ] Verify email delivery
  - [ ] Test in live mode with real transaction
  
- [ ] **A4.7** Deploy to production
  - [ ] Commit all changes
  - [ ] Push to main branch
  - [ ] Verify deployment
  - [ ] Test live carbon credit purchase

**Completion Criteria:**
- ✅ Users can purchase carbon credits with payment
- ✅ Certificates generate automatically
- ✅ Emails deliver with certificate attachment
- ✅ Certificate viewer UI displays all purchases

---

#### Phase A5: Monitoring & Optimization (Week 5+)

**Status**: 🔴 Not Started

**Tasks:**
- [ ] **A5.1** Set up error tracking
  - [ ] Create Sentry account
  - [ ] Install Sentry SDK: `npm install @sentry/react @sentry/node`
  - [ ] Configure Sentry in frontend and backend
  - [ ] Test error reporting
  
- [ ] **A5.2** Configure analytics dashboards
  - [ ] Set up Google Analytics 4
  - [ ] Set up Mixpanel (optional)
  - [ ] Track key events: page views, CTA clicks, signups, purchases
  - [ ] Create conversion funnel
  
- [ ] **A5.3** Monitor conversion rates
  - [ ] Track landing page → pricing views
  - [ ] Track pricing views → checkout initiated
  - [ ] Track checkout initiated → completed
  - [ ] Calculate trial-to-paid conversion
  - [ ] Set up weekly reports
  
- [ ] **A5.4** A/B testing setup
  - [ ] Install A/B testing framework (Vercel Edge Config or split.io)
  - [ ] Create test variants for pricing page
  - [ ] Create test variants for hero section
  - [ ] Run tests for 2 weeks minimum
  - [ ] Analyze results and implement winner
  
- [ ] **A5.5** Iterate based on user feedback
  - [ ] Set up user feedback form
  - [ ] Conduct user interviews
  - [ ] Identify pain points
  - [ ] Prioritize improvements
  - [ ] Implement high-impact changes

**Completion Criteria:**
- ✅ Error tracking active with < 0.1% error rate
- ✅ Analytics tracking all key events
- ✅ A/B tests running with statistical significance
- ✅ Conversion rate > 5% (trial signups)
- ✅ Churn rate < 10% monthly

---

## Analytics & Monitoring

### Key Metrics to Track

**Conversion Funnel:**
1. Landing page visitors
2. Pricing page views
3. Checkout initiated
4. Checkout completed
5. Trial-to-paid conversion rate

**Revenue Metrics:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Churn rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)

**Product Metrics:**
- Active subscriptions by tier
- Trial conversion rate
- Upgrade rate
- Downgrade rate
- Cancellation reasons

### Tools

1. **Google Analytics 4**
   - Event tracking: `view_pricing`, `initiate_checkout`, `purchase`
   - Goal conversions

2. **Mixpanel**
   - Funnel analysis
   - Cohort retention
   - User segmentation

3. **Stripe Dashboard**
   - Built-in revenue analytics
   - Failed payment reports
   - Radar fraud insights

4. **Custom Admin Dashboard**
   - Real-time subscription stats
   - Revenue charts
   - User tier distribution

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **Usage-Based Billing**
   - Meter AI query usage
   - Overage charges for data storage
   - Per-API-call pricing for Enterprise

2. **Partner Referral Program**
   - Affiliate system
   - 20% commission for referrals
   - Custom tracking links

3. **Marketplace Expansion**
   - Automated carbon credit trading
   - Bid/ask order book
   - Portfolio analytics

4. **White-Label Solution**
   - Allow Enterprise clients to rebrand platform
   - Custom domain support
   - API-first architecture

5. **Mobile App**
   - Native iOS/Android apps
   - Push notifications for compliance deadlines
   - Offline data entry

6. **Advanced AI Features**
   - Predictive emissions modeling
   - Supply chain carbon tracking
   - Automated ESG report generation

7. **Integrations**
   - QuickBooks/Xero for financial data
   - SAP/Oracle ERP connectors
   - IoT sensor data ingestion

8. **Blockchain Verification**
   - On-chain carbon credit certificates
   - Immutable audit trails
   - NFT-based ownership

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Stripe API downtime | High | Low | Implement retry logic, queue failed webhooks |
| Webhook delivery failure | High | Medium | Use Stripe CLI for local testing, monitor webhook logs |
| Payment fraud | Medium | Medium | Enable Stripe Radar, implement rate limiting |
| Currency conversion API failure | Low | Low | Cache rates, fallback to static rates |

### Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low conversion rate | High | Medium | A/B test pricing, offer 14-day trial |
| High churn rate | High | Medium | Improve onboarding, add customer success team |
| Pricing too low | Medium | Medium | Monitor ARPU, adjust after 3 months |
| Competitor undercuts pricing | Medium | Medium | Focus on feature differentiation, not price |

---

## Success Criteria

### Launch Goals (First 90 Days)

- **Users**: 100 paid subscriptions
- **MRR**: £1,500 minimum
- **Conversion Rate**: 5% trial-to-paid
- **Churn Rate**: <10% monthly
- **Support Tickets**: <5% of users require payment support

### 12-Month Goals

- **Users**: 1,000 paid subscriptions
- **ARR**: £200,000+
- **Tier Distribution**: 60% Starter, 30% Professional, 10% Enterprise
- **Carbon Credits**: £50,000 transacted through marketplace

---

## Appendix

### A. Stripe Product Configuration

**Product Setup (Stripe Dashboard):**

1. **Starter Monthly (GBP)**
   - Product ID: `prod_starter`
   - Price ID: `price_starter_monthly_gbp`
   - Amount: £9.99
   - Recurring: Monthly

2. **Starter Annual (GBP)**
   - Price ID: `price_starter_annual_gbp`
   - Amount: £99.90
   - Recurring: Yearly

3. *[Repeat for Professional and Enterprise, all currencies]*

---

### B. Webhook Event Reference

**Events to Handle:**

| Event | Description | Handler |
|-------|-------------|---------|
| `checkout.session.completed` | User completed checkout | Create user + subscription |
| `customer.subscription.created` | Subscription created | Send welcome email |
| `customer.subscription.updated` | Subscription changed | Update tier/status |
| `customer.subscription.deleted` | Subscription canceled | Disable account |
| `invoice.payment_succeeded` | Payment successful | Extend subscription period |
| `invoice.payment_failed` | Payment failed | Send dunning email |
| `payment_intent.succeeded` | One-time payment success | Process carbon credit purchase |

---

### C. Email Templates

**Required Templates:**

1. **Welcome Email** (subscription activated)
2. **Trial Ending** (3 days before trial ends)
3. **Payment Successful** (monthly/annual charge)
4. **Payment Failed** (dunning sequence)
5. **Subscription Canceled** (confirmation)
6. **Carbon Certificate** (purchase confirmation + PDF)
7. **Upgrade Confirmation** (tier change)

---

### D. Admin Dashboard Additions

**New Admin Pages:**

1. `/admin/subscriptions/`
   - List all active subscriptions
   - Filter by tier, status, currency
   - Export to CSV

2. `/admin/transactions/`
   - Payment history
   - Refund management
   - Fraud review queue

3. `/admin/carbon-credits/`
   - Transaction log
   - Certificate regeneration
   - Marketplace analytics

---

## Implementation Timeline

```
Week 1-2:  Stripe setup, backend models, landing page design
Week 3-4:  Payment integration, webhook handlers, user provisioning
Week 5-6:  Carbon credit checkout, certificate generation
Week 7:    QA testing, security audit
Week 8:    Soft launch (limited users, test mode)
Week 9:    Live mode enabled, full launch
Week 10+:  Monitor, optimize, iterate
```

---

## Conclusion

This plan provides a comprehensive roadmap for implementing a modern subscription system with integrated payment processing. The three-tier pricing structure caters to different market segments while maintaining profitability. The landing page is designed for conversion optimization, and the payment integration follows industry best practices for security and user experience.

**Key Success Factors:**
1. Seamless user experience (minimal friction in checkout)
2. Clear value proposition (features justify pricing)
3. Trust signals (security badges, testimonials, trial period)
4. Multi-currency support (global reach)
5. Automated provisioning (instant access post-payment)
6. Robust error handling (webhook reliability)
7. Continuous optimization (A/B testing, analytics)

**Next Steps:**
1. Review and approve this plan
2. Assign development resources
3. Set up project management board
4. Begin Phase 1 infrastructure work

---

*Document Version: 1.0*  
*Last Updated: 5 October 2025*  
*Owner: Product Team*  
*Status: Awaiting Approval*
