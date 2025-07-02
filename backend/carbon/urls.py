from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import bulk_operations
from . import ai_views

router = DefaultRouter()
router.register('footprints', views.CarbonFootprintViewSet)
router.register('offsets', views.CarbonOffsetViewSet)
router.register('purchases', views.OffsetPurchaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Bulk operations
    path('bulk/import-footprints/', bulk_operations.bulk_import_carbon_footprints, name='bulk-import-footprints'),
    path('bulk/export-footprints/', bulk_operations.export_carbon_footprints, name='bulk-export-footprints'),
    path('bulk/import-offsets/', bulk_operations.bulk_import_carbon_offsets, name='bulk-import-offsets'),
    path('bulk/export-offsets/', bulk_operations.export_carbon_offsets, name='bulk-export-offsets'),
    
    # AI-powered endpoints (Phase 5)
    path('ai/validate/', ai_views.ai_validate_emission_data, name='ai-validate-data'),
    path('ai/suggest-factors/', ai_views.ai_suggest_emission_factors, name='ai-suggest-factors'),
    path('ai/benchmark/', ai_views.ai_benchmark_company, name='ai-benchmark'),
    path('ai/action-plan/', ai_views.ai_generate_action_plan, name='ai-action-plan'),
    path('ai/predict-trajectory/', ai_views.ai_predict_carbon_trajectory, name='ai-predict-trajectory'),
    path('ai/conversational/', ai_views.ai_conversational_data_entry, name='ai-conversational'),
    path('ai/health/', ai_views.ai_service_health, name='ai-health'),
]
