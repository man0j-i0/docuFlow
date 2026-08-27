import pytest
from rest_framework.test import APIClient
from apps.core.factories import AdminFactory, AuditorFactory, UserFactory


@pytest.fixture
def api():
    return APIClient()

@pytest.fixture
def auth_api(api):
    """Returns a factory: give it a user, get an authenticated client."""
    def _make(user):
        resp = api.post("/api/v1/auth/login", {"email": user.email, "password": "testpass123"}, format="json")
        api.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        return api
    return _make

@pytest.fixture
def admin(db):
    return AdminFactory()

@pytest.fixture
def reviewer(db):
    return UserFactory()

@pytest.fixture
def auditor(db):
    return AuditorFactory()