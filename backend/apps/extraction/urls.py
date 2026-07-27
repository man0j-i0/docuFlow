from rest_framework.routers import DefaultRouter

from .views import ExtractedFieldViewSet, ExtractionJobViewSet

router = DefaultRouter(trailing_slash=False)
router.register("jobs", ExtractionJobViewSet, basename="job")
router.register("fields", ExtractedFieldViewSet, basename="field")

urlpatterns = router.urls