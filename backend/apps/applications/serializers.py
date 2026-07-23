from rest_framework import serializers
from apps.users.serializers import UserSerializer

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Application
        fields = (
            "id",
            "title",
            "description",
            "status",
            "owner",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "status",
            "owner",
            "created_at",
            "updated_at"
        )

