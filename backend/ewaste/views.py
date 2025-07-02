from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EwasteEntry
from .serializers import EwasteEntrySerializer
from carbon.utils import calculate_ewaste_impact


class EwasteEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for EwasteEntry CRUD operations"""
    
    queryset = EwasteEntry.objects.all()
    serializer_class = EwasteEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter entries by user's company"""
        user = self.request.user
        if user.is_superuser:
            return EwasteEntry.objects.all()
        elif user.company:
            return EwasteEntry.objects.filter(company=user.company)
        else:
            return EwasteEntry.objects.none()
    
    def perform_create(self, serializer):
        """Set company when creating entry"""
        serializer.save(company=self.request.user.company)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Mark an e-waste entry as processed"""
        entry = self.get_object()
        entry.status = 'processed'
        entry.save()
        return Response({'status': 'processed'})
    
    @action(detail=False, methods=['post'])
    def calculate_impact(self, request):
        """Calculate environmental impact for e-waste donation"""
        device_type = request.data.get('device_type')
        quantity = request.data.get('quantity', 0)
        weight_kg = request.data.get('weight_kg', 0)
        
        if not device_type or quantity <= 0 or weight_kg <= 0:
            return Response(
                {'error': 'device_type, quantity, and weight_kg are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from decimal import Decimal
        impact = calculate_ewaste_impact(device_type, quantity, Decimal(str(weight_kg)))
        return Response(impact)
    
    @action(detail=False, methods=['get'])
    def company_stats(self, request):
        """Get e-waste statistics for user's company"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.db.models import Sum, Count
        
        stats = EwasteEntry.objects.filter(
            company=request.user.company
        ).aggregate(
            total_entries=Count('id'),
            total_devices=Sum('quantity'),
            total_weight_kg=Sum('weight_kg'),
            total_co2_saved=Sum('estimated_co2_saved'),
            total_credits=Sum('carbon_credits_generated'),
        )
        
        # Device type breakdown
        device_breakdown = EwasteEntry.objects.filter(
            company=request.user.company
        ).values('device_type').annotate(
            count=Count('id'),
            total_quantity=Sum('quantity'),
            total_weight=Sum('weight_kg'),
            total_co2=Sum('estimated_co2_saved'),
        ).order_by('-total_quantity')
        
        return Response({
            'summary': {
                'total_entries': stats['total_entries'] or 0,
                'total_devices_donated': stats['total_devices'] or 0,
                'total_weight_kg': float(stats['total_weight_kg'] or 0),
                'total_co2_saved': float(stats['total_co2_saved'] or 0),
                'total_carbon_credits': float(stats['total_credits'] or 0),
            },
            'device_breakdown': [
                {
                    'device_type': item['device_type'],
                    'entries': item['count'],
                    'quantity': item['total_quantity'],
                    'weight_kg': float(item['total_weight'] or 0),
                    'co2_saved': float(item['total_co2'] or 0),
                } for item in device_breakdown
            ]
        })
