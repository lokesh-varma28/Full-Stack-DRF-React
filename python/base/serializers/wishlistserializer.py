
from rest_framework import serializers

from base.models import Wishlist
# from base.serializers.productserializer import ProductSerializer
from .product_serializer import ProductSerializer


class WishlistSerializer(serializers.ModelSerializer):

    product = ProductSerializer(
        read_only=True
    )

    product_id = serializers.PrimaryKeyRelatedField(
        source="product",
        queryset=Wishlist._meta.get_field("product").remote_field.model.objects.all(),
        write_only=True,
    )

    class Meta:

        model = Wishlist

        fields = [
            "id",
            "product",
            "product_id",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product",
            "created_at",
        ]