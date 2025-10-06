"""
Stripe Service Layer
Handles all Stripe API interactions
"""
import stripe
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

# Configure Stripe API key
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service class for Stripe operations"""
    
    @staticmethod
    def create_checkout_session(user, tier, currency='GBP', billing_cycle='monthly', success_url=None, cancel_url=None):
        """
        Create a Stripe Checkout Session for subscription signup
        
        Args:
            user: Django User instance
            tier: SubscriptionTier instance
            currency: 'GBP', 'USD', or 'EUR'
            billing_cycle: 'monthly' or 'annual'
            success_url: Optional success URL
            cancel_url: Optional cancel URL
        
        Returns:
            dict: Checkout session data including session_id and url
        """
        try:
            # Get Stripe Price ID for the tier and currency
            price_id = tier.get_stripe_price_id(currency)
            
            if not price_id:
                raise ValueError(f"No Stripe Price ID configured for {tier.name} in {currency}")
            
            # Default URLs if not provided
            if not success_url:
                success_url = f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
            if not cancel_url:
                cancel_url = f"{settings.FRONTEND_URL}/checkout/cancelled"
            
            # Create or retrieve Stripe customer
            customer_id = StripeService._get_or_create_customer(user)
            
            # Calculate trial end (14 days from now)
            trial_end = int((datetime.now() + timedelta(days=14)).timestamp())
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
                subscription_data={
                    'trial_end': trial_end if tier.tier != 'free' else None,
                    'metadata': {
                        'user_id': user.id,
                        'tier_id': tier.id,
                        'tier_name': tier.name,
                    }
                },
                metadata={
                    'user_id': user.id,
                    'tier_id': tier.id,
                    'tier_name': tier.name,
                },
                allow_promotion_codes=True,
                billing_address_collection='required',
            )
            
            logger.info(f"Created checkout session {session.id} for user {user.email}")
            
            return {
                'session_id': session.id,
                'url': session.url,
                'customer_id': customer_id,
            }
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            raise
    
    @staticmethod
    def _get_or_create_customer(user):
        """Get existing Stripe customer or create new one"""
        try:
            # Check if user already has a subscription with customer_id
            if hasattr(user, 'subscription') and user.subscription.stripe_customer_id:
                return user.subscription.stripe_customer_id
            
            # Search for existing customer by email
            customers = stripe.Customer.list(email=user.email, limit=1)
            if customers.data:
                return customers.data[0].id
            
            # Create new customer
            customer = stripe.Customer.create(
                email=user.email,
                name=user.get_full_name() or user.username,
                metadata={'user_id': user.id}
            )
            
            logger.info(f"Created Stripe customer {customer.id} for user {user.email}")
            return customer.id
        
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error getting/creating customer: {str(e)}")
            raise
    
    @staticmethod
    def get_subscription(subscription_id):
        """Retrieve subscription details from Stripe"""
        try:
            return stripe.Subscription.retrieve(subscription_id)
        except stripe.error.StripeError as e:
            logger.error(f"Error retrieving subscription {subscription_id}: {str(e)}")
            raise
    
    @staticmethod
    def cancel_subscription(subscription_id, cancel_immediately=False):
        """
        Cancel a Stripe subscription
        
        Args:
            subscription_id: Stripe subscription ID
            cancel_immediately: If True, cancel now. If False, cancel at period end.
        
        Returns:
            Updated subscription object
        """
        try:
            if cancel_immediately:
                subscription = stripe.Subscription.delete(subscription_id)
            else:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            
            logger.info(f"Cancelled subscription {subscription_id} (immediate={cancel_immediately})")
            return subscription
        
        except stripe.error.StripeError as e:
            logger.error(f"Error cancelling subscription {subscription_id}: {str(e)}")
            raise
    
    @staticmethod
    def create_billing_portal_session(customer_id, return_url=None):
        """Create a Stripe billing portal session for customer self-service"""
        try:
            if not return_url:
                return_url = f"{settings.FRONTEND_URL}/dashboard/subscription"
            
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            
            return {'url': session.url}
        
        except stripe.error.StripeError as e:
            logger.error(f"Error creating billing portal session: {str(e)}")
            raise
    
    @staticmethod
    def create_payment_intent_for_carbon_credits(user, amount, currency, project_details):
        """
        Create a Payment Intent for one-time carbon credit purchase
        
        Args:
            user: Django User instance
            amount: Total amount in smallest currency unit (e.g., pence)
            currency: 'GBP', 'USD', or 'EUR'
            project_details: Dict with project information
        
        Returns:
            dict: Payment intent data including client_secret
        """
        try:
            customer_id = StripeService._get_or_create_customer(user)
            
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents/pence
                currency=currency.lower(),
                customer=customer_id,
                metadata={
                    'type': 'carbon_credit',
                    'user_id': user.id,
                    'project_id': project_details.get('project_id'),
                    'project_name': project_details.get('project_name'),
                    'tonnes': str(project_details.get('tonnes')),
                },
                receipt_email=user.email,
                description=f"Carbon Credits: {project_details.get('tonnes')}t CO2e from {project_details.get('project_name')}",
            )
            
            logger.info(f"Created payment intent {intent.id} for carbon credits")
            
            return {
                'payment_intent_id': intent.id,
                'client_secret': intent.client_secret,
                'amount': amount,
                'currency': currency,
            }
        
        except stripe.error.StripeError as e:
            logger.error(f"Error creating payment intent: {str(e)}")
            raise
    
    @staticmethod
    def update_subscription_tier(subscription_id, new_price_id):
        """Update subscription to a new tier/price"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': subscription['items']['data'][0].id,
                    'price': new_price_id,
                }],
                proration_behavior='create_prorations',
            )
            
            logger.info(f"Updated subscription {subscription_id} to new price {new_price_id}")
            return subscription
        
        except stripe.error.StripeError as e:
            logger.error(f"Error updating subscription tier: {str(e)}")
            raise
