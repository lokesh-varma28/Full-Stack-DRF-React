from django.contrib.auth.models import User
from rest_framework import serializers

from base.models import EmailOTP


# ============================================================
# VERIFY EMAIL OTP SERIALIZER
# ============================================================

class OTPVerifySerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        min_length=6,
        max_length=6
    )

    # ========================================================
    # EMAIL VALIDATION
    # ========================================================

    def validate_email(self, value):

        value = value.strip().lower()

        try:

            user = User.objects.get(
                email=value
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                "User with this email does not exist."
            )

        if user.is_active:

            raise serializers.ValidationError(
                "Email is already verified."
            )

        return value

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
    # VALIDATE EMAIL + OTP
    # ========================================================

    def validate(self, attrs):

        email = attrs["email"]
        otp = attrs["otp"]

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            raise serializers.ValidationError({
                "email": "User with this email does not exist."
            })

        # ----------------------------------------------------
        # Get OTP
        # ----------------------------------------------------

        try:

            email_otp = EmailOTP.objects.get(
                user=user
            )

        except EmailOTP.DoesNotExist:

            raise serializers.ValidationError({
                "otp": "OTP not found. Please request a new OTP."
            })

        # ----------------------------------------------------
        # Already verified
        # ----------------------------------------------------

        if email_otp.is_verified:

            raise serializers.ValidationError({
                "otp": "OTP has already been verified."
            })

        # ----------------------------------------------------
        # Check OTP
        # ----------------------------------------------------

        if email_otp.otp != otp:

            email_otp.attempts += 1

            email_otp.save(
                update_fields=[
                    "attempts"
                ]
            )

            raise serializers.ValidationError({
                "otp": "Invalid OTP."
            })

        # ----------------------------------------------------
        # Check expiry
        # ----------------------------------------------------

        from django.utils import timezone

        if timezone.now() > email_otp.expires_at:

            raise serializers.ValidationError({
                "otp": "OTP has expired. Please request a new OTP."
            })

        # ----------------------------------------------------
        # Store user + OTP object
        # ----------------------------------------------------

        attrs["user"] = user
        attrs["email_otp"] = email_otp

        return attrs


# ============================================================
# RESEND EMAIL OTP SERIALIZER
# ============================================================

class ResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):

        value = value.strip().lower()

        try:

            user = User.objects.get(
                email=value
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                "User with this email does not exist."
            )

        if user.is_active:

            raise serializers.ValidationError(
                "This account is already active."
            )

        return value

    def validate(self, attrs):

        email = attrs["email"].strip().lower()

        user = User.objects.get(
            email=email
        )

        attrs["user"] = user

        return attrs
