"""
Subscription Views and API Endpoints
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
import stripe
import logging

from .models import SubscriptionTier, Subscription, Transaction, CarbonCreditTransaction
from .serializers import (
    SubscriptionTierSerializer,
    SubscriptionSerializer,
    TransactionSerializer,
    CarbonCreditTransactionSerializer,
    CreateCheckoutSessionSerializer,
    CreateCarbonCreditPaymentSerializer,
)
from .services import StripeService

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY


class SubscriptionTierViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing subscription tiers - PUBLIC endpoint"""
    queryset = SubscriptionTier.objects.filter(is_active=True)
    serializer_class = SubscriptionTierSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # Explicitly disable authentication for this endpoint


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user subscriptions"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own subscription
        return Subscription.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's subscription"""
        try:
            subscription = Subscription.objects.get(user=request.user)
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        except Subscription.DoesNotExist:
            return Response(
                {'detail': 'No subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def create_checkout_session(self, request):
        """Create a Stripe Checkout Session"""
        serializer = CreateCheckoutSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            tier = SubscriptionTier.objects.get(id=serializer.validated_data['tier_id'])
            
            session_data = StripeService.create_checkout_session(
                user=request.user,
                tier=tier,
                currency=serializer.validated_data.get('currency', 'GBP'),
                billing_cycle=serializer.validated_data.get('billing_cycle', 'monthly'),
                success_url=serializer.validated_data.get('success_url'),
                cancel_url=serializer.validated_data.get('cancel_url'),
            )
            
            return Response(session_data, status=status.HTTP_200_OK)
        
        except SubscriptionTier.DoesNotExist:
            return Response(
                {'error': 'Invalid tier_id'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return Response(
                {'error': 'Failed to create checkout session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """Cancel user's subscription"""
        try:
            subscription = Subscription.objects.get(user=request.user)
            
            if subscription.is_free_tier():
                return Response(
                    {'error': 'Cannot cancel free tier'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cancel_immediately = request.data.get('immediate', False)
            
            # Cancel in Stripe
            StripeService.cancel_subscription(
                subscription.stripe_subscription_id,
                cancel_immediately=cancel_immediately
            )
            
            # Update local subscription
            subscription.cancel()
            
            return Response({
                'message': 'Subscription cancelled successfully',
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'current_period_end': subscription.current_period_end,
            })
        
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'No subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error cancelling subscription: {str(e)}")
            return Response(
                {'error': 'Failed to cancel subscription'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def billing_portal(self, request):
        """Get Stripe billing portal URL"""
        try:
            subscription = Subscription.objects.get(user=request.user)
            
            if not subscription.stripe_customer_id:
                return Response(
                    {'error': 'No Stripe customer ID found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            portal_data = StripeService.create_billing_portal_session(
                subscription.stripe_customer_id,
                return_url=request.data.get('return_url')
            )
            
            return Response(portal_data)
        
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'No subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error creating billing portal: {str(e)}")
            return Response(
                {'error': 'Failed to create billing portal session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing transaction history"""
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own transactions
        return Transaction.objects.filter(subscription__user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_carbon_credit_payment(request):
    """Create a payment intent for carbon credit purchase"""
    serializer = CreateCarbonCreditPaymentSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        # Here you would fetch the actual project details from your database
        # For now, we'll use placeholder data
        project_details = {
            'project_id': serializer.validated_data['project_id'],
            'project_name': 'Sample Reforestation Project',
            'tonnes': serializer.validated_data['tonnes'],
        }
        
        # Calculate amount (placeholder: £10 per tonne)
        price_per_tonne = 10
        total_amount = float(serializer.validated_data['tonnes']) * price_per_tonne
        
        # Create payment intent
        intent_data = StripeService.create_payment_intent_for_carbon_credits(
            user=request.user,
            amount=total_amount,
            currency=serializer.validated_data.get('currency', 'GBP'),
            project_details=project_details,
        )
        
        # Create pending transaction record
        CarbonCreditTransaction.objects.create(
            user=request.user,
            stripe_payment_intent_id=intent_data['payment_intent_id'],
            credit_amount_tonnes=serializer.validated_data['tonnes'],
            price_per_tonne=price_per_tonne,
            total_amount=total_amount,
            currency=intent_data['currency'],
            project_id=project_details['project_id'],
            project_name=project_details['project_name'],
            verification_standard='VCS',
            status='pending',
        )
        
        return Response(intent_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error creating carbon credit payment: {str(e)}")
        return Response(
            {'error': 'Failed to create payment'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Webhook handler
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    event_type = event['type']
    logger.info(f"Received Stripe webhook: {event_type}")
    
    try:
        if event_type == 'checkout.session.completed':
            handle_checkout_complete(event['data']['object'])
        
        elif event_type == 'customer.subscription.created':
            handle_subscription_created(event['data']['object'])
        
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event['data']['object'])
        
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event['data']['object'])
        
        elif event_type == 'invoice.payment_succeeded':
            handle_invoice_payment_succeeded(event['data']['object'])
        
        elif event_type == 'invoice.payment_failed':
            handle_invoice_payment_failed(event['data']['object'])
        
        elif event_type == 'payment_intent.succeeded':
            handle_payment_intent_succeeded(event['data']['object'])
        
        elif event_type == 'payment_intent.payment_failed':
            handle_payment_intent_failed(event['data']['object'])
    
    except Exception as e:
        logger.error(f"Error handling webhook {event_type}: {str(e)}")
        return JsonResponse({'error': 'Webhook handler error'}, status=500)
    
    return JsonResponse({'status': 'success'})


def handle_checkout_complete(session):
    """Handle successful checkout session completion"""
    logger.info(f"Handling checkout complete: {session['id']}")
    
    # Extract metadata
    user_id = session['metadata'].get('user_id')
    tier_id = session['metadata'].get('tier_id')
    
    if not user_id or not tier_id:
        logger.error("Missing metadata in checkout session")
        return
    
    # The subscription will be created by the subscription.created event
    # This event confirms the checkout was successful
    logger.info(f"Checkout completed for user {user_id}, tier {tier_id}")


def handle_subscription_created(subscription_data):
    """Handle new subscription creation"""
    logger.info(f"Handling subscription created: {subscription_data['id']}")
    
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        customer_id = subscription_data['customer']
        tier_id = subscription_data['metadata'].get('tier_id')
        user_id = subscription_data['metadata'].get('user_id')
        
        user = User.objects.get(id=user_id)
        tier = SubscriptionTier.objects.get(id=tier_id)
        
        # Create or update subscription
        subscription, created = Subscription.objects.update_or_create(
            user=user,
            defaults={
                'tier': tier,
                'stripe_subscription_id': subscription_data['id'],
                'stripe_customer_id': customer_id,
                'status': subscription_data['status'],
                'currency': subscription_data['currency'].upper(),
                'amount': subscription_data['items']['data'][0]['price']['unit_amount'] / 100,
                'billing_cycle': 'monthly' if subscription_data['items']['data'][0]['price']['recurring']['interval'] == 'month' else 'annual',
                'current_period_start': timezone.datetime.fromtimestamp(subscription_data['current_period_start']),
                'current_period_end': timezone.datetime.fromtimestamp(subscription_data['current_period_end']),
                'trial_end': timezone.datetime.fromtimestamp(subscription_data['trial_end']) if subscription_data.get('trial_end') else None,
            }
        )
        
        logger.info(f"{'Created' if created else 'Updated'} subscription for user {user.email}")
    
    except Exception as e:
        logger.error(f"Error creating subscription: {str(e)}")


def handle_subscription_updated(subscription_data):
    """Handle subscription updates"""
    logger.info(f"Handling subscription updated: {subscription_data['id']}")
    
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_data['id'])
        
        subscription.status = subscription_data['status']
        subscription.current_period_start = timezone.datetime.fromtimestamp(subscription_data['current_period_start'])
        subscription.current_period_end = timezone.datetime.fromtimestamp(subscription_data['current_period_end'])
        subscription.cancel_at_period_end = subscription_data['cancel_at_period_end']
        subscription.save()
        
        logger.info(f"Updated subscription {subscription.id}")
    
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found: {subscription_data['id']}")


def handle_subscription_deleted(subscription_data):
    """Handle subscription deletion"""
    logger.info(f"Handling subscription deleted: {subscription_data['id']}")
    
    try:
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_data['id'])
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        subscription.save()
        
        logger.info(f"Marked subscription {subscription.id} as canceled")
    
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found: {subscription_data['id']}")


def handle_invoice_payment_succeeded(invoice_data):
    """Handle successful invoice payment"""
    logger.info(f"Handling invoice payment succeeded: {invoice_data['id']}")
    
    try:
        subscription_id = invoice_data.get('subscription')
        if not subscription_id:
            return
        
        subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
        
        # Create transaction record
        Transaction.objects.create(
            subscription=subscription,
            stripe_payment_intent_id=invoice_data['payment_intent'],
            stripe_invoice_id=invoice_data['id'],
            amount=invoice_data['amount_paid'] / 100,
            currency=invoice_data['currency'].upper(),
            status='succeeded',
            invoice_url=invoice_data.get('hosted_invoice_url', ''),
            receipt_url=invoice_data.get('receipt_number', ''),
        )
        
        logger.info(f"Created transaction for subscription {subscription.id}")
    
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found for invoice {invoice_data['id']}")


def handle_invoice_payment_failed(invoice_data):
    """Handle failed invoice payment"""
    logger.info(f"Handling invoice payment failed: {invoice_data['id']}")
    
    try:
        subscription_id = invoice_data.get('subscription')
        if subscription_id:
            subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
            subscription.status = 'past_due'
            subscription.save()
            
            logger.warning(f"Subscription {subscription.id} marked as past_due")
    
    except Subscription.DoesNotExist:
        logger.error(f"Subscription not found for invoice {invoice_data['id']}")


def handle_payment_intent_succeeded(payment_intent_data):
    """Handle successful payment intent (e.g., carbon credits)"""
    logger.info(f"Handling payment intent succeeded: {payment_intent_data['id']}")
    
    if payment_intent_data['metadata'].get('type') == 'carbon_credit':
        try:
            transaction = CarbonCreditTransaction.objects.get(
                stripe_payment_intent_id=payment_intent_data['id']
            )
            transaction.status = 'completed'
            transaction.receipt_url = payment_intent_data.get('receipt_url', '')
            transaction.save()
            
            logger.info(f"Carbon credit transaction {transaction.id} completed")
            
            # TODO: Trigger certificate generation task
            # generate_carbon_certificate.delay(transaction.id)
        
        except CarbonCreditTransaction.DoesNotExist:
            logger.error(f"Carbon credit transaction not found: {payment_intent_data['id']}")


def handle_payment_intent_failed(payment_intent_data):
    """Handle failed payment intent"""
    logger.info(f"Handling payment intent failed: {payment_intent_data['id']}")
    
    if payment_intent_data['metadata'].get('type') == 'carbon_credit':
        try:
            transaction = CarbonCreditTransaction.objects.get(
                stripe_payment_intent_id=payment_intent_data['id']
            )
            transaction.status = 'failed'
            transaction.save()
            
            logger.warning(f"Carbon credit transaction {transaction.id} failed")
        
        except CarbonCreditTransaction.DoesNotExist:
            logger.error(f"Carbon credit transaction not found: {payment_intent_data['id']}")
