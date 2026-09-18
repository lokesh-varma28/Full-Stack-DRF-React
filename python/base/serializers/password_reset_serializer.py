from django.contrib.auth.models import User
from django.contrib.auth.password_validation import (
    validate_password
)
from django.core.exceptions import (
    ValidationError as DjangoValidationError
)

from rest_framework import serializers

from base.models import PasswordResetOTP


# ============================================================
# FORGOT PASSWORD SERIALIZER
# ============================================================

class ForgotPasswordSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    def validate_email(self, value):

        value = value.strip().lower()

        try:

            User.objects.get(
                email=value,
                is_active=True
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                "No active account is associated with this email."
            )

        return value


# ============================================================
# VERIFY PASSWORD RESET OTP SERIALIZER
# ============================================================

class PasswordResetOTPVerifySerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    otp = serializers.CharField(
        min_length=6,
        max_length=6
    )

    # ========================================================
    # EMAIL VALIDATION
    # ========================================================

    def validate_email(self, value):

        return value.strip().lower()

    # ========================================================
    # OTP VALIDATION
    # ========================================================

    def validate_otp(self, value):

        if not value.isdigit():

            raise serializers.ValidationError(
                "OTP must contain only numbers."
            )

        return value

    # ========================================================
    # EMAIL + OTP VALIDATION
    # ========================================================

    def validate(self, attrs):

        email = attrs["email"]
        otp = attrs["otp"]

        # ----------------------------------------------------
        # Get user
        # ----------------------------------------------------

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            raise serializers.ValidationError({
                "email": (
                    "User with this email "
                    "does not exist."
                )
            })

        # ----------------------------------------------------
        # User must be active
        # ----------------------------------------------------

        if not user.is_active:

            raise serializers.ValidationError({
                "email": (
                    "Please verify your email "
                    "before resetting your password."
                )
            })

        # ----------------------------------------------------
        # Get password reset OTP
        # ----------------------------------------------------

        try:

            reset_otp = PasswordResetOTP.objects.get(
                user=user
            )

        except PasswordResetOTP.DoesNotExist:

            raise serializers.ValidationError({
                "otp": (
                    "OTP not found. "
                    "Please request a new OTP."
                )
            })

        # ----------------------------------------------------
        # Check attempts
        # ----------------------------------------------------

        if reset_otp.attempts >= 5:

            raise serializers.ValidationError({
                "otp": (
                    "Too many incorrect attempts. "
                    "Please request a new OTP."
                )
            })

        # ----------------------------------------------------
        # Check already verified
        # ----------------------------------------------------

        if reset_otp.is_verified:

            raise serializers.ValidationError({
                "otp": (
                    "OTP has already been verified."
                )
            })

        # ----------------------------------------------------
        # Check expiry
        # ----------------------------------------------------

        from django.utils import timezone

        if timezone.now() > reset_otp.expires_at:

            raise serializers.ValidationError({
                "otp": (
                    "OTP has expired. "
                    "Please request a new OTP."
                )
            })

        # ----------------------------------------------------
        # Check OTP
        # ----------------------------------------------------

        if reset_otp.otp != otp:

            reset_otp.attempts += 1

            reset_otp.save(
                update_fields=[
                    "attempts"
                ]
            )

            raise serializers.ValidationError({
                "otp": "Invalid OTP."
            })

        # ----------------------------------------------------
        # Store objects
        # ----------------------------------------------------

        attrs["user"] = user
        attrs["reset_otp"] = reset_otp

        return attrs


# ============================================================
# RESET PASSWORD SERIALIZER
# ============================================================

class ResetPasswordSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    reset_token = serializers.CharField(
        min_length=32,
        max_length=128
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    # ========================================================
    # EMAIL
    # ========================================================

    def validate_email(self, value):

        return value.strip().lower()

    # ========================================================
    # PASSWORD
    # ========================================================

    def validate_password(self, value):

        # ----------------------------------------------------
        # Uppercase
        # ----------------------------------------------------

        if not any(
            char.isupper()
            for char in value
        ):

            raise serializers.ValidationError(
                "Password must contain an uppercase letter."
            )

        # ----------------------------------------------------
        # Lowercase
        # ----------------------------------------------------

        if not any(
            char.islower()
            for char in value
        ):

            raise serializers.ValidationError(
                "Password must contain a lowercase letter."
            )

        # ----------------------------------------------------
        # Number
        # ----------------------------------------------------

        if not any(
            char.isdigit()
            for char in value
        ):

            raise serializers.ValidationError(
                "Password must contain a number."
            )

        # ----------------------------------------------------
        # Django password validators
        # ----------------------------------------------------

        try:

            validate_password(value)

        except DjangoValidationError as e:

            raise serializers.ValidationError(
                list(e.messages)
            )

        return value

    # ========================================================
    # PASSWORD MATCH
    # ========================================================

    def validate(self, attrs):

        if (
            attrs["password"]
            != attrs["confirm_password"]
        ):

            raise serializers.ValidationError({
                "confirm_password": (
                    "Passwords do not match."
                )
            })

        return attrs