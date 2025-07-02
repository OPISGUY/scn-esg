"""
Management command to trigger notification checks manually
"""
from django.core.management.base import BaseCommand
from notifications.tasks import (
    check_carbon_milestones, 
    send_weekly_summaries, 
    send_monthly_reports,
    check_data_quality
)


class Command(BaseCommand):
    help = 'Trigger notification checks manually'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            type=str,
            help='Type of notification check to run (milestones, weekly, monthly, quality)',
            choices=['milestones', 'weekly', 'monthly', 'quality', 'all'],
            default='all'
        )
    
    def handle(self, *args, **options):
        notification_type = options['type']
        
        if notification_type in ['milestones', 'all']:
            self.stdout.write('Checking carbon milestones...')
            result = check_carbon_milestones()
            self.stdout.write(self.style.SUCCESS(f'Milestones: {result}'))
        
        if notification_type in ['weekly', 'all']:
            self.stdout.write('Sending weekly summaries...')
            result = send_weekly_summaries()
            self.stdout.write(self.style.SUCCESS(f'Weekly: {result}'))
        
        if notification_type in ['monthly', 'all']:
            self.stdout.write('Sending monthly reports...')
            result = send_monthly_reports()
            self.stdout.write(self.style.SUCCESS(f'Monthly: {result}'))
        
        if notification_type in ['quality', 'all']:
            self.stdout.write('Checking data quality...')
            result = check_data_quality()
            self.stdout.write(self.style.SUCCESS(f'Quality: {result}'))
        
        self.stdout.write(
            self.style.SUCCESS('Successfully completed notification checks!')
        )
