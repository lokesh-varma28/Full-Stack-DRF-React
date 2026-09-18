
from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password",
        ]

    # ========================================================
    # USERNAME VALIDATION
    # ========================================================

    def validate_username(self, value):

        value = value.strip()

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    # ========================================================
    # EMAIL VALIDATION
    # ========================================================

    def validate_email(self, value):

        value = value.strip().lower()

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    # ========================================================
    # PASSWORD VALIDATION
    # ========================================================

    def validate_password(self, value):

        # Uppercase
        if not any(
            char.isupper()
            for char in value
        ):
            raise serializers.ValidationError(
                "Password must contain an uppercase letter."
            )

        # Lowercase
        if not any(
            char.islower()
            for char in value
        ):
            raise serializers.ValidationError(
                "Password must contain a lowercase letter."
            )

        # Number
        if not any(
            char.isdigit()
            for char in value
        ):
            raise serializers.ValidationError(
                "Password must contain a number."
            )

        return value

    # ========================================================
    # CREATE USER
    # ========================================================

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )

        # ----------------------------------------------------
        # IMPORTANT
        # User cannot login until OTP is verified.
        # ----------------------------------------------------

        user.is_active = False

        user.save(
            update_fields=[
                "is_active"
            ]
        )

        return user