import uuid

from django.db import models

from apps.applications.models import Application
from apps.core.models import TimeStampModel, UUIDModel


class Document(UUIDModel, TimeStampModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending upload"
        UPLOADED = "uploaded", "Uploaded"
        EXTRACTING = "extracting", "Extracting"
        EXTRACTED = "extracted", "Extracted"
        FAILED = "failed", "Failed"

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="documents"
    )
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    s3_key = models.CharField(max_length=512, unique=True)
    size_bytes = models.BigIntegerField(null=True, blank=True)
    checksum = models.CharField(max_length=64, blank=True)
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["application", "-created_at"])]

    def __str__(self):
        return f"{self.filename} v{self.version} ({self.status})"


    @staticmethod
    def build_s3_key(application_id, filename: str) -> str:
        return f"applications/{application_id}/{uuid.uuid4()}/{filename}"