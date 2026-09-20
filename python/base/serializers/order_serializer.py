from django.contrib.auth.models import User
from rest_framework import serializers

from base.models import (
    Order,
    OrderItem,
    Payment
)
from base.serializers.product_serializer import ProductSerializer


class OrderCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
        ]


class OrderItemSerializer(
    serializers.ModelSerializer
):
    product = ProductSerializer(
        read_only=True
    )

    class Meta:

        model = OrderItem

        fields = [
            "id",
            "product",
            "quantity",
            "price"
        ]


class PaymentSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Payment

        fields = [
            "id",
            "razorpay_payment_id",
            "status",
            "created_at"
        ]


class OrderSerializer(
    serializers.ModelSerializer
):

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    payment = PaymentSerializer(
        read_only=True
    )

    delivery_address = serializers.SerializerMethodField()

    class Meta:

        model = Order

        fields = [
            "id",
            "total_amount",
            "status",
            "razorpay_order_id",
            "delivery_full_name",
            "delivery_phone",
            "delivery_address_line",
            "delivery_city",
            "delivery_state",
            "delivery_postal_code",
            "delivery_country",
            "delivery_address",
            "items",
            "payment",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "total_amount",
            "status",
            "razorpay_order_id",
            "delivery_full_name",
            "delivery_phone",
            "delivery_address_line",
            "delivery_city",
            "delivery_state",
            "delivery_postal_code",
            "delivery_country",
            "delivery_address",
            "items",
            "payment",
            "created_at",
        ]

    def get_delivery_address(self, obj):
        return {
            "full_name": obj.delivery_full_name,
            "phone": obj.delivery_phone,
            "address_line": obj.delivery_address_line,
            "city": obj.delivery_city,
            "state": obj.delivery_state,
            "postal_code": obj.delivery_postal_code,
            "country": obj.delivery_country,
        }


class AdminOrderSerializer(
    serializers.ModelSerializer
):
    user = OrderCustomerSerializer(
        read_only=True
    )

    customer = OrderCustomerSerializer(
        source="user",
        read_only=True
    )

    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    payment = PaymentSerializer(
        read_only=True
    )

    delivery_address = serializers.SerializerMethodField()

    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "customer",
            "total_amount",
            "status",
            "razorpay_order_id",
            "delivery_full_name",
            "delivery_phone",
            "delivery_address_line",
            "delivery_city",
            "delivery_state",
            "delivery_postal_code",
            "delivery_country",
            "delivery_address",
            "items",
            "items_count",
            "payment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_delivery_address(self, obj):
        return {
            "full_name": obj.delivery_full_name,
            "phone": obj.delivery_phone,
            "address_line": obj.delivery_address_line,
            "city": obj.delivery_city,
            "state": obj.delivery_state,
            "postal_code": obj.delivery_postal_code,
            "country": obj.delivery_country,
        }

    def get_items_count(self, obj):
        if hasattr(obj, "_prefetched_objects_cache") and "items" in obj._prefetched_objects_cache:
            return len(obj.items.all())
        return obj.items.count()
