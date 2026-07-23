from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = (
            "id",
            "application",
            "filename",
            "content_type",
            "size_bytes",
            "checksum",
            "version",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

class DocumentUploadRequestSerializer(serializers.Serializer):
    """Step 1 of upload: client declares what it's about to send."""
    filename = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100)

    def validate_content_type(self, value):
        allowed = {"application/pdf", "image/png", "image/jpeg"}
        if value not in allowed:
            raise serializers.ValidationError(f"Unsupported type. Allowed: {sorted(allowed)}")
        return value