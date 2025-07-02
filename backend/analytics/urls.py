from django.urls import path
from .views import (
    DashboardAnalyticsView, TrendsAnalyticsView, ImpactMetricsView,
    RealTimeDashboardView, BenchmarkingView, PredictiveAnalyticsView
)

urlpatterns = [
    path('dashboard/', DashboardAnalyticsView.as_view(), name='dashboard-analytics'),
    path('dashboard/realtime/', RealTimeDashboardView.as_view(), name='realtime-dashboard'),
    path('trends/', TrendsAnalyticsView.as_view(), name='trends-analytics'),
    path('impact/', ImpactMetricsView.as_view(), name='impact-metrics'),
    path('benchmarks/', BenchmarkingView.as_view(), name='industry-benchmarks'),
    path('predictions/', PredictiveAnalyticsView.as_view(), name='predictive-analytics'),
]
