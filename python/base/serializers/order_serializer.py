from rest_framework import serializers

from base.models import (
    Order,
    OrderItem,
    Payment
)


class OrderItemSerializer(
    serializers.ModelSerializer
):

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
