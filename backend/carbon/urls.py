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
    path('ai/conversational/', ai_views.ai_conversational_data_entry, name='ai-conversational'),  # DEPRECATED
    path('ai/health/', ai_views.ai_service_health, name='ai-health'),
    
    # Smart Data Entry System - Phase 1 MVP (New endpoints per vision doc)
    path('ai/extract-from-conversation/', ai_views.ai_extract_from_conversation, name='ai-extract-conversation'),
    path('ai/update-with-context/', ai_views.ai_update_with_context, name='ai-update-context'),
    path('ai/conversations/<uuid:session_id>/', ai_views.conversation_session, name='conversation-session-detail'),
    path('ai/conversations/', ai_views.conversation_session, name='conversation-session-create'),
    
    # Smart Data Entry System - Phase 2: Multi-Modal Document Upload
    path('ai/upload-document/', ai_views.upload_document, name='upload-document'),
    path('ai/documents/<uuid:document_id>/', ai_views.get_document, name='get-document'),
    path('ai/documents/<uuid:document_id>/validate/', ai_views.validate_document, name='validate-document'),
    path('ai/documents/<uuid:document_id>/apply/', ai_views.apply_document_to_footprint, name='apply-document'),
    
    # Smart Data Entry System - Phase 3 Week 1: Predictive Auto-Fill & Forecasting
    path('ai/predict/', ai_views.ai_predict_next_value, name='ai-predict-next-value'),
    path('ai/predict/seasonal/', ai_views.ai_predict_seasonal_patterns, name='ai-predict-seasonal'),
    path('ai/predict/trend/', ai_views.ai_predict_growth_trend, name='ai-predict-trend'),
    
    # Smart Data Entry System - Phase 3 Week 2-4: Guidance, Smart Calculations, Benchmarking
    # Import phase3_views at top of file
]

from . import phase3_views

urlpatterns += [
    # Proactive Guidance
    path('guidance/completeness/<uuid:footprint_id>/', phase3_views.get_completeness_score, name='guidance-completeness'),
    path('guidance/missing-data/<uuid:footprint_id>/', phase3_views.get_missing_data_alerts, name='guidance-missing-data'),
    path('guidance/onboarding/', phase3_views.get_onboarding_flow, name='guidance-onboarding'),
    path('guidance/reminders/', phase3_views.get_seasonal_reminders, name='guidance-reminders'),
    path('guidance/next-actions/<uuid:footprint_id>/', phase3_views.get_next_actions, name='guidance-next-actions'),
    
    # Emission Factor Lookup (Smart Calculations)
    path('emission-factors/lookup/', phase3_views.lookup_emission_factor, name='emission-factor-lookup'),
    path('emission-factors/', phase3_views.list_emission_factors, name='emission-factors-list'),
    
    # Industry Benchmarking
    path('benchmarking/compare/<uuid:footprint_id>/', phase3_views.get_peer_comparison, name='benchmarking-compare'),
    path('benchmarking/opportunities/<uuid:footprint_id>/', phase3_views.get_improvement_opportunities, name='benchmarking-opportunities'),
    path('benchmarking/leaders/', phase3_views.get_industry_leaders, name='benchmarking-leaders'),
]
