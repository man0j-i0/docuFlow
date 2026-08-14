from rest_framework.routers import DefaultRouter

from .views import ApplicationViewSet, StateTransitionViewSet

router = DefaultRouter(trailing_slash=False)
router.register("applications", ApplicationViewSet, basename="application")
router.register("transitions", StateTransitionViewSet, basename="transition")

urlpatterns = router.urls