from django.db import transaction

from .models import Application, StateTransition
from apps.audit.services import record

TRANSITIONS: dict[str, set[str]] = {
    Application.Status.DRAFT: {Application.Status.UPLOADED},
    Application.Status.UPLOADED: {Application.Status.EXTRACTING},
    Application.Status.EXTRACTING: {Application.Status.REVIEW, Application.Status.UPLOADED},
    Application.Status.REVIEW: {Application.Status.PENDING_APPROVAL},
    Application.Status.PENDING_APPROVAL: {
        Application.Status.APPROVED,
        Application.Status.REJECTED,
        Application.Status.REVIEW,
    },
    Application.Status.APPROVED: {Application.Status.ARCHIVED},
    Application.Status.REJECTED: {Application.Status.ARCHIVED},
}


class InvalidTransition(Exception):
    def __init__(self, from_state: str, to_state: str) -> bool:
        self.from_state = from_state
        self.to_state = to_state
        super().__init__(f"Illegal transition: {from_state} -> {to_state}")


def can_transition(from_state: str, to_state: str) -> bool:
    return to_state in TRANSITIONS.get(from_state, set())        


def transition(application: Application, to_state: str, actor=None) -> Application:
    from_state = application.status
    if not can_transition(from_state, to_state):
        raise InvalidTransition(from_state, to_state)

    with transaction.atomic():
        application.status = to_state
        application.save(update_fields=["status", "updated_at"])
        StateTransition.objects.create(
            application=application,
            from_state=from_state,
            to_state=to_state,
            actor=actor,
        )
        record(
            action=f"application.{to_state}",
            entity=application,
            actor=actor,
            old_value={"status": from_state},
            new_value={"status": to_state},
        )
    return application