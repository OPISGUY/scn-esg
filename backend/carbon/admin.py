from django.contrib import admin
from .models import CarbonFootprint, CarbonOffset, OffsetPurchase


@admin.register(CarbonFootprint)
class CarbonFootprintAdmin(admin.ModelAdmin):
    list_display = ['company', 'reporting_period', 'total_emissions', 'status', 'created_at']
    list_filter = ['status', 'reporting_period', 'created_at']
    search_fields = ['company__name', 'reporting_period']
    readonly_fields = ['id', 'total_emissions', 'created_at']


@admin.register(CarbonOffset)
class CarbonOffsetAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'price_per_tonne', 'available_quantity', 'category']
    list_filter = ['category', 'type', 'created_at']
    search_fields = ['name', 'type', 'description']
    readonly_fields = ['id', 'created_at']


@admin.register(OffsetPurchase)
class OffsetPurchaseAdmin(admin.ModelAdmin):
    list_display = ['company', 'offset', 'quantity', 'total_price', 'status', 'purchase_date']
    list_filter = ['status', 'purchase_date']
    search_fields = ['company__name', 'offset__name']
    readonly_fields = ['id', 'total_co2_offset', 'total_price', 'purchase_date']
