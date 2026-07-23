from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ApplicationDocumentsView, DocumentViewSet

router = DefaultRouter(trailing_slash=False)
router.register("documents", DocumentViewSet, basename="document")

urlpatterns = router.urls + [
    path(
        "applications/<uuid:application_pk>/documents",
        ApplicationDocumentsView.as_view({"post": "create"}),
        name="application-documents",
    ),
]