from rest_framework import serializers
from django.contrib.auth import get_user_model
from companies.serializers import CompanySerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    company_data = CompanySerializer(source='company', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'company', 'company_data', 'role', 'is_active', 'created_at', 'is_onboarding_complete'
        ]
        read_only_fields = ['id', 'created_at', 'company_data']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        """Create user with encrypted password"""
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user
