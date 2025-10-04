import uuid
from django.db import models
from django.utils import timezone
from django.conf import settings
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


class ConversationSession(models.Model):
    """Smart Data Entry conversation session tracking"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('draft', 'Draft'),
        ('pending_review', 'Pending Review'),
        ('approved', 'Approved'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='conversation_sessions'
    )
    footprint = models.ForeignKey(
        CarbonFootprint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversation_sessions'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_conversations'
    )
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversation_participations',
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Metadata
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    
    # Session state
    session_context = models.JSONField(default=dict, blank=True)  # Store company context, current state
    total_emissions_added = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    data_entries_count = models.IntegerField(default=0)
    average_confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['company', 'status']),
            models.Index(fields=['created_by', 'status']),
        ]
    
    def __str__(self):
        return f"Conversation {self.id} - {self.company.name} ({self.status})"
    
    def get_message_count(self):
        return self.messages.count()
    
    def get_summary(self):
        """Get conversation summary statistics"""
        return {
            'total_messages': self.get_message_count(),
            'data_entries': self.data_entries_count,
            'emissions_added': float(self.total_emissions_added),
            'confidence_avg': float(self.average_confidence),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }


class ConversationMessage(models.Model):
    """Individual message in a smart data entry conversation"""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'AI Assistant'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        ConversationSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversation_messages',
        null=True,
        blank=True  # AI messages won't have an author
    )
    
    # Message content
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    
    # Extracted data from AI
    extracted_data = models.JSONField(null=True, blank=True)
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="AI confidence score (0-100)"
    )
    
    # Validation and approval
    validation_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('validated', 'Validated'),
            ('rejected', 'Rejected'),
            ('needs_review', 'Needs Review'),
        ],
        default='pending'
    )
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_messages'
    )
    
    # Footprint impact
    footprint_updated = models.BooleanField(default=False)
    footprint_changes = models.JSONField(null=True, blank=True)
    
    # Mentions and notifications
    mentioned_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='mentioned_in_messages',
        blank=True
    )
    
    # Metadata
    processed_at = models.DateTimeField(null=True, blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
            models.Index(fields=['role', 'validation_status']),
        ]
    
    def __str__(self):
        return f"{self.role} message in {self.session.id}"
    
    def get_extracted_summary(self):
        """Get summary of extracted data"""
        if not self.extracted_data:
            return None
        
        return {
            'activity_type': self.extracted_data.get('activity_type'),
            'scope': self.extracted_data.get('scope'),
            'emissions': self.extracted_data.get('calculated_emissions'),
            'confidence': float(self.confidence_score) if self.confidence_score else None,
        }


class UploadedDocument(models.Model):
    """Store uploaded documents (utility bills, receipts, invoices) for AI extraction"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('utility_bill', 'Utility Bill'),
        ('fuel_receipt', 'Fuel Receipt'),
        ('travel_receipt', 'Travel Receipt'),
        ('invoice', 'Invoice'),
        ('meter_photo', 'Meter Photo'),
        ('other', 'Other'),
    ]
    
    EXTRACTION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='uploaded_documents'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )
    conversation_session = models.ForeignKey(
        ConversationSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents'
    )
    
    # File storage
    file = models.FileField(upload_to='emissions_documents/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # bytes
    mime_type = models.CharField(max_length=100)
    
    # Document classification
    document_type = models.CharField(
        max_length=50,
        choices=DOCUMENT_TYPE_CHOICES,
        default='other'
    )
    
    # Extraction results
    extraction_status = models.CharField(
        max_length=20,
        choices=EXTRACTION_STATUS_CHOICES,
        default='pending'
    )
    extracted_data = models.JSONField(null=True, blank=True)
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # AI processing metadata
    processing_time_ms = models.IntegerField(null=True, blank=True)
    gemini_model_used = models.CharField(
        max_length=100,
        default='gemini-2.5-flash-lite'
    )
    extraction_error = models.TextField(null=True, blank=True)
    
    # User validation
    user_validated = models.BooleanField(default=False)
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_documents'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    user_corrections = models.JSONField(null=True, blank=True)
    
    # Footprint linkage
    applied_to_footprint = models.BooleanField(default=False)
    footprint = models.ForeignKey(
        CarbonFootprint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_documents'
    )
    conversation_message = models.ForeignKey(
        ConversationMessage,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attached_documents'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Auto-delete files after 90 days for privacy
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'document_type']),
            models.Index(fields=['extraction_status']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['created_at']),
        ]
    
    def save(self, *args, **kwargs):
        # Set expiration date if not set (90 days from creation)
        if not self.expires_at:
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=90)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.document_type} - {self.file_name} ({self.company.name})"
    
    def get_file_size_display(self):
        """Return human-readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class DocumentExtractionField(models.Model):
    """Individual fields extracted from uploaded documents"""
    
    FIELD_TYPE_CHOICES = [
        ('date', 'Date'),
        ('number', 'Number'),
        ('text', 'Text'),
        ('currency', 'Currency'),
        ('quantity', 'Quantity'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        UploadedDocument,
        on_delete=models.CASCADE,
        related_name='extracted_fields'
    )
    
    # Field information
    field_name = models.CharField(max_length=100)  # e.g., 'billing_period_start', 'kwh_consumed'
    field_value = models.TextField()
    field_type = models.CharField(max_length=50, choices=FIELD_TYPE_CHOICES)
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Location in document (for visual highlighting)
    bounding_box = models.JSONField(null=True, blank=True)  # {x, y, width, height}
    page_number = models.IntegerField(null=True, blank=True)
    
    # User corrections
    user_corrected = models.BooleanField(default=False)
    original_value = models.TextField(null=True, blank=True)
    corrected_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['document', 'field_name']
        indexes = [
            models.Index(fields=['document', 'field_name']),
            models.Index(fields=['confidence']),
        ]
    
    def __str__(self):
        return f"{self.field_name}: {self.field_value[:50]} (confidence: {self.confidence})"
    
    def apply_correction(self, new_value, corrected_by=None):
        """Apply user correction to extracted field"""
        if not self.user_corrected:
            self.original_value = self.field_value
        self.field_value = new_value
        self.user_corrected = True
        self.corrected_at = timezone.now()
        self.save()
