from rest_framework import serializers
from base.models import Product


class CloudinaryImageField(serializers.FileField):

    def to_representation(self, value):
        if not value:
            return None
        try:
            if hasattr(value, "build_url"):
                return value.build_url(secure=True)
            url = value.url
            if url and url.startswith("http://res.cloudinary.com/"):
                return url.replace("http://res.cloudinary.com/", "https://res.cloudinary.com/", 1)
            return url
        except Exception:
            return str(value)

    def to_internal_value(self, data):
        if isinstance(data, str):
            if not data.strip():
                return None
            return data
        return super().to_internal_value(data)


class ProductSerializer(serializers.ModelSerializer):

    image = CloudinaryImageField(
        required=False,
        allow_null=True,
    )

    is_active = serializers.BooleanField(
        default=True,
        required=False,
    )

    class Meta:
        model = Product

        fields = [
            "id",
            "category",
            "name",
            "description",
            "price",
            "stock",
            "image",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Product name cannot be empty."
            )

        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Price cannot be negative."
            )

        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value