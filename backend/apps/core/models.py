import uuid

from django.db import models

class UUIDModel(models.Model):
    """
    UUID primary keys everywhere - non-guessable, safe to expose in URLs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
