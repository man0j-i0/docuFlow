from rest_framework.routers import DefaultRouter

from .views import ApplicationViewSet

router = DefaultRouter(trailing_slash=False)
router.register("applications", ApplicationViewSet, basename="application")

urlpatterns = router.urls