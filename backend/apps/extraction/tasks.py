import logging

from celery import Task, shared_task
from django.db import transaction
from django.utils import timezone


from apps.applications.models import Application
from apps.core.storage import get_object_bytes
from apps.documents.models import Document

from .extractors import get_extractor
from .models import ExtractedField, ExtractionJob

logger = logging.getLogger(__name__)


class ExtractionTask(Task):
    """Base class whose on_failure runs only after retries are exhausted.

    Celery calls this once the task gives up for good — the dead-letter hook.
    A try/except in the task body would swallow the exception and defeat the
    retries; on_failure is the only correct place to mark a job dead.
    """

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        job_id = args[0] if args else kwargs.get("job_id")
        try:
            job = ExtractionJob.objects.select_related("document").get(id=job_id)
        except ExtractionJob.DoesNotExist:
            return

        job.status = ExtractionJob.Status.DEAD
        job.error = str(exc)
        job.finished_at = timezone.now()
        job.save(update_fields=["status", "error", "finished_at", "updated_at"])

        # Surface the failure: mark the document failed and send the application
        # back to uploaded so a human sees it needs attention.
        document = job.document
        document.status = Document.Status.FAILED
        document.save(update_fields=["status", "updated_at"])

        app = document.application
        if app.status in (Application.Status.UPLOADED, Application.Status.EXTRACTING):
            app.status = Application.Status.UPLOADED
            app.save(update_fields=["status", "updated_at"])
        logger.warning("extract_document dead job=%s error=%s", job_id, exc)


@shared_task(
    bind=True,
    base=ExtractionTask,
    name="extraction.extract_document",
    autoretry_for=(Exception,),
    retry_backoff=2,
    retry_backoff_max=60,
    retry_jitter=True,
    max_retries=3,
    time_limit=120,
    soft_time_limit=100,
)
def extract_document(self, job_id: str):
    """Fetch a document from storage, extract fields, persist them.

    Idempotent: re-running upserts fields on (document, key), so a retry or a
    manual re-extract never duplicates. Exhausting retries lands in on_failure,
    which marks the job dead.
    """
    job = ExtractionJob.objects.select_related("document").get(id=job_id)
    document = job.document

    job.status = ExtractionJob.Status.RUNNING
    job.attempts = self.request.retries + 1
    if job.started_at is None:
        job.started_at = timezone.now()
    job.save(update_fields=["status", "attempts", "started_at", "updated_at"])


    logger.info("extract_document start job=%s attempt=%s", job_id, job.attempts) 

    file_bytes = get_object_bytes(document.s3_key)

    result = get_extractor().extract(
        file_bytes = file_bytes,
        filename=document.filename,
        content_type=document.content_type
    )


    with transaction.atomic():
        for f in result.fields:
            ExtractedField.objects.update_or_create(
                document=document,
                key=f.key,
                defaults={
                    "value": f.value,
                    "confidence": f.confidence,
                    "bbox": f.bbox,
                },
            )

        document.status = Document.Status.EXTRACTED
        document.save(update_fields=["status", "updated_at"])

        job.status = ExtractionJob.Status.SUCCEEDED
        job.finished_at = timezone.now()
        job.error = ""
        job.save(update_fields=["status", "finished_at", "error", "updated_at"])

        app = document.application
        if app.status in (Application.Status.UPLOADED, Application.Status.EXTRACTING):
            app.status = Application.Status.REVIEW
            app.save(update_fields=["status", "updated_at"])       


    logger.info("extract_document done job=%s fields=%s", job_id, len(result.fields))
    return {"job_id": str(job_id), "fields": len(result.fields)}