from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from .models import CarbonFootprint, CarbonOffset, OffsetPurchase
from .serializers import CarbonFootprintSerializer, CarbonOffsetSerializer, OffsetPurchaseSerializer
from .utils import calculate_company_carbon_balance, calculate_carbon_footprint, get_dashboard_analytics


@method_decorator(ratelimit(key='user', rate='100/h', method='POST'), name='create')
@method_decorator(ratelimit(key='user', rate='200/h', method='GET'), name='list')
class CarbonFootprintViewSet(viewsets.ModelViewSet):
    """ViewSet for CarbonFootprint CRUD operations"""
    
    queryset = CarbonFootprint.objects.all()
    serializer_class = CarbonFootprintSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter footprints by user's company"""
        user = self.request.user
        if user.is_superuser:
            return CarbonFootprint.objects.all()
        elif user.company:
            return CarbonFootprint.objects.filter(company=user.company)
        else:
            return CarbonFootprint.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating footprint"""
        serializer.save(company=self.request.user.company)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a carbon footprint"""
        footprint = self.get_object()
        footprint.status = 'verified'
        footprint.save()
        return Response({'status': 'verified'})
    
    @action(detail=False, methods=['post'])
    def calculate(self, request):
        """Calculate carbon footprint from input data"""
        data = request.data
        calculation_result = calculate_carbon_footprint(data)
        return Response(calculation_result)
    
    @action(detail=False, methods=['get'])
    @method_decorator(cache_page(60 * 5))  # Cache for 5 minutes
    def carbon_balance(self, request):
        """Get current carbon balance for user's company"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        balance = calculate_company_carbon_balance(request.user.company)
        return Response(balance)


@method_decorator(ratelimit(key='user', rate='300/h', method='GET'), name='list')
class CarbonOffsetViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for CarbonOffset marketplace (read-only)"""
    
    queryset = CarbonOffset.objects.all()
    serializer_class = CarbonOffsetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter available offsets"""
        queryset = CarbonOffset.objects.filter(available_quantity__gt=0)
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price_per_tonne__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_tonne__lte=max_price)
        
        return queryset.order_by('price_per_tonne')


@method_decorator(ratelimit(key='user', rate='50/h', method='POST'), name='create')
@method_decorator(ratelimit(key='user', rate='200/h', method='GET'), name='list')
class OffsetPurchaseViewSet(viewsets.ModelViewSet):
    """ViewSet for OffsetPurchase operations"""
    
    queryset = OffsetPurchase.objects.all()
    serializer_class = OffsetPurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter purchases by user's company"""
        user = self.request.user
        if user.is_superuser:
            return OffsetPurchase.objects.all()
        elif user.company:
            return OffsetPurchase.objects.filter(company=user.company)
        else:
            return OffsetPurchase.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating purchase and handle inventory"""
        with transaction.atomic():
            # Check if enough offsets are available
            offset = serializer.validated_data['offset']
            quantity = serializer.validated_data['quantity']
            
            if offset.available_quantity < quantity:
                raise serializers.ValidationError(
                    f'Only {offset.available_quantity} units available'
                )
            
            # Create the purchase
            purchase = serializer.save(company=self.request.user.company)
            
            # Update offset inventory
            offset.available_quantity -= quantity
            offset.save()
            
            return purchase
    
    @action(detail=False, methods=['get'])
    def dashboard_analytics(self, request):
        """Get comprehensive dashboard analytics"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        analytics = get_dashboard_analytics(request.user.company)
        return Response(analytics)
