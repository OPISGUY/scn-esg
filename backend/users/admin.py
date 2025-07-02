from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'company', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'company', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    readonly_fields = ['id', 'created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('company', 'role', 'created_at')
        }),
    )
