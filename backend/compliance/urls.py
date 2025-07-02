from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CSRDAssessmentViewSet, ComplianceActionViewSet, RegulatoryUpdateViewSet,
    ESRSDatapointCatalogViewSet, ESRSDataPointEnhancedViewSet, ComplianceReportingViewSet
)

router = DefaultRouter()
router.register(r'assessments', CSRDAssessmentViewSet, basename='csrd-assessment')
router.register(r'actions', ComplianceActionViewSet, basename='compliance-action')
router.register(r'regulatory-updates', RegulatoryUpdateViewSet, basename='regulatory-update')
router.register(r'esrs-datapoints', ESRSDatapointCatalogViewSet, basename='esrs-datapoint-catalog')
router.register(r'esrs-enhanced', ESRSDataPointEnhancedViewSet, basename='esrs-datapoint-enhanced')
router.register(r'reporting', ComplianceReportingViewSet, basename='compliance-reporting')

urlpatterns = [
    path('api/v1/compliance/', include(router.urls)),
]
