from rest_framework import serializers
from .models import AuditLog



class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", default=None, read_only=True)

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "actor",
            "actor_email",
            "action",
            "entity_type",
            "entity_id",
            "old_value",
            "new_value",
            "created_at",
        )
        read_only_fields = fields