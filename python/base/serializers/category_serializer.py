from rest_framework import serializers
from django.utils.text import slugify

from base.models import Category


class CategorySerializer(serializers.ModelSerializer):

    class Meta:

        model = Category

        fields = [
            "id",
            "name",
            "slug",
            "description",
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
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True}
        }

    def validate_name(self, value):

        if value is not None:
            value = value.strip()

            if not value:
                raise serializers.ValidationError(
                    "Category name cannot be empty."
                )

        return value

    def validate_slug(self, value):

        if value is not None and value != "":
            value = value.strip().lower()

            if not value:
                raise serializers.ValidationError(
                    "Category slug cannot be empty."
                )

        return value

    def validate(self, attrs):

        name = attrs.get("name")
        slug = attrs.get("slug")

        if name and (not slug or not slug.strip()):
            attrs["slug"] = slugify(name)

        return super().validate(attrs)