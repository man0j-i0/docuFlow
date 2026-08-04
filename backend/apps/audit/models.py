from django.conf import settings
from django.db import models

from apps.core.models import TimeStampModel, UUIDModel


class AuditLog(UUIDModel, TimeStampModel):

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="audit_entries",
        null=True, blank=True,
    )
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=100)
    entity_id = models.UUIDField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["actor", "created_at"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.action} on {self.entity_type}({self.entity_id})"