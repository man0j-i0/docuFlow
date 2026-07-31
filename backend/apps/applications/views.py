from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status as http_status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from apps.core.permissions import IsAdminOrReviewer

from .models import Application
from .serializers import ApplicationSerializer
from .workflow import InvalidTransition, transition

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "owner"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "title"]

    def get_queryset(self):
        return Application.objects.select_related("owner").all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return super().get_permissions()
        return [IsAdminOrReviewer()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrReviewer])
    def submit_review(self, request, pk=None):
        application = self.get_object()
        try:
            transition(application, Application.Status.PENDING_APPROVAL, actor=request.user)
        except InvalidTransition as exc:
            return Response({"detail": str(exc)}, status=http_status.HTTP_409_CONFLICT)    
        return Response(self.get_serializer(application).data)