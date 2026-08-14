from rest_framework import serializers
from apps.users.serializers import UserSerializer

from .models import Application, StateTransition


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


class StateTransitionSerializer(serializers.ModelSerializer):
    actor_email = serializers.EmailField(source="actor.email", default=None, read_only=True)

    class Meta:
        model = StateTransition
        fields = (
            "id",
            "application",
            "from_state",
            "to_state",
            "actor",
            "actor_email",
            "created_at",
        )

        read_only_fields = fields            

