import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ImportSource(models.Model):
    """Available data import sources"""
    
    SOURCE_TYPES = [
        ('file', 'File Upload (CSV/Excel/JSON)'),
        ('api', 'API Integration'),
        ('iot', 'IoT/Energy Systems'),
        ('erp', 'ERP System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict, blank=True)  # Store API keys, endpoints, etc.
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_source_type_display()})"


class ImportJob(models.Model):
    """Track data import operations"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('validating', 'Validating'),
        ('mapping', 'Mapping Fields'),
        ('importing', 'Importing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    DATA_TYPES = [
        ('carbon', 'Carbon Emissions'),
        ('ewaste', 'E-Waste'),
        ('energy', 'Energy Consumption'),
        ('water', 'Water Usage'),
        ('waste', 'General Waste'),
        ('mixed', 'Mixed Data'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='import_jobs')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, null=True, blank=True)
    source = models.ForeignKey(ImportSource, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Job details
    name = models.CharField(max_length=200)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES, default='mixed')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # File information (for file uploads)
    file = models.FileField(upload_to='imports/%Y/%m/', null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(null=True, blank=True)  # in bytes
    file_type = models.CharField(max_length=50, blank=True)  # csv, xlsx, json
    
    # Progress tracking
    total_rows = models.IntegerField(default=0)
    processed_rows = models.IntegerField(default=0)
    successful_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    
    # Field mapping
    field_mapping = models.JSONField(default=dict, blank=True)
    # Example: {"column_name": "model_field", "emission_date": "date", "co2_kg": "amount"}
    
    # Validation and errors
    validation_errors = models.JSONField(default=list, blank=True)
    import_errors = models.JSONField(default=list, blank=True)
    
    # Metadata
    import_settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.status}"
    
    @property
    def progress_percentage(self):
        """Calculate import progress"""
        if self.total_rows == 0:
            return 0
        return int((self.processed_rows / self.total_rows) * 100)
    
    @property
    def success_rate(self):
        """Calculate success rate"""
        if self.processed_rows == 0:
            return 0
        return int((self.successful_rows / self.processed_rows) * 100)


class ImportFieldMapping(models.Model):
    """Store reusable field mappings for different file formats"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='field_mappings')
    name = models.CharField(max_length=200)
    data_type = models.CharField(max_length=20, choices=ImportJob.DATA_TYPES)
    
    # The actual mapping
    mapping = models.JSONField(default=dict)
    # Example: {
    #   "date_column": {"target_field": "date", "transform": "date"},
    #   "amount_column": {"target_field": "amount", "transform": "float"}
    # }
    
    # Metadata
    is_default = models.BooleanField(default=False)
    use_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-use_count', 'name']
        unique_together = ['user', 'name', 'data_type']
    
    def __str__(self):
        return f"{self.name} - {self.data_type}"


class ImportedRecord(models.Model):
    """Track individual imported records for audit trail"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(ImportJob, on_delete=models.CASCADE, related_name='records')
    
    # Source data
    row_number = models.IntegerField()
    source_data = models.JSONField()  # Original row data
    
    # Import result
    is_successful = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    
    # Link to created record
    content_type = models.ForeignKey(
        'contenttypes.ContentType',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.UUIDField(null=True, blank=True)
    
    # Metadata
    imported_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['row_number']
    
    def __str__(self):
        return f"Row {self.row_number} - {'Success' if self.is_successful else 'Failed'}"
