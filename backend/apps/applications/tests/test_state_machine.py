import pytest

from apps.applications.models import Application, StateTransition
from apps.applications.workflow import InvalidTransition, can_transition, transition
from apps.core.factories import AdminFactory, ApplicationFactory


@pytest.mark.django_db
class TestStateMachine:
    def test_full_legal_chain(self):
        admin = AdminFactory()
        app = ApplicationFactory(status=Application.Status.DRAFT)

        chain = ["uploaded", "extracting", "review", "pending_approval", "approved", "archived"]
        for target in chain:
            transition(app, target, actor=admin)

        assert app.status == Application.Status.ARCHIVED
        # one StateTransition logged per step
        assert StateTransition.objects.filter(application=app).count() == 6

    def test_illegal_transition_raises_and_changes_nothing(self):
        app = ApplicationFactory(status=Application.Status.REVIEW)
        with pytest.raises(InvalidTransition):
            transition(app, Application.Status.DRAFT)   # review -> draft is illegal

        app.refresh_from_db()
        assert app.status == Application.Status.REVIEW
        assert StateTransition.objects.filter(application=app).count() == 0

    def test_can_transition_matches_map(self):
        assert can_transition(Application.Status.REVIEW, Application.Status.PENDING_APPROVAL)
        assert not can_transition(Application.Status.REVIEW, Application.Status.DRAFT)
