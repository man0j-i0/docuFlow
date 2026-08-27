import pytest
from django.db import transaction

from apps.applications.models import Application
from apps.applications.workflow import transition
from apps.audit.models import AuditLog
from apps.core.factories import AdminFactory, ApplicationFactory


@pytest.mark.django_db
class TestAuditIntegrity:
    def test_transition_writes_audit_entry(self):
        admin = AdminFactory()
        app = ApplicationFactory(status=Application.Status.DRAFT)

        transition(app, Application.Status.UPLOADED, actor=admin)

        entry = AuditLog.objects.filter(entity_type="Application", entity_id=app.id).first()
        assert entry is not None
        assert entry.action == "application.uploaded"
        assert entry.old_value == {"status": "draft"}
        assert entry.new_value == {"status": "uploaded"}
        assert entry.actor_id == admin.id

    def test_rollback_leaves_no_audit_row(self):
        """The integrity guarantee: if the surrounding transaction rolls back,
        the audit entry rolls back with it — the log can't drift from reality."""
        admin = AdminFactory()
        app = ApplicationFactory(status=Application.Status.DRAFT)
        before = AuditLog.objects.count()

        with pytest.raises(RuntimeError):
            with transaction.atomic():
                transition(app, Application.Status.UPLOADED, actor=admin)
                raise RuntimeError("force rollback")

        app.refresh_from_db()
        assert app.status == Application.Status.DRAFT      # status change rolled back
        assert AuditLog.objects.count() == before          # no audit row survived
