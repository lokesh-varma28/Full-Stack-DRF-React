from rest_framework import serializers
from base.models import Address


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            "id",
            "full_name",
            "phone",
            "address_line",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_full_name(self, value):
        if value is None:
            raise serializers.ValidationError("Full name is required.")
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Full name cannot be empty.")
        return value

    def validate_address_line(self, value):
        if value is None:
            raise serializers.ValidationError("Address line is required.")
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Address line cannot be empty.")
        return value

    def validate_city(self, value):
        if value is None:
            raise serializers.ValidationError("City is required.")
        value = value.strip()
        if not value:
            raise serializers.ValidationError("City cannot be empty.")
        return value

    def validate_state(self, value):
        if value is None:
            raise serializers.ValidationError("State is required.")
        value = value.strip()
        if not value:
            raise serializers.ValidationError("State cannot be empty.")
        return value

    def validate_country(self, value):
        if value is None or not str(value).strip():
            return "India"
        return str(value).strip()

    def validate_phone(self, value):
        if value is None:
            raise serializers.ValidationError("Phone number is required.")
        value = str(value).strip()
        if not value:
            raise serializers.ValidationError("Phone number cannot be empty.")
        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )
        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 10 and 15 digits."
            )
        return value

    def validate_postal_code(self, value):
        if value is None:
            raise serializers.ValidationError("Postal code is required.")
        value = str(value).strip()
        if not value:
            raise serializers.ValidationError("Postal code cannot be empty.")
        if not value.isdigit():
            raise serializers.ValidationError(
                "Postal code must contain only digits."
            )
        if len(value) != 6:
            raise serializers.ValidationError(
                "Postal code must contain 6 digits."
            )
        return value