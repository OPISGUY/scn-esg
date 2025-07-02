from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'employees', 'created_at']
    list_filter = ['industry', 'created_at']
    search_fields = ['name', 'industry']
    readonly_fields = ['id', 'created_at', 'updated_at']
