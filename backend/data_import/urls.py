from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('sources', views.ImportSourceViewSet, basename='importsource')
router.register('jobs', views.ImportJobViewSet, basename='importjob')
router.register('mappings', views.ImportFieldMappingViewSet, basename='fieldmapping')
router.register('records', views.ImportedRecordViewSet, basename='importedrecord')

urlpatterns = [
    path('', include(router.urls)),
]
