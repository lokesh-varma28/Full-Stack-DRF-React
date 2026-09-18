import razorpay

from django.conf import settings
from django.db import transaction

from base.models import (
    Order,
    Payment,
)


def get_razorpay_client():

    if not settings.RAZORPAY_KEY_ID:
        raise ValueError(
            "RAZORPAY_KEY_ID is not configured"
        )

    if not settings.RAZORPAY_KEY_SECRET:
        raise ValueError(
            "RAZORPAY_KEY_SECRET is not configured"
        )

    return razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET
        )
    )


def create_razorpay_order(order):

    client = get_razorpay_client()

    # Razorpay expects amount in paise.
    amount_paise = int(
        order.total_amount * 100
    )

    razorpay_order = client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"order_{order.id}",
    })

    order.razorpay_order_id = razorpay_order["id"]
    order.save(
        update_fields=[
            "razorpay_order_id",
            "updated_at"
        ]
    )

    Payment.objects.get_or_create(
        order=order
    )

    return razorpay_order


@transaction.atomic
def verify_payment(
    order,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature
):

    if order.razorpay_order_id != razorpay_order_id:

        raise ValueError(
            "Razorpay order ID does not match"
        )

    client = get_razorpay_client()

    client.utility.verify_payment_signature({
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": razorpay_signature,
    })

    payment = Payment.objects.get(
        order=order
    )

    payment.razorpay_payment_id = (
        razorpay_payment_id
    )

    payment.razorpay_signature = (
        razorpay_signature
    )

    payment.status = "success"

    payment.save()

    order.status = "paid"

    order.save(
        update_fields=[
            "status",
            "updated_at"
        ]
    )

    return payment