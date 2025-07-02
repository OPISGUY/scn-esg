import uuid
from django.db import models
from django.utils import timezone
from decimal import Decimal


class EwasteEntry(models.Model):
    """E-waste donation tracking model"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('completed', 'Completed'),
    ]
    
    DEVICE_TYPES = [
        ('laptop', 'Laptop'),
        ('desktop', 'Desktop Computer'),
        ('monitor', 'Monitor'),
        ('tablet', 'Tablet'),
        ('smartphone', 'Smartphone'),
        ('printer', 'Printer'),
        ('server', 'Server'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='ewaste_entries'
    )
    device_type = models.CharField(max_length=100, choices=DEVICE_TYPES)
    quantity = models.PositiveIntegerField()
    weight_kg = models.DecimalField(max_digits=8, decimal_places=2)
    donation_date = models.DateField()
    estimated_co2_saved = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    carbon_credits_generated = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-donation_date']
        verbose_name_plural = 'E-waste entries'
    
    def save(self, *args, **kwargs):
        # Calculate CO2 saved and carbon credits based on device type and weight
        co2_factors = {
            'laptop': 0.3,     # 0.3 kg CO2 saved per kg of laptop
            'desktop': 0.25,   # 0.25 kg CO2 saved per kg of desktop
            'monitor': 0.2,    # 0.2 kg CO2 saved per kg of monitor
            'tablet': 0.4,     # 0.4 kg CO2 saved per kg of tablet
            'smartphone': 0.5, # 0.5 kg CO2 saved per kg of smartphone  
            'printer': 0.15,   # 0.15 kg CO2 saved per kg of printer
            'server': 0.2,     # 0.2 kg CO2 saved per kg of server
            'other': 0.2,      # 0.2 kg CO2 saved per kg of other devices
        }
        
        factor = co2_factors.get(self.device_type, 0.2)
        self.estimated_co2_saved = self.weight_kg * Decimal(str(factor))
        # Carbon credits are typically 80% of CO2 saved
        self.carbon_credits_generated = self.estimated_co2_saved * Decimal('0.8')
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.company.name} - {self.quantity} {self.device_type}(s)"
