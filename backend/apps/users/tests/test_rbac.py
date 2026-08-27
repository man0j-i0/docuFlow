import pytest


@pytest.mark.django_db
class TestAuth:
    def test_login_returns_tokens_and_user(self, api, reviewer):
        resp = api.post("/api/v1/auth/login", {"email": reviewer.email, "password": "testpass123"}, format="json")
        assert resp.status_code == 200
        assert "access" in resp.data and "refresh" in resp.data
        assert resp.data["user"]["email"] == reviewer.email

    def test_me_requires_auth(self, api):
        assert api.get("/api/v1/auth/me").status_code == 401

    def test_register_ignores_role(self, api):
        # mass-assignment guard: you cannot register yourself as admin
        resp = api.post("/api/v1/auth/register", {
            "email": "sneaky@test.local", "full_name": "x",
            "password": "Str0ngPass!23", "password_confirm": "Str0ngPass!23",
            "role": "admin"
        }, format="json")
        assert resp.status_code == 201
        from django.contrib.auth import get_user_model
        assert get_user_model().objects.get(email="sneaky@test.local").role == "reviewer"

@pytest.mark.django_db
class TestApplicationRBAC:
    def test_reviewer_can_create(self, auth_api, reviewer):
        client = auth_api(reviewer)
        assert client.post("/api/v1/applications", {"title": "x"}, format="json").status_code == 201

    def test_auditor_cannot_create(self, auth_api, auditor):
        client = auth_api(auditor)
        assert client.post("/api/v1/applications", {"title": "x"}, format="json").status_code == 403

    def test_owner_and_status_are_not_settable(self, auth_api, reviewer):
        client = auth_api(reviewer)
        resp = client.post("/api/v1/applications",
                           {"title": "x", "status": "approved", "owner": "00000000-0000-0000-0000-000000000000"},
                           format="json")
        
        assert resp.status_code == 201
        assert resp.data["status"] == "draft"
        assert resp.data["owner"]["email"] == reviewer.email