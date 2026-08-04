from .models import AuditLog


def record(*, action, entity, actor=None, old_value=None, new_value=None):
    """Write an audit entry. Call inside the caller's transaction so the log and
    the mutation commit together (or roll back together)."""
    return AuditLog.objects.create(
        actor=actor,
        action=action,
        entity_type=entity.__class__.__name__,
        entity_id=entity.pk,
        old_value=old_value,
        new_value=new_value
    )