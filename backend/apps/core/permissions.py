from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdmin(BasePermission):
    message = "Admin role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_admin)
    

class IsReviewer(BasePermission):
    message = "Reviewer role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_reviewer)
    

class IsAudtior(BasePermission):
    message = "Auditor role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_auditor)
    

class IsAdminOrReviewer(BasePermission):
    """The working roles — upload, extract, review, edit fields."""

    message = "Admin or reviewer role required."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and (user.is_admin or user.is_reviewer)
        )


class IsAuditorReadOnly(BasePermission):
    """Auditors observe; they never mutate. Blocks any non-safe method."""

    message = "Auditors have read-only access."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated and user.is_auditor):
            return False
        return request.method in SAFE_METHODS



