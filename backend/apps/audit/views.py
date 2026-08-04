from rest_framework import viewsets
from rest_framework.permissions import BasePermission

from .models import AuditLog
from .serializers import AuditLogSerializer


class IsAdminOrAuditor(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_admin or u.is_auditor))


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminOrAuditor]
    filterset_fields = ["entity_type", "entity_id", "actor", "action"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return AuditLog.objects.select_related("actor").all()            