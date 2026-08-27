from unittest.mock import patch

import pytest

from apps.applications.models import Application
from apps.core.factories import ApplicationFactory
from apps.documents.models import Document
from apps.extraction.models import ExtractedField, ExtractionJob
from apps.extraction.tasks import extract_document

# Where the task imports get_object_bytes — patch it at the point of USE, not
# at apps.core.storage, or the task's already-bound reference won't be mocked.
STORAGE = "apps.extraction.tasks.get_object_bytes"


def _make_document():
    app = ApplicationFactory(status=Application.Status.EXTRACTING)
    return Document.objects.create(
        application=app,
        filename="test.pdf",
        content_type="application/pdf",
        s3_key="applications/x/y/test.pdf",
        status=Document.Status.EXTRACTING,
    )


@pytest.mark.django_db
class TestExtractionPipeline:
    def test_success_writes_fields_and_advances_state(self):
        doc = _make_document()
        job = ExtractionJob.objects.create(document=doc)

        with patch(STORAGE, return_value=b"fake pdf bytes"):
            extract_document.apply(args=[str(job.id)])

        job.refresh_from_db()
        doc.refresh_from_db()
        assert job.status == ExtractionJob.Status.SUCCEEDED
        assert doc.status == Document.Status.EXTRACTED
        assert ExtractedField.objects.filter(document=doc).count() == 5
        assert doc.application.status == Application.Status.REVIEW

    def test_rerun_is_idempotent(self):
        doc = _make_document()
        job = ExtractionJob.objects.create(document=doc)

        with patch(STORAGE, return_value=b"same bytes"):
            extract_document.apply(args=[str(job.id)])
            extract_document.apply(args=[str(job.id)])  # re-run

        # Upsert on (document, key) — no duplicate rows.
        assert ExtractedField.objects.filter(document=doc).count() == 5

    def test_failure_exhausts_retries_and_dead_letters(self, monkeypatch):
        # max_retries=0 so the first failure gives up immediately (no backoff sleep).
        monkeypatch.setattr(extract_document, "max_retries", 0)
        doc = _make_document()
        job = ExtractionJob.objects.create(document=doc)

        with patch(STORAGE, side_effect=RuntimeError("storage down")):
            extract_document.apply(args=[str(job.id)], throw=False)

        job.refresh_from_db()
        doc.refresh_from_db()
        assert job.status == ExtractionJob.Status.DEAD
        assert job.error
        assert doc.status == Document.Status.FAILED
        assert doc.application.status == Application.Status.UPLOADED
