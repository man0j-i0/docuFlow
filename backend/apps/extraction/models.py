from django.db import models

from apps.core.models import TimeStampModel, UUIDModel
from apps.documents.models import Document


class ExtractionJob(UUIDModel, TimeStampModel):
    class Status(models.TextChoices):
        QUEUED = "queued", "Queued"
        RUNNING = "running", "Running"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"          # a single attempt failed; may retry
        DEAD = "dead", "Dead"

    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="extraction_jobs"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.QUEUED, db_index=True

    )
    attempts = models.PositiveIntegerField(default=0)
    error = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["document", "-created_at"])]


    def __str__(self):
        return f"Job {self.id} for {self.document} ({self.status})"


class ExtractedField(UUIDModel, TimeStampModel):
    class Status(models.TextChoices):
        UNREVIEWED = "unreviewed", "Unreviewed"
        ACCEPTED = "accepted", "Accepted"
        EDITED = "edited", "Edited"
        REJECTED = "rejected", "Rejected"


    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="fields"
    )
    key = models.CharField(max_length=100)
    value = models.TextField(blank=True)
    confidence = models.FloatField(default=0.0)
    bbox = models.JSONField(null=True, blank=True)
    corrected_value = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.UNREVIEWED, db_index=True
    )

    class Meta:
        ordering = ["key"]
        constraints = [
            models.UniqueConstraint(fields=["document", "key"], name="uniq_document_field_key")
        ]

    def __str__(self):
        return f"{self.key} = {self.value} ({self.confidence:.2f})"    
            