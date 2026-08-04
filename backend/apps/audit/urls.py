from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet


router = DefaultRouter(trailing_slash=False)
router.register("audit", AuditLogViewSet, basename="audit")
urlpatterns = router.urls