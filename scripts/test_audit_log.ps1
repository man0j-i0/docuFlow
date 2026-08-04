# Verifies the AuditLog write path (Phase 5, PR 2):
#   - a state transition writes exactly one AuditLog row (with old/new status)
#   - the entry is written in the SAME transaction: if the surrounding block
#     rolls back, NO audit row survives (the integrity guarantee)
#   - the log is append-only in practice (we only ever create)
#
# Runs at the service level via the shell for determinism. Cleans up after.

$ErrorActionPreference = "Stop"

$py = @'
from django.db import transaction
from apps.applications.models import Application
from apps.applications.workflow import transition
from apps.audit.models import AuditLog
from apps.users.models import User

admin = User.objects.filter(role="admin").first()
app = Application.objects.create(title="__audit_test__", owner=admin)
ok = True

def audit_count():
    return AuditLog.objects.filter(entity_type="Application", entity_id=app.id).count()

# 1. a legal transition writes exactly one audit row
before = audit_count()
transition(app, "uploaded", actor=admin)
after = audit_count()
print("rows after transition :", after - before, "(want 1)")
ok = ok and (after - before) == 1

entry = AuditLog.objects.filter(entity_type="Application", entity_id=app.id).order_by("-created_at").first()
print("action                :", entry.action, "(want application.uploaded)")
print("old -> new            :", entry.old_value, "->", entry.new_value)
ok = ok and entry.action == "application.uploaded"
ok = ok and entry.old_value == {"status": "draft"} and entry.new_value == {"status": "uploaded"}

# 2. THE GUARANTEE: roll back a block that transitions + does the audit,
#    and confirm no audit row survives.
count_before_rollback = audit_count()
try:
    with transaction.atomic():
        transition(app, "extracting", actor=admin)   # writes an audit row...
        raise RuntimeError("force rollback")          # ...but we blow up the block
except RuntimeError:
    pass
app.refresh_from_db()
count_after_rollback = audit_count()
print("status after rollback :", app.status, "(want uploaded - unchanged)")
print("audit rows added      :", count_after_rollback - count_before_rollback, "(want 0)")
ok = ok and app.status == "uploaded" and count_after_rollback == count_before_rollback

# cleanup
AuditLog.objects.filter(entity_type="Application", entity_id=app.id).delete()
app.delete()

print("RESULT:", "PASS" if ok else "FAIL")
'@

$py | docker compose exec -T backend python manage.py shell
