from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from base.views import (
    # ========================================================
    # AUTH
    # ========================================================

    RegisterView,
    LoginView,
    VerifyOTPView,
    ResendOTPView,
    CurrentUserView,

    # ========================================================
    # FORGOT PASSWORD
    # ========================================================

    ForgotPasswordView,
    VerifyPasswordResetOTPView,
    ResetPasswordView,

    # ========================================================
    # CATEGORIES
    # ========================================================

    CategoryListCreateView,
    CategoryDetailView,

    # ========================================================
    # PRODUCTS
    # ========================================================

    ProductListCreateView,
    ProductDetailView,

    # ========================================================
    # CART
    # ========================================================

    CartView,
    CartItemCreateView,
    CartItemDetailView,

    # ========================================================
    # ORDERS / PAYMENT
    # ========================================================

    CreatePaymentOrderView,
    BuyNowView,
    VerifyPaymentView,
    MyOrdersView,
    OrderDetailView,
    CancelOrderView,

    # ========================================================
    # WISHLIST
    # ========================================================

    WishlistAddView,
    WishlistListView,
    WishlistRemoveView,

    # ========================================================
    # ADDRESS
    # ========================================================

    AddressListCreateView,
    AddressDetailView,
    SetDefaultAddressView,
)


urlpatterns = [

    # ========================================================
    # AUTHENTICATION
    # ========================================================

    # --------------------------------------------------------
    # POST -> Register user
    # --------------------------------------------------------

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    # --------------------------------------------------------
    # POST -> Verify registration email OTP
    # --------------------------------------------------------

    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify-otp",
    ),

    # --------------------------------------------------------
    # POST -> Resend registration email OTP
    # --------------------------------------------------------

    path(
        "auth/resend-otp/",
        ResendOTPView.as_view(),
        name="resend-otp",
    ),

    # --------------------------------------------------------
    # POST -> Login
    # --------------------------------------------------------

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    # --------------------------------------------------------
    # GET -> Get current user profile
    # --------------------------------------------------------

    path(
        "auth/me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),

    # --------------------------------------------------------
    # POST -> Refresh JWT access token
    # --------------------------------------------------------

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),


    # ========================================================
    # FORGOT PASSWORD
    # ========================================================

    # --------------------------------------------------------
    # POST -> Send password reset OTP
    #
    # Request:
    # {
    #     "email": "user@gmail.com"
    # }
    # --------------------------------------------------------

    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot-password",
    ),

    # --------------------------------------------------------
    # POST -> Verify password reset OTP
    #
    # Request:
    # {
    #     "email": "user@gmail.com",
    #     "otp": "123456"
    # }
    # --------------------------------------------------------

    path(
        "forgot-password/verify-otp/",
        VerifyPasswordResetOTPView.as_view(),
        name="forgot-password-verify-otp",
    ),

    # --------------------------------------------------------
    # POST -> Reset password
    #
    # Request:
    # {
    #     "email": "user@gmail.com",
    #     "reset_token": "TOKEN",
    #     "password": "NewPassword123",
    #     "confirm_password": "NewPassword123"
    # }
    # --------------------------------------------------------

    path(
        "forgot-password/reset/",
        ResetPasswordView.as_view(),
        name="forgot-password-reset",
    ),


    # ========================================================
    # CATEGORIES
    # ========================================================

    # --------------------------------------------------------
    # GET  -> List active categories (public)
    # POST -> Create category (staff only)
    # --------------------------------------------------------

    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    # --------------------------------------------------------
    # GET    -> Category details (public)
    # PUT    -> Update category (staff only)
    # PATCH  -> Partial update (staff only)
    # DELETE -> Deactivate category (staff only)
    # --------------------------------------------------------

    path(
        "categories/<int:pk>/",
        CategoryDetailView.as_view(),
        name="category-detail",
    ),


    # ========================================================
    # PRODUCTS
    # ========================================================

    # --------------------------------------------------------
    # GET  -> List products
    # POST -> Create product (staff only)
    # --------------------------------------------------------

    path(
        "products/",
        ProductListCreateView.as_view(),
        name="products",
    ),

    # --------------------------------------------------------
    # GET    -> Product details
    # PUT    -> Update product (staff only)
    # PATCH  -> Partial update
    # DELETE -> Delete product (staff only)
    # --------------------------------------------------------

    path(
        "products/<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),


    # ========================================================
    # CART
    # ========================================================

    # --------------------------------------------------------
    # GET -> Current user's cart
    # --------------------------------------------------------

    path(
        "cart/",
        CartView.as_view(),
        name="cart",
    ),

    # --------------------------------------------------------
    # POST -> Add product to cart
    # --------------------------------------------------------

    path(
        "cart/items/",
        CartItemCreateView.as_view(),
        name="cart-item-create",
    ),

    # --------------------------------------------------------
    # GET    -> Get cart item
    # PUT    -> Update cart item
    # PATCH  -> Update quantity
    # DELETE -> Remove cart item
    # --------------------------------------------------------

    path(
        "cart/items/<int:pk>/",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),


    # ========================================================
    # ORDERS
    # ========================================================

    # --------------------------------------------------------
    # POST -> Create Razorpay order from cart
    # --------------------------------------------------------

    path(
        "orders/create/",
        CreatePaymentOrderView.as_view(),
        name="create-order",
    ),

    # --------------------------------------------------------
    # POST -> Create Razorpay order directly for a single product (Buy Now)
    # --------------------------------------------------------

    path(
        "buy-now/",
        BuyNowView.as_view(),
        name="buy-now",
    ),

    # --------------------------------------------------------
    # GET -> Current user's orders
    # --------------------------------------------------------

    path(
        "orders/",
        MyOrdersView.as_view(),
        name="my-orders",
    ),

    # --------------------------------------------------------
    # GET -> Order detail (current user only)
    # --------------------------------------------------------

    path(
        "orders/<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    # --------------------------------------------------------
    # POST -> Cancel current user's order
    # --------------------------------------------------------

    path(
        "orders/<int:pk>/cancel/",
        CancelOrderView.as_view(),
        name="cancel-order",
    ),


    # ========================================================
    # PAYMENT
    # ========================================================

    # --------------------------------------------------------
    # POST -> Verify Razorpay payment
    # --------------------------------------------------------

    path(
        "payment/verify/",
        VerifyPaymentView.as_view(),
        name="verify-payment",
    ),


    # ========================================================
    # WISHLIST
    # ========================================================

    # --------------------------------------------------------
    # POST -> Add product to wishlist
    # --------------------------------------------------------

    path(
        "wishlist/add/",
        WishlistAddView.as_view(),
        name="wishlist-add",
    ),

    # --------------------------------------------------------
    # GET -> Current user's wishlist
    # --------------------------------------------------------

    path(
        "wishlist/",
        WishlistListView.as_view(),
        name="wishlist",
    ),

    # --------------------------------------------------------
    # DELETE -> Remove product from wishlist
    # --------------------------------------------------------

    path(
        "wishlist/remove/<int:product_id>/",
        WishlistRemoveView.as_view(),
        name="wishlist-remove",
    ),


    # ========================================================
    # USER ADDRESS
    # ========================================================

    # --------------------------------------------------------
    # GET  -> Get current user's addresses
    # POST -> Create new address
    # --------------------------------------------------------

    path(
        "addresses/",
        AddressListCreateView.as_view(),
        name="address-list-create",
    ),

    # --------------------------------------------------------
    # GET    -> Get single address
    # PUT    -> Update address
    # PATCH  -> Partial update
    # DELETE -> Delete address
    # --------------------------------------------------------

    path(
        "addresses/<int:pk>/",
        AddressDetailView.as_view(),
        name="address-detail",
    ),

    # --------------------------------------------------------
    # PATCH -> Set address as default
    # --------------------------------------------------------

    path(
        "addresses/<int:pk>/set-default/",
        SetDefaultAddressView.as_view(),
        name="address-set-default",
    ),
]