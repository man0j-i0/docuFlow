from apps.core.permissions import IsAdmin, IsAdminOrReviewer, IsAuditorReadOnly
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    UserSerializer,
)


@extend_schema(tags=["auth"], summary="Register a new account")
class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=["auth"], summary="Log in and obtain a token pair")
class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=["auth"], summary="Current user profile")
class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@extend_schema(
    tags=["auth"],
    summary="Log out",
    request=LogoutSerializer,
    responses={205: None, 400: None},
)
class LogoutView(APIView):
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_205_RESET_CONTENT)


@extend_schema(
    tags=["rbac-demo"],
    summary="Admin only"
)
class AdminOnlyView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({"ok": True, "seen_by": request.user.role})
    

@extend_schema(
    tags=["rbac-demo"],
    summary="Admin or reviewer"
)
class ReviewerAreaView(APIView):
    permission_classes = [IsAdminOrReviewer]

    def get(self, request):
        return Response({"ok": True, "seen_by": request.user.role})
    

@extend_schema(
    tags=["rbac-demo"],
    summary="Auditor read-only"
)
class AuditReadView(APIView):
    permission_classes = [IsAuditorReadOnly]

    def get(self, request):
        return Response({"ok": True, "seen_by": request.user.role})    