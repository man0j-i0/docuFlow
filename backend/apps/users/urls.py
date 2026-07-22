from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, MeView, AdminOnlyView, ReviewerAreaView, AuditReadView

app_name = "users"


urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("login", LoginView.as_view(), name="login"),
    path("refresh",TokenRefreshView.as_view(), name="refresh"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("me", MeView.as_view(), name="me"),
    path("rbac/admin", AdminOnlyView.as_view, name="rbac-admin"),
    path("rbac/reviewer", ReviewerAreaView.as_view(), name="rbac-reviewer"),
    path("rbac/audit", AuditReadView.as_view(), name="rbac-audit"),   
]