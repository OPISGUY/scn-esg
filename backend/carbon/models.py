import uuid
from django.db import models
from django.utils import timezone
from decimal import Decimal


class CarbonFootprint(models.Model):
    """Carbon footprint tracking model"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='carbon_footprints'
    )
    reporting_period = models.CharField(max_length=20)  # e.g., "2024-Q1"
    
    # Scope emissions
    scope1_emissions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    scope2_emissions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    scope3_emissions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_emissions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(default=timezone.now)
    verified_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['company', 'reporting_period']
    
    def save(self, *args, **kwargs):
        # Auto-calculate total emissions
        self.total_emissions = self.scope1_emissions + self.scope2_emissions + self.scope3_emissions
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.company.name} - {self.reporting_period}"


class CarbonOffset(models.Model):
    """Carbon offset marketplace model"""
    
    CATEGORY_CHOICES = [
        ('forestry', 'Forestry & Land Use'),
        ('renewable', 'Renewable Energy'),
        ('methane', 'Methane Reduction'),
        ('technology', 'Technology Solutions'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    price_per_tonne = models.DecimalField(max_digits=8, decimal_places=2)
    co2_offset_per_unit = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, null=True)
    available_quantity = models.PositiveIntegerField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    verification_standard = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['price_per_tonne']
    
    def __str__(self):
        return self.name


class OffsetPurchase(models.Model):
    """Carbon offset purchase tracking"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='offset_purchases'
    )
    offset = models.ForeignKey(CarbonOffset, on_delete=models.RESTRICT)
    quantity = models.PositiveIntegerField()
    total_co2_offset = models.DecimalField(max_digits=8, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    
    class Meta:
        ordering = ['-purchase_date']
    
    def save(self, *args, **kwargs):
        # Auto-calculate totals
        self.total_co2_offset = self.quantity * self.offset.co2_offset_per_unit
        self.total_price = self.quantity * self.offset.price_per_tonne
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.company.name} - {self.offset.name} ({self.quantity} units)"
