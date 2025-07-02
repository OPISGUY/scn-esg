from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for Company CRUD operations"""
    
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter companies based on user permissions"""
        user = self.request.user
        if user.is_superuser:
            return Company.objects.all()
        elif user.company:
            return Company.objects.filter(id=user.company.id)
        else:
            return Company.objects.none()
