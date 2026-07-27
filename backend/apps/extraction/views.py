from rest_framework import viewsets

from .models import ExtractedField, ExtractionJob
from .serializers import ExtractedFieldSerializer, ExtractionJobSerializer


class ExtractionJobViewSet(viewsets.ReadOnlyModelViewSet):
    """Polled by the frontend to watch a job progress to a terminal state."""
    serializer_class = ExtractionJobSerializer

    def get_queryset(self):
        return ExtractionJob.objects.select_related("document").all()


class ExtractedFieldViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExtractedFieldSerializer
    filterset_fields = ["document", "status"]

    def get_queryset(self):
        return ExtractedField.objects.select_related("document").all()
