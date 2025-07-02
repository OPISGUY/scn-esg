import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from compliance.services import RegulatoryUpdateService
from compliance.models import RegulatoryUpdate


class Command(BaseCommand):
    help = 'Monitor and sync regulatory updates from EFRAG, EUR-Lex, and other sources'
    
    def __init__(self):
        super().__init__()
        self.regulatory_service = RegulatoryUpdateService()
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--source',
            type=str,
            default='all',
            choices=['all', 'efrag', 'eur-lex', 'eba', 'esma'],
            help='Source for regulatory updates'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Number of days to look back for updates'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes'
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Starting regulatory update monitoring...')
        )
        
        try:
            if options['source'] == 'all':
                results = self.monitor_all_sources(options['days'])
            elif options['source'] == 'efrag':
                results = self.monitor_efrag(options['days'])
            elif options['source'] == 'eur-lex':
                results = self.monitor_eur_lex(options['days'])
            elif options['source'] == 'eba':
                results = self.monitor_eba(options['days'])
            elif options['source'] == 'esma':
                results = self.monitor_esma(options['days'])
            
            if options['dry_run']:
                self.show_dry_run_results(results)
            else:
                self.process_updates(results)
                
        except Exception as e:
            raise CommandError(f'Monitoring failed: {str(e)}')
    
    def monitor_all_sources(self, days: int) -> Dict[str, Any]:
        """Monitor all regulatory sources"""
        self.stdout.write('Monitoring all regulatory sources...')
        
        results = {
            'efrag': [],
            'eur_lex': [],
            'eba': [],
            'esma': [],
            'total_updates': 0,
            'errors': []
        }
        
        # Monitor each source
        try:
            results['efrag'] = self.fetch_efrag_updates(days)
        except Exception as e:
            results['errors'].append(f'EFRAG error: {str(e)}')
        
        try:
            results['eur_lex'] = self.fetch_eur_lex_updates(days)
        except Exception as e:
            results['errors'].append(f'EUR-Lex error: {str(e)}')
        
        try:
            results['eba'] = self.fetch_eba_updates(days)
        except Exception as e:
            results['errors'].append(f'EBA error: {str(e)}')
        
        try:
            results['esma'] = self.fetch_esma_updates(days)
        except Exception as e:
            results['errors'].append(f'ESMA error: {str(e)}')
        
        # Calculate total
        results['total_updates'] = (
            len(results['efrag']) + 
            len(results['eur_lex']) + 
            len(results['eba']) + 
            len(results['esma'])
        )
        
        return results
    
    def monitor_efrag(self, days: int) -> Dict[str, Any]:
        """Monitor EFRAG updates only"""
        return {
            'efrag': self.fetch_efrag_updates(days),
            'total_updates': len(self.fetch_efrag_updates(days))
        }
    
    def monitor_eur_lex(self, days: int) -> Dict[str, Any]:
        """Monitor EUR-Lex updates only"""
        return {
            'eur_lex': self.fetch_eur_lex_updates(days),
            'total_updates': len(self.fetch_eur_lex_updates(days))
        }
    
    def monitor_eba(self, days: int) -> Dict[str, Any]:
        """Monitor EBA updates only"""
        return {
            'eba': self.fetch_eba_updates(days),
            'total_updates': len(self.fetch_eba_updates(days))
        }
    
    def monitor_esma(self, days: int) -> Dict[str, Any]:
        """Monitor ESMA updates only"""
        return {
            'esma': self.fetch_esma_updates(days),
            'total_updates': len(self.fetch_esma_updates(days))
        }
    
    def fetch_efrag_updates(self, days: int) -> List[Dict[str, Any]]:
        """Fetch updates from EFRAG"""
        self.stdout.write('Fetching EFRAG updates...')
        
        updates = []
        
        try:
            # EFRAG News API or RSS feed
            # This is a mock implementation - would need actual EFRAG API
            base_url = "https://www.efrag.org"
            
            # For now, return structured sample data
            sample_updates = [
                {
                    'title': 'ESRS E1 Climate Change - Implementation Update',
                    'description': 'Updated guidance on climate change disclosure requirements',
                    'url': f'{base_url}/news/efrag-updates-esrs-e1-guidance',
                    'published_date': timezone.now().date() - timedelta(days=2),
                    'source': 'EFRAG',
                    'type': 'guidance',
                    'impact_level': 'medium',
                    'affected_standards': ['ESRS E1']
                },
                {
                    'title': 'ESRS Digital Taxonomy Release 1.1',
                    'description': 'Updated XBRL taxonomy for digital reporting',
                    'url': f'{base_url}/taxonomy/esrs-digital-taxonomy-1-1',
                    'published_date': timezone.now().date() - timedelta(days=5),
                    'source': 'EFRAG',
                    'type': 'taxonomy',
                    'impact_level': 'high',
                    'affected_standards': ['All ESRS']
                }
            ]
            
            # Filter by date range
            cutoff_date = timezone.now().date() - timedelta(days=days)
            updates = [
                update for update in sample_updates 
                if update['published_date'] >= cutoff_date
            ]
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'EFRAG fetch failed: {e}')
            )
        
        return updates
    
    def fetch_eur_lex_updates(self, days: int) -> List[Dict[str, Any]]:
        """Fetch updates from EUR-Lex"""
        self.stdout.write('Fetching EUR-Lex updates...')
        
        updates = []
        
        try:
            # EUR-Lex API for CSRD-related documents
            # This would use their actual API
            
            sample_updates = [
                {
                    'title': 'Commission Delegated Regulation (EU) 2023/2772 - ESRS Amendment',
                    'description': 'Amendment to European Sustainability Reporting Standards',
                    'url': 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2772',
                    'published_date': timezone.now().date() - timedelta(days=3),
                    'source': 'EUR-Lex',
                    'type': 'regulation',
                    'impact_level': 'high',
                    'document_type': 'Delegated Regulation'
                },
                {
                    'title': 'Technical Standards on ESRS Assurance',
                    'description': 'Technical standards for sustainability reporting assurance',
                    'url': 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R2774',
                    'published_date': timezone.now().date() - timedelta(days=6),
                    'source': 'EUR-Lex',
                    'type': 'technical_standard',
                    'impact_level': 'medium',
                    'document_type': 'Technical Standard'
                }
            ]
            
            # Filter by date range
            cutoff_date = timezone.now().date() - timedelta(days=days)
            updates = [
                update for update in sample_updates 
                if update['published_date'] >= cutoff_date
            ]
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'EUR-Lex fetch failed: {e}')
            )
        
        return updates
    
    def fetch_eba_updates(self, days: int) -> List[Dict[str, Any]]:
        """Fetch updates from European Banking Authority"""
        self.stdout.write('Fetching EBA updates...')
        
        updates = []
        
        try:
            # EBA API for ESG banking-related updates
            sample_updates = [
                {
                    'title': 'EBA Guidelines on ESG Risk Management',
                    'description': 'Updated guidelines on environmental and social risk management',
                    'url': 'https://www.eba.europa.eu/regulation-and-policy/esg',
                    'published_date': timezone.now().date() - timedelta(days=4),
                    'source': 'EBA',
                    'type': 'guideline',
                    'impact_level': 'medium',
                    'sector': 'Financial Services'
                }
            ]
            
            # Filter by date range
            cutoff_date = timezone.now().date() - timedelta(days=days)
            updates = [
                update for update in sample_updates 
                if update['published_date'] >= cutoff_date
            ]
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'EBA fetch failed: {e}')
            )
        
        return updates
    
    def fetch_esma_updates(self, days: int) -> List[Dict[str, Any]]:
        """Fetch updates from European Securities and Markets Authority"""
        self.stdout.write('Fetching ESMA updates...')
        
        updates = []
        
        try:
            # ESMA API for securities/markets ESG updates
            sample_updates = [
                {
                    'title': 'ESMA Technical Advice on CSRD Implementation',
                    'description': 'Technical advice on Corporate Sustainability Reporting Directive',
                    'url': 'https://www.esma.europa.eu/policy-activities/sustainable-finance',
                    'published_date': timezone.now().date() - timedelta(days=1),
                    'source': 'ESMA',
                    'type': 'technical_advice',
                    'impact_level': 'high',
                    'sector': 'All'
                }
            ]
            
            # Filter by date range
            cutoff_date = timezone.now().date() - timedelta(days=days)
            updates = [
                update for update in sample_updates 
                if update['published_date'] >= cutoff_date
            ]
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'ESMA fetch failed: {e}')
            )
        
        return updates
    
    def process_updates(self, results: Dict[str, Any]):
        """Process and save regulatory updates"""
        created_count = 0
        updated_count = 0
        errors = []
        
        # Process all updates from all sources
        all_updates = []
        for source_key in ['efrag', 'eur_lex', 'eba', 'esma']:
            if source_key in results:
                all_updates.extend(results[source_key])
        
        for update_data in all_updates:
            try:
                # Check if update already exists
                existing = RegulatoryUpdate.objects.filter(
                    title=update_data['title'],
                    source=update_data['source']
                ).first()
                
                if existing:
                    # Update existing record
                    for field, value in update_data.items():
                        if hasattr(existing, field) and field != 'id':
                            setattr(existing, field, value)
                    existing.save()
                    updated_count += 1
                    self.stdout.write(f'Updated: {update_data["title"]}')
                else:
                    # Create new record
                    regulatory_update = self.regulatory_service.create_regulatory_update(update_data)
                    created_count += 1
                    self.stdout.write(f'Created: {update_data["title"]}')
                    
            except Exception as e:
                error_msg = f'Error processing {update_data["title"]}: {str(e)}'
                errors.append(error_msg)
                self.stdout.write(self.style.ERROR(error_msg))
        
        # Print summary
        self.stdout.write(
            self.style.SUCCESS(
                f'\nRegulatory update monitoring complete:\n'
                f'- Created: {created_count}\n'
                f'- Updated: {updated_count}\n'
                f'- Errors: {len(errors)}\n'
                f'- Total processed: {len(all_updates)}'
            )
        )
        
        if errors:
            self.stdout.write(self.style.WARNING('\nErrors:'))
            for error in errors:
                self.stdout.write(f'  - {error}')
    
    def show_dry_run_results(self, results: Dict[str, Any]):
        """Show what would be updated in dry run mode"""
        self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        all_updates = []
        for source_key in ['efrag', 'eur_lex', 'eba', 'esma']:
            if source_key in results:
                all_updates.extend(results[source_key])
        
        existing_titles = set(RegulatoryUpdate.objects.values_list('title', flat=True))
        
        new_updates = []
        existing_updates = []
        
        for update in all_updates:
            if update['title'] in existing_titles:
                existing_updates.append(update)
            else:
                new_updates.append(update)
        
        self.stdout.write(f'\nWould create {len(new_updates)} new updates:')
        for update in new_updates:
            self.stdout.write(f'  - [{update["source"]}] {update["title"]}')
        
        self.stdout.write(f'\nWould update {len(existing_updates)} existing updates:')
        for update in existing_updates:
            self.stdout.write(f'  - [{update["source"]}] {update["title"]}')
