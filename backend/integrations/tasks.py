"""
Celery tasks for integration data synchronization
"""
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def sync_integration_data(connection_id, sync_log_id=None, sync_type='scheduled', **kwargs):
    """
    Sync data from an external platform
    
    Args:
        connection_id: UUID of the IntegrationConnection
        sync_log_id: Optional UUID of existing sync log
        sync_type: Type of sync (scheduled, manual, webhook)
        **kwargs: Additional sync parameters (start_date, end_date, etc.)
    """
    from .models import IntegrationConnection, IntegrationSyncLog
    from .services import get_integration_client
    
    try:
        connection = IntegrationConnection.objects.get(id=connection_id)
    except IntegrationConnection.DoesNotExist:
        logger.error(f"Connection {connection_id} not found")
        return
    
    # Create or get sync log
    if sync_log_id:
        sync_log = IntegrationSyncLog.objects.get(id=sync_log_id)
    else:
        sync_log = IntegrationSyncLog.objects.create(
            connection=connection,
            sync_type=sync_type,
            status='started'
        )
    
    start_time = timezone.now()
    
    try:
        # Update status
        sync_log.status = 'in_progress'
        sync_log.save()
        
        # Get integration client
        client = get_integration_client(connection)
        
        # Determine date range
        start_date = kwargs.get('start_date') or connection.last_sync_at or (timezone.now() - timedelta(days=30))
        end_date = kwargs.get('end_date') or timezone.now()
        
        # Platform-specific sync logic
        provider_name = connection.provider.name.lower()
        
        if provider_name == 'xero':
            transactions = client.fetch_bank_transactions(start_date=start_date)
            carbon_data = client.map_to_carbon_data(transactions)
            sync_log.records_fetched = len(transactions)
            
            # Import carbon data
            from carbon.models import CarbonFootprint
            created = 0
            updated = 0
            
            for entry in carbon_data:
                _, created_flag = CarbonFootprint.objects.update_or_create(
                    company=connection.company,
                    external_id=entry.get('external_id'),
                    defaults={
                        'reporting_period': entry.get('date'),
                        # Map other fields...
                    }
                )
                if created_flag:
                    created += 1
                else:
                    updated += 1
            
            sync_log.records_created = created
            sync_log.records_updated = updated
            sync_log.records_processed = created + updated
        
        elif provider_name == 'quickbooks':
            expenses = client.fetch_expenses(start_date=start_date)
            carbon_data = client.map_to_carbon_data(expenses)
            sync_log.records_fetched = len(expenses)
            # Similar processing...
        
        elif provider_name in ['aws', 'azure', 'google_cloud']:
            # Fetch cloud usage data
            if provider_name == 'aws':
                usage_data = client.fetch_ec2_usage(start_date, end_date)
                carbon_data = client.map_to_carbon_data(usage_data)
            # Process cloud emissions...
        
        # Mark as completed
        sync_log.status = 'completed'
        sync_log.completed_at = timezone.now()
        sync_log.duration_seconds = (sync_log.completed_at - start_time).total_seconds()
        
        # Update connection
        connection.last_sync_at = timezone.now()
        connection.next_sync_at = timezone.now() + timedelta(minutes=connection.sync_frequency_minutes)
        connection.status = 'active'
        connection.error_message = ''
        connection.save()
        
    except Exception as e:
        logger.error(f"Sync failed for connection {connection_id}: {str(e)}", exc_info=True)
        
        sync_log.status = 'failed'
        sync_log.error_message = str(e)
        sync_log.completed_at = timezone.now()
        sync_log.duration_seconds = (timezone.now() - start_time).total_seconds()
        
        connection.status = 'error'
        connection.error_message = str(e)
        connection.save()
    
    finally:
        sync_log.save()
        connection.save()
    
    return {
        'sync_log_id': str(sync_log.id),
        'status': sync_log.status,
        'records_processed': sync_log.records_processed
    }


@shared_task
def schedule_auto_syncs():
    """
    Scheduled task to trigger syncs for all active connections
    Run this every 15 minutes via Celery beat
    """
    from .models import IntegrationConnection
    
    now = timezone.now()
    
    # Find connections that need syncing
    connections = IntegrationConnection.objects.filter(
        status='active',
        auto_sync_enabled=True,
        next_sync_at__lte=now
    )
    
    logger.info(f"Found {connections.count()} connections ready for sync")
    
    for connection in connections:
        try:
            sync_integration_data.delay(
                connection_id=str(connection.id),
                sync_type='scheduled'
            )
        except Exception as e:
            logger.error(f"Failed to schedule sync for {connection.id}: {str(e)}")
    
    return f"Scheduled {connections.count()} syncs"


@shared_task
def refresh_expiring_tokens():
    """
    Refresh OAuth tokens that are about to expire
    Run this hourly via Celery beat
    """
    from .models import IntegrationConnection
    from .oauth_utils import OAuthHandler, CredentialEncryption
    
    # Find connections with tokens expiring in the next 24 hours
    expiry_threshold = timezone.now() + timedelta(hours=24)
    
    connections = IntegrationConnection.objects.filter(
        status='active',
        provider__auth_method='oauth2',
        access_token_expires_at__lte=expiry_threshold
    )
    
    logger.info(f"Found {connections.count()} tokens to refresh")
    
    refreshed = 0
    failed = 0
    
    for connection in connections:
        try:
            # Decrypt credentials
            credentials = CredentialEncryption.decrypt_credentials(
                connection.encrypted_credentials
            )
            
            # Refresh token
            oauth_handler = OAuthHandler(connection.provider)
            new_tokens = oauth_handler.refresh_access_token(
                credentials.get('refresh_token')
            )
            
            # Update credentials
            credentials.update(new_tokens)
            connection.encrypted_credentials = CredentialEncryption.encrypt_credentials(
                credentials
            )
            connection.access_token_expires_at = new_tokens['access_token_expires_at']
            connection.save()
            
            refreshed += 1
            logger.info(f"Refreshed token for connection {connection.id}")
        
        except Exception as e:
            failed += 1
            logger.error(f"Failed to refresh token for {connection.id}: {str(e)}")
            
            connection.status = 'expired'
            connection.error_message = f"Token refresh failed: {str(e)}"
            connection.save()
    
    return f"Refreshed {refreshed} tokens, {failed} failed"
