from rest_framework import serializers

from .models import ExtractedField, ExtractionJob


class ExtractionJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractionJob
        fields = (
            "id", "document", "status", "attempts", "error",
            "started_at", "finished_at", "created_at", "updated_at",
        )
        read_only_fields = fields


class ExtractedFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedField
        fields = (
            "id", "document", "key", "value", "confidence", "bbox",
            "corrected_value", "status", "created_at", "updated_at",
        )
        read_only_fields = ("id", "document", "key", "value", "confidence", "bbox", "created_at", "updated_at")

    def validate(self, attrs):
        # Only status and corrected_value are writable; guard the combination.
        status = attrs.get("status", getattr(self.instance, "status", None))
        corrected = attrs.get(
            "corrected_value", getattr(self.instance, "corrected_value", "")
        )
        if status == ExtractedField.Status.EDITED and not corrected:
            raise serializers.ValidationError(
                {"corrected_value": "An edited field must include a corrected value."}
            )
        return attrs
