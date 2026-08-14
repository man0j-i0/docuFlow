from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status as http_status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from apps.core.permissions import IsAdminOrReviewer

from .models import Application, StateTransition
from .serializers import ApplicationSerializer, StateTransitionSerializer
from .workflow import InvalidTransition, transition
from apps.core.permissions import IsAdmin
class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "owner"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "title"]

    def get_queryset(self):
        return Application.objects.select_related("owner").all()

    def get_permissions(self):
        # This override shadows the @action-level permission_classes, so
        # admin-only actions must be listed here explicitly.
        if self.action in ("list", "retrieve"):
            return super().get_permissions()
        if self.action in ("approve", "reject", "send_back"):
            return [IsAdmin()]
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

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        return self._transition_to(Application.Status.APPROVED)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        return self._transition_to(Application.Status.REJECTED)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def send_back(self, request, pk=None):
        return self._transition_to(Application.Status.REVIEW)

    def _transition_to(self, to_state):
        application = self.get_object()
        try:
            transition(application, to_state, actor=self.request.user)
        except InvalidTransition as exc:
            return Response({"detail": str(exc)}, status=http_status.HTTP_409_CONFLICT)
        return Response(self.get_serializer(application).data)


class StateTransitionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StateTransitionSerializer
    filterset_fields = ["application"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return StateTransition.objects.select_related("actor").all()        
