import logging
logger = logging.getLogger(__name__)
from decimal import Decimal
import random
import secrets
from datetime import timedelta

import razorpay

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import generics, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from rest_framework_simplejwt.views import TokenObtainPairView

from base.models import (
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    Wishlist,
    Address,
    EmailOTP,
    PasswordResetOTP,
)

from base.serializers import (
    RegisterSerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer,
    PaymentVerifySerializer,
    OrderSerializer,
    AdminOrderSerializer,
    WishlistSerializer,
    AddressSerializer,
    CategorySerializer,
)

from base.serializers.password_reset_serializer import (
    ForgotPasswordSerializer,
    PasswordResetOTPVerifySerializer,
    ResetPasswordSerializer,
)

from base.services.otp_service import (
    generate_otp,
    send_password_reset_otp_email,
)

from base.serializers.otp_serializer import (
    OTPVerifySerializer,
    ResendOTPSerializer,
)

from base.permissions import IsStaffUser

from base.pagination import ProductPagination

from base.throttling import (
    ProductUserThrottle,
    CartUserThrottle,
)

from base.response import api_response


# ============================================================
# REGISTER
# ============================================================

class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        # ----------------------------------------------------
        # Generate OTP
        # ----------------------------------------------------

        otp = str(
            random.randint(
                100000,
                999999
            )
        )

        expires_at = (
            timezone.now()
            + timedelta(minutes=10)
        )

        EmailOTP.objects.update_or_create(
            user=user,
            defaults={
                "otp": otp,
                "expires_at": expires_at,
                "is_verified": False,
                "attempts": 0,
            }
        )

        # ----------------------------------------------------
        # Send OTP
        # ----------------------------------------------------

        subject = "Verify your email - OTP"

        message = f"""
Hello {user.username},

Thank you for registering with our E-Commerce application.

Your email verification OTP is:

{otp}

This OTP is valid for 10 minutes.

Please do not share this OTP with anyone.

Regards,
E-Commerce Team
"""

        try:

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[
                    user.email
                ],
                fail_silently=False,
            )

        except Exception:

            EmailOTP.objects.filter(
                user=user
            ).delete()

            user.delete()

            return api_response(
                message="Unable to send OTP email",
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return api_response(

            data={
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "otp_expires_in": "10 minutes",
            },

            message=(
                "Registration successful. "
                "OTP has been sent to your email."
            ),

            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# VERIFY EMAIL OTP
# ============================================================

class VerifyOTPView(
    generics.CreateAPIView
):

    serializer_class = OTPVerifySerializer

    permission_classes = [
        AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        email_otp = serializer.validated_data[
            "email_otp"
        ]

        user.is_active = True

        user.save(
            update_fields=[
                "is_active"
            ]
        )

        email_otp.is_verified = True

        email_otp.save(
            update_fields=[
                "is_verified"
            ]
        )

        return api_response(

            data={
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "email_verified": True,
            },

            message="Email verified successfully. You can now login.",

            status_code=status.HTTP_200_OK,
        )


# ============================================================
# RESEND EMAIL OTP
# ============================================================

class ResendOTPView(
    generics.CreateAPIView
):

    serializer_class = ResendOTPSerializer

    permission_classes = [
        AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        otp = generate_otp()

        expires_at = (
            timezone.now()
            + timedelta(minutes=10)
        )

        EmailOTP.objects.update_or_create(
            user=user,
            defaults={
                "otp": otp,
                "expires_at": expires_at,
                "is_verified": False,
                "attempts": 0,
            }
        )

        subject = "Verify your email - OTP"

        message = f"""Hello {user.username},

Thank you for registering with our E-Commerce application.

Your email verification OTP is:

{otp}

This OTP is valid for 10 minutes.

Please do not share this OTP with anyone.

Regards,
E-Commerce Team
"""

        try:

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[
                    user.email
                ],
                fail_silently=False,
            )

        except Exception:

            return api_response(
                message="Unable to send OTP email",
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return api_response(
            data={
                "email": user.email,
                "otp_expires_in": "10 minutes",
            },
            message="A new OTP has been sent to your email.",
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# LOGIN
# ============================================================

class LoginView(
    TokenObtainPairView
):

    permission_classes = [
        AllowAny
    ]


# ============================================================
# CURRENT USER
# ============================================================

class CurrentUserView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request,
        *args,
        **kwargs
    ):

        user = request.user

        return api_response(
            data={
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            },
            message="User profile fetched successfully",
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# FORGOT PASSWORD
# ============================================================

class ForgotPasswordView(
    generics.CreateAPIView
):

    serializer_class = ForgotPasswordSerializer

    permission_classes = [
        AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        user = User.objects.get(
            email=email
        )

        otp = generate_otp()

        expires_at = (
            timezone.now()
            + timedelta(minutes=10)
        )

        PasswordResetOTP.objects.update_or_create(
            user=user,
            defaults={
                "otp": otp,
                "expires_at": expires_at,
                "attempts": 0,
                "is_verified": False,
                "reset_token": None,
                "reset_token_expires_at": None,
            }
        )

        email_sent = (
            send_password_reset_otp_email(
                email=user.email,
                username=user.username,
                otp=otp,
            )
        )

        if not email_sent:

            PasswordResetOTP.objects.filter(
                user=user
            ).delete()

            return api_response(
                message=(
                    "Unable to send password reset email."
                ),
                success=False,
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
            )

        return api_response(
            data={
                "email": user.email,
                "otp_expires_in": "10 minutes",
            },
            message=(
                "Password reset OTP has been "
                "sent to your email."
            ),
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# VERIFY PASSWORD RESET OTP
# ============================================================

class VerifyPasswordResetOTPView(
    generics.CreateAPIView
):

    serializer_class = (
        PasswordResetOTPVerifySerializer
    )

    permission_classes = [
        AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        reset_otp = serializer.validated_data[
            "reset_otp"
        ]

        reset_token = secrets.token_urlsafe(
            48
        )

        reset_token_expires_at = (
            timezone.now()
            + timedelta(minutes=10)
        )

        reset_otp.is_verified = True

        reset_otp.reset_token = (
            reset_token
        )

        reset_otp.reset_token_expires_at = (
            reset_token_expires_at
        )

        reset_otp.save(
            update_fields=[
                "is_verified",
                "reset_token",
                "reset_token_expires_at",
            ]
        )

        return api_response(
            data={
                "email": user.email,
                "reset_token": reset_token,
                "reset_token_expires_in": "10 minutes",
            },
            message=(
                "OTP verified successfully. "
                "You can now reset your password."
            ),
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# RESET PASSWORD
# ============================================================

class ResetPasswordView(
    generics.CreateAPIView
):

    serializer_class = ResetPasswordSerializer

    permission_classes = [
        AllowAny
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        reset_token = serializer.validated_data[
            "reset_token"
        ]

        new_password = serializer.validated_data[
            "password"
        ]

        try:

            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return api_response(
                message=(
                    "Invalid password reset request."
                ),
                success=False,
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        try:

            reset_otp = (
                PasswordResetOTP.objects.get(
                    user=user
                )
            )

        except PasswordResetOTP.DoesNotExist:

            return api_response(
                message=(
                    "Password reset session "
                    "was not found."
                ),
                success=False,
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        if not reset_otp.is_verified:

            return api_response(
                message=(
                    "Please verify the OTP first."
                ),
                success=False,
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        if (
            not reset_otp.reset_token
            or reset_otp.reset_token
            != reset_token
        ):

            return api_response(
                message="Invalid reset token.",
                success=False,
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        if (
            not reset_otp.reset_token_expires_at
            or timezone.now()
            > reset_otp.reset_token_expires_at
        ):

            return api_response(
                message=(
                    "Password reset session has expired. "
                    "Please request a new OTP."
                ),
                success=False,
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
            )

        user.set_password(
            new_password
        )

        user.save(
            update_fields=[
                "password"
            ]
        )

        reset_otp.delete()

        return api_response(
            data={
                "email": user.email,
                "password_reset": True,
            },
            message=(
                "Password reset successfully. "
                "You can now login with your new password."
            ),
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# CATEGORY LIST + CREATE
# ============================================================

class CategoryListCreateView(
    generics.ListCreateAPIView
):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated
    ]

    filter_backends = [
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "name"
    ]

    def get_permissions(self):

        if self.request.method == "GET":

            return [
                AllowAny()
            ]

        return [
            IsAuthenticated(),
            IsStaffUser(),
        ]

    def get_queryset(self):

        queryset = Category.objects.all()

        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
        ):

            queryset = queryset.filter(
                is_active=True
            )

        return queryset

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Categories fetched successfully",
        )

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        category = serializer.save()

        return api_response(
            data=self.get_serializer(
                category
            ).data,
            message="Category created successfully",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# CATEGORY DETAIL
# ============================================================

class CategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Category.objects.all()

    serializer_class = CategorySerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_permissions(self):

        if self.request.method == "GET":

            return [
                AllowAny()
            ]

        return [
            IsAuthenticated(),
            IsStaffUser(),
        ]

    def get_queryset(self):

        queryset = Category.objects.all()

        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
        ):

            queryset = queryset.filter(
                is_active=True
            )

        return queryset

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        category = self.get_object()

        serializer = self.get_serializer(
            category
        )

        return api_response(
            data=serializer.data,
            message="Category fetched successfully",
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        category = self.get_object()

        serializer = self.get_serializer(
            category,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return api_response(
            data=serializer.data,
            message="Category updated successfully",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        category = self.get_object()

        category.delete()

        return api_response(
            message="Category deleted successfully",
        )



# ============================================================
# PRODUCT LIST + CREATE
# ============================================================

class ProductListCreateView(
    generics.ListCreateAPIView
):

    queryset = Product.objects.select_related(
        "category"
    ).all()

    serializer_class = ProductSerializer

    pagination_class = ProductPagination

    throttle_classes = [
        ProductUserThrottle
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "stock",
        "category",
        "is_active",
    ]

    search_fields = [
        "name",
        "description",
        "category__name",
    ]

    ordering_fields = [
        "price",
        "name",
        "created_at",
        "stock",
    ]

    ordering = [
        "-created_at"
    ]

    # --------------------------------------------------------
    # PUBLIC PRODUCT LIST
    # STAFF ONLY CREATE
    # --------------------------------------------------------

    def get_permissions(self):

        if self.request.method == "GET":

            return [
                AllowAny()
            ]

        return [
            IsAuthenticated(),
            IsStaffUser(),
        ]

    def get_queryset(self):

        queryset = (
            Product.objects
            .select_related("category")
            .all()
        )

        # ----------------------------------------------------
        # Public visitors and normal customers see only
        # active products.
        #
        # Staff / superuser can see all products.
        # ----------------------------------------------------

        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
        ):

            queryset = queryset.filter(
                is_active=True
            )

        return queryset

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        page = self.paginate_queryset(
            queryset
        )

        if page is not None:

            serializer = self.get_serializer(
                page,
                many=True
            )

            return self.get_paginated_response(
                serializer.data
            )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Products fetched successfully",
        )

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = serializer.save()

        return api_response(
            data=self.get_serializer(
                product
            ).data,
            message="Product created successfully",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# PRODUCT DETAIL
# ============================================================

class ProductDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    queryset = Product.objects.select_related(
        "category"
    ).all()

    serializer_class = ProductSerializer

    throttle_classes = [
        ProductUserThrottle
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    # --------------------------------------------------------
    # PUBLIC PRODUCT DETAIL
    # STAFF ONLY UPDATE / DELETE
    # --------------------------------------------------------

    def get_permissions(self):

        if self.request.method == "GET":

            return [
                AllowAny()
            ]

        return [
            IsAuthenticated(),
            IsStaffUser(),
        ]

    def get_queryset(self):

        queryset = (
            Product.objects
            .select_related("category")
            .all()
        )

        if not (
            self.request.user.is_staff
            or self.request.user.is_superuser
        ):

            queryset = queryset.filter(
                is_active=True
            )

        return queryset

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        product = self.get_object()

        serializer = self.get_serializer(
            product
        )

        return api_response(
            data=serializer.data,
            message="Product fetched successfully",
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        product = self.get_object()

        serializer = self.get_serializer(
            product,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = serializer.save()

        return api_response(
            data=self.get_serializer(
                product
            ).data,
            message="Product updated successfully",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        product = self.get_object()

        product.delete()

        return api_response(
            message="Product deleted successfully",
        )


# ============================================================
# CURRENT USER CART
# ============================================================

class CartView(
    generics.RetrieveAPIView
):

    serializer_class = CartSerializer

    permission_classes = [
        IsAuthenticated
    ]

    throttle_classes = [
        CartUserThrottle
    ]

    def get_object(self):

        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )

        return cart

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        cart = self.get_object()

        serializer = self.get_serializer(
            cart
        )

        return api_response(
            data=serializer.data,
            message="Cart fetched successfully",
        )


# ============================================================
# ADD PRODUCT TO CART
# ============================================================

class CartItemCreateView(
    generics.CreateAPIView
):

    serializer_class = CartItemSerializer

    permission_classes = [
        IsAuthenticated
    ]

    throttle_classes = [
        CartUserThrottle
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        product_id = request.data.get(
            "product"
        )

        quantity = request.data.get(
            "quantity",
            1
        )

        if not product_id:

            return api_response(
                message="Product is required",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            quantity = int(quantity)

        except (
            TypeError,
            ValueError
        ):

            return api_response(
                message="Quantity must be a valid number",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:

            return api_response(
                message="Quantity must be greater than 0",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            product = Product.objects.get(
                id=product_id,
                is_active=True,
            )

        except Product.DoesNotExist:

            return api_response(
                message="Product not found",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if product.stock < quantity:

            return api_response(
                data={
                    "available_stock": product.stock
                },
                message="Insufficient stock",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_item, created = (
            CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    "quantity": quantity
                }
            )
        )

        if not created:

            new_quantity = (
                cart_item.quantity
                + quantity
            )

            if new_quantity > product.stock:

                return api_response(
                    message=(
                        "Requested quantity "
                        "exceeds available stock"
                    ),
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            cart_item.quantity = new_quantity

            cart_item.save()

        serializer = self.get_serializer(
            cart_item
        )

        return api_response(
            data=serializer.data,
            message="Product added to cart",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# CART ITEM DETAIL
# ============================================================

class CartItemDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = CartItemSerializer

    permission_classes = [
        IsAuthenticated
    ]

    throttle_classes = [
        CartUserThrottle
    ]

    def get_queryset(self):

        return (
            CartItem.objects
            .filter(
                cart__user=self.request.user
            )
            .select_related("product")
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        item = self.get_object()

        serializer = self.get_serializer(
            item
        )

        return api_response(
            data=serializer.data,
            message="Cart item fetched successfully",
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        item = self.get_object()

        quantity = request.data.get(
            "quantity"
        )

        if quantity is None:

            return api_response(
                message="Quantity is required",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            quantity = int(quantity)

        except (
            TypeError,
            ValueError
        ):

            return api_response(
                message="Quantity must be a valid number",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:

            return api_response(
                message="Quantity must be greater than 0",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > item.product.stock:

            return api_response(
                data={
                    "available_stock": item.product.stock
                },
                message="Insufficient stock",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        item.quantity = quantity

        item.save(
            update_fields=[
                "quantity",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(
            item
        )

        return api_response(
            data=serializer.data,
            message="Cart item updated successfully",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        item = self.get_object()

        item.delete()

        return api_response(
            message="Product removed from cart"
        )


# ============================================================
# BUY NOW
# ============================================================

class BuyNowView(
    generics.CreateAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    throttle_classes = [
        CartUserThrottle
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        product_id = request.data.get(
            "product_id"
        )

        quantity = request.data.get(
            "quantity",
            1
        )

        address_id = request.data.get(
            "address_id"
        )

        if not product_id:

            return api_response(
                message="product_id is required",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if not address_id:

            return api_response(
                message="address_id is required",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            quantity = int(quantity)

        except (
            TypeError,
            ValueError
        ):

            return api_response(
                message="Quantity must be a valid number",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:

            return api_response(
                message="Quantity must be greater than 0",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            product = Product.objects.get(
                id=product_id,
                is_active=True,
            )

        except Product.DoesNotExist:

            return api_response(
                message="Product not found",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        try:

            address = Address.objects.get(
                id=address_id,
                user=request.user,
            )

        except Address.DoesNotExist:

            return api_response(
                message="Address not found",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if product.stock < quantity:

            return api_response(
                data={
                    "available_stock": product.stock
                },
                message="Insufficient stock",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = (
            product.price
            * quantity
        )

        amount_in_paise = int(
            total_amount
            * Decimal("100")
        )

        if not settings.RAZORPAY_KEY_ID:

            return api_response(
                message="Razorpay key ID is not configured",
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not settings.RAZORPAY_KEY_SECRET:

            return api_response(
                message="Razorpay secret is not configured",
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:

            razorpay_order = client.order.create(
                data={
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "receipt": (
                        f"buy_now_"
                        f"{request.user.id}_"
                        f"{product.id}_"
                        f"{timezone.now().timestamp()}"
                    ),
                }
            )

        except Exception:

            return api_response(
                message="Unable to create Razorpay order",
                success=False,
                status_code=status.HTTP_502_BAD_GATEWAY,
            )

        with transaction.atomic():

            order = Order.objects.create(

                user=request.user,

                delivery_full_name=address.full_name,

                delivery_phone=address.phone,

                delivery_address_line=address.address_line,

                delivery_city=address.city,

                delivery_state=address.state,

                delivery_postal_code=address.postal_code,

                delivery_country=address.country,

                total_amount=total_amount,

                status="created",

                razorpay_order_id=(
                    razorpay_order["id"]
                ),
            )

            OrderItem.objects.create(

                order=order,

                product=product,

                quantity=quantity,

                price=product.price,
            )

            Payment.objects.create(

                order=order,

                status="created",
            )

        return api_response(
            data={
                "order_id": order.id,
                "razorpay_order_id": razorpay_order["id"],
                "amount": amount_in_paise,
                "amount_rupees": str(total_amount),
                "currency": "INR",
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "order": {
                    "id": order.id,
                    "product_id": product.id,
                    "product_name": product.name,
                    "quantity": quantity,
                    "price": str(product.price),
                    "total_amount": str(
                        total_amount
                    ),
                    "status": order.status,
                },

                "razorpay": {
                    "key_id": (
                        settings.RAZORPAY_KEY_ID
                    ),
                    "order_id": (
                        razorpay_order["id"]
                    ),
                    "amount": amount_in_paise,
                    "currency": "INR",
                },
            },
            message="Buy Now order created successfully",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# CREATE RAZORPAY ORDER FROM CART
# ============================================================

class CreatePaymentOrderView(
    generics.CreateAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    throttle_classes = [
        CartUserThrottle
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        address_id = request.data.get(
            "address_id"
        )

        if not address_id:

            return api_response(
                message="address_id is required",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            address = Address.objects.get(
                id=address_id,
                user=request.user,
            )

        except Address.DoesNotExist:

            return api_response(
                message="Address not found",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        cart_items = (
            cart.items
            .select_related("product")
            .all()
        )

        if not cart_items.exists():

            return api_response(
                message="Cart is empty",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = Decimal(
            "0.00"
        )

        for item in cart_items:

            if item.quantity <= 0:

                return api_response(
                    message="Invalid cart quantity",
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            if not item.product.is_active:

                return api_response(
                    message=(
                        f"{item.product.name} "
                        "is no longer available"
                    ),
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            if item.quantity > item.product.stock:

                return api_response(
                    message=(
                        f"Insufficient stock for "
                        f"{item.product.name}"
                    ),
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            total_amount += (
                item.product.price
                * item.quantity
            )

        amount_in_paise = int(
            total_amount
            * Decimal("100")
        )

        if not settings.RAZORPAY_KEY_ID:

            return api_response(
                message="Razorpay key ID is not configured",
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not settings.RAZORPAY_KEY_SECRET:

            return api_response(
                message="Razorpay secret is not configured",
                success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        receipt_str = f"rcpt_{cart.id}_{int(timezone.now().timestamp())}"

        try:
            razorpay_order = client.order.create(
                data={
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "receipt": receipt_str,
                }
            )
        except razorpay.errors.RazorpayError as rzp_err:
            logger.error(
                "Razorpay API Error during order creation for user_id=%s, amount=%s: %s",
                request.user.id,
                amount_in_paise,
                str(rzp_err),
            )
            return api_response(
                message=f"Razorpay error: {str(rzp_err)}",
                success=False,
                status_code=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as err:
            logger.error(
                "Unexpected error during Razorpay order creation for user_id=%s, amount=%s: %s",
                request.user.id,
                amount_in_paise,
                str(err),
            )
            return api_response(
                message="Unable to create Razorpay order",
                success=False,
                status_code=status.HTTP_502_BAD_GATEWAY,
            )

        with transaction.atomic():

            order = Order.objects.create(

                user=request.user,

                delivery_full_name=address.full_name,

                delivery_phone=address.phone,

                delivery_address_line=address.address_line,

                delivery_city=address.city,

                delivery_state=address.state,

                delivery_postal_code=address.postal_code,

                delivery_country=address.country,

                total_amount=total_amount,

                status="created",

                razorpay_order_id=(
                    razorpay_order["id"]
                ),
            )

            for item in cart_items:

                OrderItem.objects.create(

                    order=order,

                    product=item.product,

                    quantity=item.quantity,

                    price=item.product.price,
                )

            Payment.objects.create(

                order=order,

                status="created",
            )

        return api_response(
            data={
                "order_id": order.id,

                "razorpay_order_id": (
                    razorpay_order["id"]
                ),

                "amount": amount_in_paise,

                "amount_rupees": str(
                    total_amount
                ),

                "currency": "INR",

                "razorpay_key_id": (
                    settings.RAZORPAY_KEY_ID
                ),
            },
            message="Payment order created successfully",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# VERIFY PAYMENT
# ============================================================

class VerifyPaymentView(
    generics.CreateAPIView
):

    serializer_class = PaymentVerifySerializer

    permission_classes = [
        IsAuthenticated
    ]

    throttle_classes = [
        CartUserThrottle
    ]

    @transaction.atomic
    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        razorpay_order_id = (
            serializer.validated_data[
                "razorpay_order_id"
            ]
        )

        razorpay_payment_id = (
            serializer.validated_data[
                "razorpay_payment_id"
            ]
        )

        razorpay_signature = (
            serializer.validated_data[
                "razorpay_signature"
            ]
        )

        try:

            order = (
                Order.objects
                .select_for_update()
                .prefetch_related(
                    "items__product"
                )
                .get(
                    razorpay_order_id=razorpay_order_id,
                    user=request.user,
                )
            )

        except Order.DoesNotExist:

            return api_response(
                message="Order not found",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if order.status == "paid":

            return api_response(
                data=OrderSerializer(
                    order
                ).data,
                message="Order already paid",
            )

        if order.status in [
            "cancelled",
            "failed",
        ]:

            return api_response(
                message=(
                    f"Order cannot be paid because "
                    f"its status is '{order.status}'"
                ),
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:

            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": (
                        razorpay_order_id
                    ),
                    "razorpay_payment_id": (
                        razorpay_payment_id
                    ),
                    "razorpay_signature": (
                        razorpay_signature
                    ),
                }
            )

        except Exception:

            order.status = "failed"

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            payment = order.payment

            payment.status = "failed"

            payment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            return api_response(
                message="Payment verification failed",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        order_items = (
            order.items
            .select_related("product")
            .all()
        )

        locked_products = []

        for item in order_items:

            if item.product is None:

                return api_response(
                    message="Product no longer exists",
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            product = (
                Product.objects
                .select_for_update()
                .get(
                    id=item.product.id
                )
            )

            if not product.is_active:

                return api_response(
                    message=(
                        f"{product.name} "
                        "is no longer available"
                    ),
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            if product.stock < item.quantity:

                return api_response(
                    data={
                        "product": product.name,
                        "available_stock": product.stock,
                        "required_stock": item.quantity,
                    },
                    message=(
                        f"Insufficient stock for "
                        f"{product.name}"
                    ),
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            locked_products.append(
                (
                    product,
                    item.quantity
                )
            )

        for product, quantity in locked_products:

            product.stock -= quantity

            product.save(
                update_fields=[
                    "stock",
                    "updated_at",
                ]
            )

        order.status = "paid"

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        payment = order.payment

        payment.razorpay_payment_id = (
            razorpay_payment_id
        )

        payment.razorpay_signature = (
            razorpay_signature
        )

        payment.status = "success"

        payment.save()

        order_product_ids = [
            item.product_id
            for item in order_items
            if item.product_id is not None
        ]

        CartItem.objects.filter(
            cart__user=request.user,
            product_id__in=order_product_ids,
        ).delete()

        return api_response(
            data=OrderSerializer(
                order
            ).data,
            message="Payment verified successfully",
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# USER ORDERS
# ============================================================

class OrderListView(
    generics.ListAPIView
):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "items__product",
                "payment",
            )
            .order_by(
                "-created_at"
            )
        )

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Orders fetched successfully",
        )


# ============================================================
# ORDER DETAIL
# ============================================================

class OrderDetailView(
    generics.RetrieveAPIView
):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "items__product",
                "payment",
            )
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        order = self.get_object()

        serializer = self.get_serializer(
            order
        )

        return api_response(
            data=serializer.data,
            message="Order fetched successfully",
        )


# ============================================================
# MY ORDERS
# ============================================================

class MyOrdersView(
    generics.ListAPIView
):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "items__product",
                "payment",
            )
            .order_by(
                "-created_at"
            )
        )

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Orders fetched successfully",
        )


# ============================================================
# ADD PRODUCT TO WISHLIST
# ============================================================

class WishlistAddView(
    generics.CreateAPIView
):

    serializer_class = WishlistSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        product_id = request.data.get(
            "product"
        )

        if not product_id:

            return api_response(
                message="Product is required",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        try:

            product = Product.objects.get(
                id=product_id,
                is_active=True,
            )

        except Product.DoesNotExist:

            return api_response(
                message="Product not found",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        if Wishlist.objects.filter(
            user=request.user,
            product=product,
        ).exists():

            return api_response(
                message="Product already exists in wishlist",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        wishlist = Wishlist.objects.create(
            user=request.user,
            product=product,
        )

        serializer = self.get_serializer(
            wishlist
        )

        return api_response(
            data=serializer.data,
            message="Product added to wishlist successfully",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# GET MY WISHLIST
# ============================================================

class WishlistListView(
    generics.ListAPIView
):

    serializer_class = WishlistSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Wishlist.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "product"
            )
            .order_by(
                "-created_at"
            )
        )

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Wishlist fetched successfully",
        )


# ============================================================
# REMOVE PRODUCT FROM WISHLIST
# ============================================================

class WishlistRemoveView(
    generics.DestroyAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Wishlist.objects.filter(
            user=self.request.user
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        product_id = kwargs.get(
            "product_id"
        )

        try:

            wishlist_item = (
                self.get_queryset()
                .get(
                    product_id=product_id
                )
            )

        except Wishlist.DoesNotExist:

            return api_response(
                message="Product is not in your wishlist",
                success=False,
                status_code=status.HTTP_404_NOT_FOUND,
            )

        wishlist_item.delete()

        return api_response(
            message="Product removed from wishlist successfully"
        )


# ============================================================
# CANCEL ORDER
# ============================================================

class CancelOrderView(
    generics.UpdateAPIView
):

    serializer_class = OrderSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Order.objects
            .filter(
                user=self.request.user
            )
            .prefetch_related(
                "items",
                "payment",
            )
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        order = self.get_object()

        if order.status == "cancelled":

            return api_response(
                message="Order is already cancelled",
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == "paid":

            return api_response(
                message=(
                    "Paid order cannot be cancelled directly. "
                    "Refund process is required."
                ),
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        if order.status != "created":

            return api_response(
                message=(
                    f"Order cannot be cancelled because "
                    f"its current status is '{order.status}'."
                ),
                success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        order.status = "cancelled"

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        try:

            payment = order.payment

            if payment.status == "created":

                payment.status = "failed"

                payment.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

        except Payment.DoesNotExist:
            pass

        return api_response(
            data=OrderSerializer(
                order
            ).data,
            message="Order cancelled successfully",
        )


# ============================================================
# ADMIN ORDERS - LIST
# ============================================================

class AdminOrderListView(
    generics.ListAPIView
):
    serializer_class = AdminOrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsStaffUser,
    ]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = [
        "id",
        "user__username",
        "user__email",
        "delivery_full_name",
        "delivery_phone",
        "delivery_city",
        "razorpay_order_id",
    ]

    ordering_fields = [
        "created_at",
        "total_amount",
        "status",
        "id",
    ]

    ordering = [
        "-created_at"
    ]

    def get_queryset(self):
        queryset = (
            Order.objects
            .select_related("user", "payment")
            .prefetch_related("items__product")
            .all()
        )

        status_param = self.request.query_params.get("status")
        if status_param and status_param.strip():
            queryset = queryset.filter(status=status_param.strip().lower())

        payment_status = self.request.query_params.get("payment_status")
        if payment_status and payment_status.strip():
            queryset = queryset.filter(payment__status=payment_status.strip().lower())

        return queryset

    def list(
        self,
        request,
        *args,
        **kwargs
    ):
        queryset = self.filter_queryset(
            self.get_queryset()
        )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Admin orders fetched successfully",
        )


# ============================================================
# ADMIN ORDER - DETAIL & STATUS UPDATE
# ============================================================

class AdminOrderDetailView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = AdminOrderSerializer

    permission_classes = [
        IsAuthenticated,
        IsStaffUser,
    ]

    def get_queryset(self):
        return (
            Order.objects
            .select_related("user", "payment")
            .prefetch_related("items__product")
            .all()
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):
        order = self.get_object()

        serializer = self.get_serializer(
            order
        )

        return api_response(
            data=serializer.data,
            message="Admin order details fetched successfully",
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):
        order = self.get_object()

        new_status = request.data.get("status")
        if new_status:
            valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return api_response(
                    message=f"Invalid status '{new_status}'. Allowed choices: {', '.join(valid_statuses)}",
                    success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            order.status = new_status
            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        serializer = self.get_serializer(
            order
        )

        return api_response(
            data=serializer.data,
            message="Order updated successfully",
            status_code=status.HTTP_200_OK,
        )


# ============================================================
# ADDRESS LIST + CREATE
# ============================================================

class AddressListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = AddressSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Address.objects
            .filter(
                user=self.request.user
            )
            .order_by(
                "-is_default",
                "-created_at",
            )
        )

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = self.get_queryset()

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return api_response(
            data=serializer.data,
            message="Addresses fetched successfully",
        )

    def create(
        self,
        request,
        *args,
        **kwargs
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        is_default = serializer.validated_data.get(
            "is_default",
            False
        )

        address = serializer.save(
            user=request.user
        )

        if is_default:

            Address.objects.filter(
                user=request.user
            ).exclude(
                id=address.id
            ).update(
                is_default=False
            )

        if not Address.objects.filter(
            user=request.user,
            is_default=True
        ).exists():

            address.is_default = True

            address.save(
                update_fields=[
                    "is_default",
                    "updated_at",
                ]
            )

        return api_response(
            data=self.get_serializer(
                address
            ).data,
            message="Address added successfully",
            status_code=status.HTTP_201_CREATED,
        )


# ============================================================
# ADDRESS DETAIL
# ============================================================

class AddressDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AddressSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Address.objects.filter(
            user=self.request.user
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        address = self.get_object()

        serializer = self.get_serializer(
            address
        )

        return api_response(
            data=serializer.data,
            message="Address fetched successfully",
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        partial = kwargs.pop(
            "partial",
            False
        )

        address = self.get_object()

        serializer = self.get_serializer(
            address,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        updated_address = serializer.save()

        if updated_address.is_default:

            Address.objects.filter(
                user=request.user
            ).exclude(
                id=updated_address.id
            ).update(
                is_default=False
            )
        elif not Address.objects.filter(
            user=request.user,
            is_default=True
        ).exists():

            updated_address.is_default = True

            updated_address.save(
                update_fields=[
                    "is_default",
                    "updated_at",
                ]
            )

        return api_response(
            data=self.get_serializer(
                updated_address
            ).data,
            message="Address updated successfully",
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        address = self.get_object()

        was_default = address.is_default

        address.delete()

        if was_default:

            next_address = (
                Address.objects
                .filter(
                    user=request.user
                )
                .order_by(
                    "-created_at"
                )
                .first()
            )

            if next_address:

                next_address.is_default = True

                next_address.save(
                    update_fields=[
                        "is_default",
                        "updated_at",
                    ]
                )

        return api_response(
            message="Address deleted successfully",
        )


# ============================================================
# SET DEFAULT ADDRESS
# ============================================================

class SetDefaultAddressView(
    generics.UpdateAPIView
):

    serializer_class = AddressSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Address.objects.filter(
            user=self.request.user
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        address = self.get_object()

        Address.objects.filter(
            user=request.user
        ).update(
            is_default=False
        )

        address.is_default = True

        address.save(
            update_fields=[
                "is_default",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(
            address
        )

        return api_response(
            data=serializer.data,
            message="Default address updated successfully",
        )