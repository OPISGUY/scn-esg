from django.contrib import admin
from .models import EwasteEntry


@admin.register(EwasteEntry)
class EwasteEntryAdmin(admin.ModelAdmin):
    list_display = ['company', 'device_type', 'quantity', 'weight_kg', 'estimated_co2_saved', 'status', 'donation_date']
    list_filter = ['device_type', 'status', 'donation_date']
    search_fields = ['company__name', 'device_type']
    readonly_fields = ['id', 'estimated_co2_saved', 'carbon_credits_generated', 'created_at']
