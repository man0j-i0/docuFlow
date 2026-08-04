from rest_framework import mixins, viewsets
from django.db import transaction
from apps.core.permissions import IsAdminOrReviewer
from apps.audit.services import record
from .models import ExtractedField, ExtractionJob
from .serializers import ExtractedFieldSerializer, ExtractionJobSerializer


class ExtractionJobViewSet(viewsets.ReadOnlyModelViewSet):
    """Polled by the frontend to watch a job progress to a terminal state."""
    serializer_class = ExtractionJobSerializer

    def get_queryset(self):
        return ExtractionJob.objects.select_related("document").all()


class ExtractedFieldViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """Read for anyone authenticated (auditors included); PATCH for the review
    actions (accept/edit/reject), admin/reviewer only. Fields are created by the
    pipeline, never by hand — so no POST/DELETE, and PUT is excluded in favour of
    partial updates.
    """

    serializer_class = ExtractedFieldSerializer
    filterset_fields = ["document", "status"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return ExtractedField.objects.select_related("document").all()

    def get_permissions(self):
        if self.request.method == "PATCH":
            return [IsAdminOrReviewer()]
        return super().get_permissions()

    def perform_update(self, serializer):
        instance = serializer.instance
        old = {"status": instance.status, "corrected_value": instance.corrected_value}
        with transaction.atomic():
            field = serializer.save()
            record(
                action=f"field.{field.status}",
                entity=field,
                actor=self.request.user,
                old_value=old,
                new_value={"status": field.status, "corrected_value": field.corrected_value},
            )
