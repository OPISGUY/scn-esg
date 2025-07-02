"""
Celery configuration for SCN ESG Platform
"""
import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')

app = Celery('scn_esg_platform')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure periodic tasks
from celery.schedules import crontab

app.conf.beat_schedule = {
    # Check for milestones every hour
    'check-carbon-milestones': {
        'task': 'notifications.tasks.check_carbon_milestones',
        'schedule': crontab(minute=0),  # Every hour
    },
    # Send weekly summaries every Monday at 9 AM
    'send-weekly-summaries': {
        'task': 'notifications.tasks.send_weekly_summaries',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },
    # Send monthly reports on the 1st of each month at 9 AM
    'send-monthly-reports': {
        'task': 'notifications.tasks.send_monthly_reports',
        'schedule': crontab(hour=9, minute=0, day_of_month=1),
    },
    # Clean up old notifications daily at 2 AM
    'cleanup-old-notifications': {
        'task': 'notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=2, minute=0),
    },
    # Check data quality daily at 8 AM
    'check-data-quality': {
        'task': 'notifications.tasks.check_data_quality',
        'schedule': crontab(hour=8, minute=0),
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
