from botocore.exceptions import ClientError
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.applications.models import Application
from apps.core.permissions import IsAdminOrReviewer
from apps.core.storage import head_object, presigned_get, presigned_put

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadRequestSerializer


class DocumentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DocumentSerializer
    filterset_fields = ["application", "status"]
    ordering_fields = ["created_at", "filename"]

    def get_queryset(self):
        return Document.objects.select_related("application").all()

    @extend_schema(summary="Presigned download URL")
    @action(detail=True, methods=["get"])
    def file(self, request, pk=None):
        document = self.get_object()
        return Response({"url": presigned_get(document.s3_key), "filename": document.filename})

    @extend_schema(
        summary="Confirm upload completed",
        description="Called after the client PUTs to the presigned URL. Verifies the object exists and records its size and checksum.",
    )
    @action(detail=True, methods=["post"], permission_classes=[IsAdminOrReviewer])
    def complete(self, request, pk=None):
        document = self.get_object()
        try:
            head = head_object(document.s3_key)
        except ClientError:
            return Response(
                {"detail": "No object found at expected key. Upload may have failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        document.size_bytes = head["ContentLength"]
        document.checksum = head["ETag"].strip('"')
        document.status = Document.Status.UPLOADED
        document.save(update_fields=["size_bytes", "checksum", "status", "updated_at"])

        app = document.application
        if app.status == Application.Status.DRAFT:
            app.status = Application.Status.UPLOADED
            app.save(update_fields=["status", "updated_at"])

        return Response(DocumentSerializer(document).data)


class ApplicationDocumentsView(viewsets.ViewSet):
    permission_classes = [IsAdminOrReviewer]

    @extend_schema(
        summary="Request a presigned upload URL",
        request=DocumentUploadRequestSerializer,
        responses={201: dict},
    )
    def create(self, request, application_pk=None):
        application = get_object_or_404(Application, pk=application_pk)

        serializer = DocumentUploadRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        filename = serializer.validated_data["filename"]
        content_type = serializer.validated_data["content_type"]

        version = Document.objects.filter(
            application=application, filename=filename
        ).count() + 1

        document = Document.objects.create(
            application=application,
            filename=filename,
            content_type=content_type,
            s3_key=Document.build_s3_key(application.id, filename),
            version=version,
            status=Document.Status.PENDING,
        )

        return Response(
            {
                "document": DocumentSerializer(document).data,
                "upload_url": presigned_put(document.s3_key, content_type),
                "expires_in": 3600
            },
            status=status.HTTP_201_CREATED
        )