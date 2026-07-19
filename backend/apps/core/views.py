from django.core.cache import cache
from django.db import connection
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def _check_database() -> tuple[bool, str]:
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True, "ok"
    except Exception as exc:  # noqa: BLE001 - health checks report, never raise
        return False, str(exc)


def _check_redis() -> tuple[bool, str]:
    try:
        cache.set("healthz", "ok", timeout=5)
        if cache.get("healthz") != "ok":
            return False, "read-back mismatch"
        return True, "ok"
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)


@extend_schema(
    summary="Liveness + dependency health",
    description="Reports process health plus reachability of Postgres and Redis.",
    responses={200: dict, 503: dict},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def healthz(request):
    db_ok, db_detail = _check_database()
    redis_ok, redis_detail = _check_redis()
    healthy = db_ok and redis_ok

    return Response(
        {
            "status": "ok" if healthy else "degraded",
            "service": "docuflow-api",
            "checks": {
                "database": {"ok": db_ok, "detail": db_detail},
                "redis": {"ok": redis_ok, "detail": redis_detail},
            },
        },
        status=status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE,
    )
