# from django.contrib import admin

# Register your models here.

from django.contrib import admin

from base.models import (
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment
)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "price",
        "stock",
        "created_at"
    )

    search_fields = (
        "name",
        "description"
    )


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "created_at"
    )


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "cart",
        "product",
        "quantity"
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "total_amount",
        "status",
        "razorpay_order_id",
        "created_at"
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "razorpay_order_id",
        "user__username"
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "product",
        "quantity",
        "price"
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "order",
        "razorpay_payment_id",
        "status",
        "created_at"
    )

    list_filter = (
        "status",
    )