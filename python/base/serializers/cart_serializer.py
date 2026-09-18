from rest_framework import serializers

from base.models import Cart, CartItem, Product


class CartItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    product_image = serializers.SerializerMethodField()

    total_price = serializers.SerializerMethodField()

    class Meta:

        model = CartItem

        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "product_image",
            "quantity",
            "total_price"
        ]

        read_only_fields = [
            "id",
            "product_name",
            "product_price",
            "product_image",
            "total_price"
        ]

    def get_product_image(self, obj):

        if not obj.product.image:
            return None

        try:
            return obj.product.image.url
        except Exception:
            return str(obj.product.image)

    def get_total_price(self, obj):

        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True
    )

    total_price = serializers.SerializerMethodField()

    class Meta:

        model = Cart

        fields = [
            "id",
            "user",
            "items",
            "total_price",
            "created_at",
            "updated_at"
        ]

        read_only_fields = [
            "id",
            "user",
            "items",
            "total_price",
            "created_at",
            "updated_at"
        ]

    def get_total_price(self, obj):

        total = 0

        for item in obj.items.all():

            total += item.product.price * item.quantity

        return total