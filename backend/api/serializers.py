from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Plant


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = (
            'id',
            'name',
            'botanical_name',
            'family',
            'uses',
            'parts_used',
            'preparation',
            'caution',
            'created_at',
            'updated_at',
        )

    def validate_uses(self, value):
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            raise serializers.ValidationError('Uses must be a list of text values.')
        return [item.strip() for item in value if item.strip()]

    def validate_parts_used(self, value):
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            raise serializers.ValidationError('Parts used must be a list of text values.')
        return [item.strip() for item in value if item.strip()]
