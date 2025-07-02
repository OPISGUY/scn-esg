from django.db import models
from django.contrib.auth import get_user_model
from companies.models import Company
import uuid

User = get_user_model()


class CSRDAssessment(models.Model):
    """CSRD Compliance Assessment Model"""
    
    COMPLIANCE_STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('compliant', 'Compliant'),
        ('non_compliant', 'Non-Compliant'),
    ]
    
    COMPANY_SIZE_CHOICES = [
        ('large', 'Large (500+ employees, €40M+ revenue)'),
        ('medium', 'Medium (250-499 employees, €20-40M revenue)'),
        ('small', 'Small (<250 employees, <€20M revenue)'),
        ('micro', 'Micro (<10 employees, <€2M revenue)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='csrd_assessments')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Basic company information
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZE_CHOICES)
    has_eu_operations = models.BooleanField(default=False)
    is_listed_company = models.BooleanField(default=False)
    annual_revenue_eur = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    employee_count = models.IntegerField(null=True, blank=True)
    
    # CSRD applicability
    csrd_applicable = models.BooleanField(default=False)
    first_reporting_year = models.IntegerField(null=True, blank=True)
    
    # Assessment status
    status = models.CharField(max_length=20, choices=COMPLIANCE_STATUS_CHOICES, default='not_started')
    overall_readiness_score = models.IntegerField(null=True, blank=True)  # 0-100
    
    # AI-generated insights
    gap_analysis = models.JSONField(default=dict, blank=True)
    priority_actions = models.JSONField(default=list, blank=True)
    compliance_timeline = models.JSONField(default=dict, blank=True)
    ai_recommendations = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'CSRD Assessment'
        verbose_name_plural = 'CSRD Assessments'
    
    def __str__(self):
        return f"CSRD Assessment - {self.company.name} ({self.status})"


class ESRSDataPoint(models.Model):
    """European Sustainability Reporting Standards Data Points"""
    
    ESRS_CATEGORIES = [
        ('E1', 'Climate Change'),
        ('E2', 'Pollution'),
        ('E3', 'Water and Marine Resources'),
        ('E4', 'Biodiversity and Ecosystems'),
        ('E5', 'Circular Economy'),
        ('S1', 'Own Workforce'),
        ('S2', 'Value Chain Workers'),
        ('S3', 'Affected Communities'),
        ('S4', 'Consumers and End-Users'),
        ('G1', 'Business Conduct'),
    ]
    
    MATERIALITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
        ('not_material', 'Not Material'),
        ('pending', 'Pending Assessment'),
    ]
    
    DATA_AVAILABILITY_CHOICES = [
        ('available', 'Data Available'),
        ('partial', 'Partial Data Available'),
        ('missing', 'Data Missing'),
        ('not_applicable', 'Not Applicable'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(CSRDAssessment, on_delete=models.CASCADE, related_name='esrs_datapoints')
    
    # ESRS classification
    esrs_category = models.CharField(max_length=5, choices=ESRS_CATEGORIES)
    datapoint_code = models.CharField(max_length=20)  # e.g., E1-1, E1-2, etc.
    datapoint_name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Materiality assessment
    materiality_level = models.CharField(max_length=20, choices=MATERIALITY_CHOICES, default='pending')
    materiality_justification = models.TextField(blank=True)
    
    # Data availability
    data_availability = models.CharField(max_length=20, choices=DATA_AVAILABILITY_CHOICES, default='missing')
    data_source = models.CharField(max_length=200, blank=True)
    data_quality_score = models.IntegerField(null=True, blank=True)  # 0-100
    
    # Timeline
    target_completion_date = models.DateField(null=True, blank=True)
    responsible_person = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['esrs_category', 'datapoint_code']
        unique_together = ['assessment', 'datapoint_code']
    
    def __str__(self):
        return f"{self.esrs_category}-{self.datapoint_code}: {self.datapoint_name}"


class ComplianceAction(models.Model):
    """Compliance Action Items"""
    
    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('blocked', 'Blocked'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(CSRDAssessment, on_delete=models.CASCADE, related_name='compliance_actions')
    related_datapoint = models.ForeignKey(ESRSDataPoint, on_delete=models.CASCADE, null=True, blank=True)
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timeline
    due_date = models.DateField(null=True, blank=True)
    estimated_hours = models.IntegerField(null=True, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_department = models.CharField(max_length=100, blank=True)
    
    # Progress tracking
    progress_percentage = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['priority', 'due_date']
    
    def __str__(self):
        return f"{self.title} ({self.priority} priority)"


class RegulatoryUpdate(models.Model):
    """Regulatory Updates and Changes"""
    
    UPDATE_TYPES = [
        ('csrd', 'CSRD'),
        ('esrs', 'ESRS'),
        ('taxonomy', 'EU Taxonomy'),
        ('other', 'Other'),
    ]
    
    IMPACT_LEVELS = [
        ('high', 'High Impact'),
        ('medium', 'Medium Impact'),
        ('low', 'Low Impact'),
        ('informational', 'Informational'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    title = models.CharField(max_length=300)
    description = models.TextField()
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPES, default='other')
    impact_level = models.CharField(max_length=20, choices=IMPACT_LEVELS, default='informational')
    
    # Source information
    source_url = models.URLField(blank=True)
    publication_date = models.DateField()
    effective_date = models.DateField(null=True, blank=True)
    
    # AI analysis
    ai_impact_analysis = models.TextField(blank=True)
    affected_datapoints = models.JSONField(default=list, blank=True)
    recommended_actions = models.JSONField(default=list, blank=True)
    
    # Notification tracking
    companies_notified = models.ManyToManyField(Company, blank=True, related_name='regulatory_updates')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-publication_date']
    
    def __str__(self):
        return f"{self.title} ({self.publication_date})"


class ESRSDatapointCatalog(models.Model):
    """Master catalog of ESRS datapoints from official taxonomy"""
    
    ESRS_STANDARDS = [
        ('ESRS E1', 'ESRS E1 - Climate Change'),
        ('ESRS E2', 'ESRS E2 - Pollution'),
        ('ESRS E3', 'ESRS E3 - Water and Marine Resources'),
        ('ESRS E4', 'ESRS E4 - Biodiversity and Ecosystems'),
        ('ESRS E5', 'ESRS E5 - Circular Economy'),
        ('ESRS S1', 'ESRS S1 - Own Workforce'),
        ('ESRS S2', 'ESRS S2 - Value Chain Workers'),
        ('ESRS S3', 'ESRS S3 - Affected Communities'),
        ('ESRS S4', 'ESRS S4 - Consumers and End-Users'),
        ('ESRS G1', 'ESRS G1 - Business Conduct'),
    ]
    
    DATAPOINT_CATEGORIES = [
        ('Environment', 'Environmental'),
        ('Social', 'Social'),
        ('Governance', 'Governance'),
    ]
    
    DATA_TYPES = [
        ('quantitative', 'Quantitative'),
        ('narrative', 'Narrative'),
        ('binary', 'Yes/No'),
        ('date', 'Date'),
        ('percentage', 'Percentage'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # ESRS identification
    code = models.CharField(max_length=20, unique=True)  # e.g., ESRS_E1_1
    name = models.CharField(max_length=300)
    description = models.TextField()
    
    # Classification
    standard = models.CharField(max_length=20, choices=ESRS_STANDARDS)
    section = models.CharField(max_length=100)  # e.g., Strategy, Targets, Metrics
    disclosure_requirement = models.CharField(max_length=20)  # e.g., E1-1, E1-2
    category = models.CharField(max_length=20, choices=DATAPOINT_CATEGORIES)
    
    # Data characteristics
    data_type = models.CharField(max_length=20, choices=DATA_TYPES)
    unit = models.CharField(max_length=50, blank=True, null=True)
    mandatory = models.BooleanField(default=False)
    
    # AI guidance
    ai_guidance = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['standard', 'disclosure_requirement', 'code']
        verbose_name = 'ESRS Datapoint'
        verbose_name_plural = 'ESRS Datapoints'
    
    def __str__(self):
        return f"{self.code}: {self.name}"
    
    @property
    def hierarchy_path(self):
        """Return hierarchical path for display"""
        return f"{self.standard} > {self.section} > {self.disclosure_requirement}"
