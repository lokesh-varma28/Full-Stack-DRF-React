from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from base.models import Address, Category, Product, Cart, CartItem
from base.serializers.addressserializer import AddressSerializer


class AddressAPITestCase(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(
            username="testuser1",
            email="user1@example.com",
            password="Password123!",
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="user2@example.com",
            password="Password123!",
        )

        self.valid_address_data = {
            "full_name": "Lokesh Varma",
            "phone": "9876543210",
            "address_line": "12 Main Road",
            "city": "Kakinada",
            "state": "Andhra Pradesh",
            "postal_code": "533001",
            "country": "India",
            "is_default": True,
        }

    def test_create_address_success(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("address-list-create")
        response = self.client.post(url, self.valid_address_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Address.objects.filter(user=self.user1).count(), 1)
        address = Address.objects.get(user=self.user1)
        self.assertEqual(address.full_name, "Lokesh Varma")
        self.assertEqual(address.phone, "9876543210")
        self.assertEqual(address.address_line, "12 Main Road")
        self.assertEqual(address.city, "Kakinada")
        self.assertEqual(address.postal_code, "533001")
        self.assertTrue(address.is_default)

    def test_address_validation_errors(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("address-list-create")

        # Invalid phone (letters)
        data = self.valid_address_data.copy()
        data["phone"] = "abc1234567"
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid phone length (< 10)
        data["phone"] = "12345"
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid postal code length (!= 6)
        data = self.valid_address_data.copy()
        data["postal_code"] = "12345"
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Empty address_line after trim
        data = self.valid_address_data.copy()
        data["address_line"] = "   "
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_address_ownership_security(self):
        # Create address owned by user1
        address1 = Address.objects.create(
            user=self.user1,
            full_name="User1 Address",
            phone="9876543210",
            address_line="Line 1",
            city="City1",
            state="State1",
            postal_code="533001",
            country="India",
            is_default=True,
        )

        # Authenticate as user2 and attempt to access user1's address
        self.client.force_authenticate(user=self.user2)
        detail_url = reverse("address-detail", kwargs={"pk": address1.id})

        # GET user1 address by user2 -> Should return 404 Not Found
        res_get = self.client.get(detail_url)
        self.assertEqual(res_get.status_code, status.HTTP_404_NOT_FOUND)

        # PATCH user1 address by user2 -> Should return 404 Not Found
        res_patch = self.client.patch(detail_url, {"city": "HackedCity"}, format="json")
        self.assertEqual(res_patch.status_code, status.HTTP_404_NOT_FOUND)

        # DELETE user1 address by user2 -> Should return 404 Not Found
        res_delete = self.client.delete(detail_url)
        self.assertEqual(res_delete.status_code, status.HTTP_404_NOT_FOUND)

        # Set default user1 address by user2 -> Should return 404 Not Found
        set_default_url = reverse("address-set-default", kwargs={"pk": address1.id})
        res_default = self.client.patch(set_default_url)
        self.assertEqual(res_default.status_code, status.HTTP_404_NOT_FOUND)

    def test_default_address_management(self):
        self.client.force_authenticate(user=self.user1)

        # Create first address (not explicitly marked default, should become default automatically)
        data1 = self.valid_address_data.copy()
        data1["is_default"] = False
        data1["full_name"] = "Address 1"
        res1 = self.client.post(reverse("address-list-create"), data1, format="json")
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        addr1_id = res1.data["data"]["id"]
        self.assertTrue(Address.objects.get(id=addr1_id).is_default)

        # Create second address as default -> first address should become non-default
        data2 = self.valid_address_data.copy()
        data2["is_default"] = True
        data2["full_name"] = "Address 2"
        res2 = self.client.post(reverse("address-list-create"), data2, format="json")
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        addr2_id = res2.data["data"]["id"]

        self.assertFalse(Address.objects.get(id=addr1_id).is_default)
        self.assertTrue(Address.objects.get(id=addr2_id).is_default)

        # Set address 1 as default via set-default endpoint
        res_set = self.client.patch(reverse("address-set-default", kwargs={"pk": addr1_id}))
        self.assertEqual(res_set.status_code, status.HTTP_200_OK)
        self.assertTrue(Address.objects.get(id=addr1_id).is_default)
        self.assertFalse(Address.objects.get(id=addr2_id).is_default)

        # Delete address 1 (current default) -> address 2 should be promoted to default
        res_del = self.client.delete(reverse("address-detail", kwargs={"pk": addr1_id}))
        self.assertEqual(res_del.status_code, status.HTTP_200_OK)
        self.assertTrue(Address.objects.get(id=addr2_id).is_default)

    def test_order_creation_address_ownership(self):
        # Create address owned by user2
        user2_address = Address.objects.create(
            user=self.user2,
            full_name="User2 Address",
            phone="9876543210",
            address_line="User 2 Street",
            city="City2",
            state="State2",
            postal_code="533001",
            country="India",
            is_default=True,
        )

        # User1 adds item to cart
        category = Category.objects.create(name="Electronics", slug="electronics")
        product = Product.objects.create(
            category=category,
            name="Test Phone",
            price=1000.00,
            stock=10,
            is_active=True,
        )
        cart = Cart.objects.create(user=self.user1)
        CartItem.objects.create(cart=cart, product=product, quantity=1)

        # Authenticate as user1 and try to create order using user2's address_id
        self.client.force_authenticate(user=self.user1)
        url = reverse("create-order")
        response = self.client.post(url, {"address_id": user2_address.id}, format="json")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


from datetime import timedelta
from django.core import mail
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from base.models import EmailOTP, Order


class FixesAPITestCase(APITestCase):

    def setUp(self):
        # Active normal user
        self.active_user = User.objects.create_user(
            username="activeuser",
            email="active@example.com",
            password="Password123!",
            is_active=True,
        )
        # Active staff user
        self.staff_user = User.objects.create_user(
            username="staffuser",
            email="staff@example.com",
            password="Password123!",
            is_active=True,
            is_staff=True,
        )
        # Inactive user with existing OTP
        self.inactive_user = User.objects.create_user(
            username="inactiveuser",
            email="inactive@example.com",
            password="Password123!",
            is_active=False,
        )
        self.old_otp = EmailOTP.objects.create(
            user=self.inactive_user,
            otp="111111",
            expires_at=timezone.now() - timedelta(minutes=5),
            attempts=3,
            is_verified=False,
        )
        # Categories
        self.active_category = Category.objects.create(
            name="Clothing",
            slug="clothing",
            is_active=True,
        )
        self.inactive_category = Category.objects.create(
            name="Archived",
            slug="archived",
            is_active=False,
        )

    # ========================================================
    # FIX #1: TOKEN REFRESH
    # ========================================================

    def test_token_refresh_route_success(self):
        refresh = RefreshToken.for_user(self.active_user)
        url = reverse("token-refresh")
        response = self.client.post(url, {"refresh": str(refresh)}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_token_refresh_invalid_token(self):
        url = reverse("token-refresh")
        response = self.client.post(url, {"refresh": "invalid-token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ========================================================
    # FIX #2: CURRENT USER ENDPOINT (/auth/me/)
    # ========================================================

    def test_current_user_unauthenticated(self):
        url = reverse("current-user")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_authenticated_with_bearer_token(self):
        refresh = RefreshToken.for_user(self.active_user)
        access_token = str(refresh.access_token)

        url = reverse("current-user")
        response = self.client.get(url, HTTP_AUTHORIZATION=f"Bearer {access_token}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))
        self.assertEqual(response.data.get("message"), "User profile fetched successfully")
        data = response.data.get("data", {})
        self.assertEqual(data.get("id"), self.active_user.id)
        self.assertEqual(data.get("username"), self.active_user.username)
        self.assertEqual(data.get("email"), self.active_user.email)
        self.assertFalse(data.get("is_staff"))
        # Ensure password and sensitive info are not exposed
        self.assertNotIn("password", data)

    # ========================================================
    # FIX #3: REGISTRATION RESEND OTP (/auth/resend-otp/)
    # ========================================================

    def test_resend_otp_user_not_found(self):
        url = reverse("resend-otp")
        response = self.client.post(url, {"email": "nonexistent@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resend_otp_active_user_rejected(self):
        url = reverse("resend-otp")
        response = self.client.post(url, {"email": "active@example.com"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resend_otp_inactive_user_success(self):
        mail.outbox.clear()
        url = reverse("resend-otp")
        response = self.client.post(url, {"email": "INACTIVE@example.com "}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))
        self.assertEqual(response.data.get("data", {}).get("email"), "inactive@example.com")
        self.assertEqual(response.data.get("data", {}).get("otp_expires_in"), "10 minutes")

        # Verify EmailOTP record updated
        otp_record = EmailOTP.objects.get(user=self.inactive_user)
        self.assertNotEqual(otp_record.otp, "111111")
        self.assertEqual(len(otp_record.otp), 6)
        self.assertEqual(otp_record.attempts, 0)
        self.assertFalse(otp_record.is_verified)
        self.assertGreater(otp_record.expires_at, timezone.now())

        # Verify email sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["inactive@example.com"])
        self.assertIn(otp_record.otp, mail.outbox[0].body)

    # ========================================================
    # FIX #4: CATEGORY ROUTES & PERMISSIONS
    # ========================================================

    def test_category_list_public_access_and_filtering(self):
        # Unauthenticated GET
        url = reverse("category-list-create")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category_names = [c["name"] for c in response.data.get("data", [])]
        self.assertIn("Clothing", category_names)
        self.assertNotIn("Archived", category_names)

    def test_category_detail_public_access(self):
        # Unauthenticated GET active category
        url = reverse("category-detail", kwargs={"pk": self.active_category.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("data", {}).get("name"), "Clothing")

        # Unauthenticated GET inactive category -> should return 404
        url_inactive = reverse("category-detail", kwargs={"pk": self.inactive_category.id})
        response_inactive = self.client.get(url_inactive)
        self.assertEqual(response_inactive.status_code, status.HTTP_404_NOT_FOUND)

    def test_category_write_staff_protection(self):
        url = reverse("category-list-create")
        payload = {"name": "Books", "slug": "books"}

        # Unauthenticated POST -> 401
        res_unauth = self.client.post(url, payload, format="json")
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Non-staff POST -> 403
        self.client.force_authenticate(user=self.active_user)
        res_user = self.client.post(url, payload, format="json")
        self.assertEqual(res_user.status_code, status.HTTP_403_FORBIDDEN)

        # Staff POST -> 201
        self.client.force_authenticate(user=self.staff_user)
        res_staff = self.client.post(url, payload, format="json")
        self.assertEqual(res_staff.status_code, status.HTTP_201_CREATED)

    # ========================================================
    # FIX #5: ORDER DETAIL ROUTE & OWNERSHIP
    # ========================================================

    def test_order_detail_unauthenticated(self):
        order = Order.objects.create(
            user=self.active_user,
            total_amount=500.00,
            status="pending",
        )
        url = reverse("order-detail", kwargs={"pk": order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_order_detail_owner_success(self):
        order = Order.objects.create(
            user=self.active_user,
            total_amount=500.00,
            status="pending",
        )
        self.client.force_authenticate(user=self.active_user)
        url = reverse("order-detail", kwargs={"pk": order.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("data", {}).get("id"), order.id)

    def test_order_detail_other_user_forbidden_404(self):
        order = Order.objects.create(
            user=self.active_user,
            total_amount=500.00,
            status="pending",
        )
        # Authenticate as a different user
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="Password123!",
        )
        self.client.force_authenticate(user=other_user)
        url = reverse("order-detail", kwargs={"pk": order.id})
        response = self.client.get(url)

        # Queryset filters by request.user, so accessing another user's order must return 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


from unittest.mock import patch, MagicMock
from cloudinary import CloudinaryResource
from django.core.files.uploadedfile import SimpleUploadedFile
from base.models import Payment, OrderItem


class Phase2HardeningAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="shopper",
            email="shopper@example.com",
            password="Password123!",
            is_active=True,
        )
        self.staff_user = User.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="Password123!",
            is_active=True,
            is_staff=True,
        )
        self.category = Category.objects.create(
            name="Gadgets",
            slug="gadgets",
            is_active=True,
        )
        self.address = Address.objects.create(
            user=self.user,
            full_name="Original Name",
            phone="9876543210",
            address_line="100 Tech Lane",
            city="Tech City",
            state="Tech State",
            postal_code="500001",
            country="India",
            is_default=True,
        )
        self.product_a = Product.objects.create(
            category=self.category,
            name="Product A",
            price=100.00,
            stock=10,
            is_active=True,
        )
        self.product_b = Product.objects.create(
            category=self.category,
            name="Product B",
            price=200.00,
            stock=10,
            is_active=True,
        )
        self.product_c = Product.objects.create(
            category=self.category,
            name="Product C",
            price=300.00,
            stock=10,
            is_active=True,
        )
        self.product_d = Product.objects.create(
            category=self.category,
            name="Product D (Buy Now)",
            price=400.00,
            stock=10,
            is_active=True,
        )

    # ========================================================
    # TASK 1: BUY NOW CART SAFETY & NORMAL CART CHECKOUT
    # ========================================================

    @patch("razorpay.Client")
    def test_buy_now_preserves_unrelated_cart_items_and_cart_checkout_clears_cart(self, mock_razorpay):
        # Setup razorpay mock
        mock_client = MagicMock()
        mock_razorpay.return_value = mock_client
        mock_client.order.create.side_effect = [
            {"id": "order_rzp_buynow_123"},
            {"id": "order_rzp_cart_456"},
        ]
        mock_client.utility.verify_payment_signature.return_value = True

        self.client.force_authenticate(user=self.user)

        # 1. User has Products A, B, C in cart
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product_a, quantity=1)
        CartItem.objects.create(cart=cart, product=self.product_b, quantity=2)
        CartItem.objects.create(cart=cart, product=self.product_c, quantity=3)

        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 3)

        # 2. User performs Buy Now on Product D
        buy_now_url = reverse("buy-now")
        res_buy_now = self.client.post(
            buy_now_url,
            {
                "product_id": self.product_d.id,
                "quantity": 1,
                "address_id": self.address.id,
            },
            format="json",
        )
        self.assertEqual(res_buy_now.status_code, status.HTTP_201_CREATED)
        buy_now_order_id = res_buy_now.data["data"]["order_id"]
        rzp_order_id = res_buy_now.data["data"]["razorpay_order_id"]

        # 3. Payment succeeds for Buy Now order
        verify_url = reverse("verify-payment")
        res_verify = self.client.post(
            verify_url,
            {
                "razorpay_order_id": rzp_order_id,
                "razorpay_payment_id": "pay_buynow_999",
                "razorpay_signature": "mock_sig_buynow",
            },
            format="json",
        )
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)

        # 4. Verify Buy Now order is paid
        order_buynow = Order.objects.get(id=buy_now_order_id)
        self.assertEqual(order_buynow.status, "paid")
        self.assertEqual(order_buynow.items.count(), 1)
        self.assertEqual(order_buynow.items.first().product, self.product_d)

        # 5. CRITICAL: Unrelated cart items (A, B, C) MUST remain intact in cart!
        cart_items_after_buynow = CartItem.objects.filter(cart=cart).order_by("product__name")
        self.assertEqual(cart_items_after_buynow.count(), 3)
        self.assertEqual([ci.product.name for ci in cart_items_after_buynow], ["Product A", "Product B", "Product C"])
        self.assertEqual([ci.quantity for ci in cart_items_after_buynow], [1, 2, 3])

        # 6. Now perform normal Cart checkout for A, B, C
        cart_checkout_url = reverse("create-order")
        res_cart_order = self.client.post(
            cart_checkout_url,
            {"address_id": self.address.id},
            format="json",
        )
        self.assertEqual(res_cart_order.status_code, status.HTTP_201_CREATED)
        cart_order_id = res_cart_order.data["data"]["order_id"]
        rzp_cart_order_id = res_cart_order.data["data"]["razorpay_order_id"]

        # 7. Verify payment for Cart order
        res_verify_cart = self.client.post(
            verify_url,
            {
                "razorpay_order_id": rzp_cart_order_id,
                "razorpay_payment_id": "pay_cart_888",
                "razorpay_signature": "mock_sig_cart",
            },
            format="json",
        )
        self.assertEqual(res_verify_cart.status_code, status.HTTP_200_OK)

        # 8. Cart items A, B, C should now be cleared
        self.assertEqual(CartItem.objects.filter(cart=cart).count(), 0)

        # 9. Verify cart order is paid
        order_cart = Order.objects.get(id=cart_order_id)
        self.assertEqual(order_cart.status, "paid")
        self.assertEqual(order_cart.items.count(), 3)

    # ========================================================
    # TASK 2: STANDARDIZED CHECKOUT RESPONSE
    # ========================================================

    @patch("razorpay.Client")
    def test_standardized_checkout_response_contract(self, mock_razorpay):
        mock_client = MagicMock()
        mock_razorpay.return_value = mock_client
        mock_client.order.create.side_effect = [
            {"id": "order_rzp_std_bn"},
            {"id": "order_rzp_std_cart"},
        ]

        self.client.force_authenticate(user=self.user)

        # 1. Test /buy-now/ response shape
        res_buy_now = self.client.post(
            reverse("buy-now"),
            {
                "product_id": self.product_d.id,
                "quantity": 2,
                "address_id": self.address.id,
            },
            format="json",
        )
        self.assertEqual(res_buy_now.status_code, status.HTTP_201_CREATED)
        bn_data = res_buy_now.data.get("data", {})

        expected_keys = [
            "order_id",
            "razorpay_order_id",
            "amount",
            "amount_rupees",
            "currency",
            "razorpay_key_id",
        ]
        for key in expected_keys:
            self.assertIn(key, bn_data, f"Key '{key}' missing from Buy Now response data")

        self.assertEqual(bn_data["amount"], 80000)  # 2 * 400.00 * 100 paise
        self.assertEqual(bn_data["amount_rupees"], "800.00")
        self.assertEqual(bn_data["currency"], "INR")
        self.assertEqual(bn_data["razorpay_order_id"], "order_rzp_std_bn")

        # Backward-compatibility preserved
        self.assertIn("order", bn_data)
        self.assertIn("razorpay", bn_data)

        # 2. Test /orders/create/ response shape
        cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=cart, product=self.product_a, quantity=1)

        res_cart = self.client.post(
            reverse("create-order"),
            {"address_id": self.address.id},
            format="json",
        )
        self.assertEqual(res_cart.status_code, status.HTTP_201_CREATED)
        cart_data = res_cart.data.get("data", {})

        for key in expected_keys:
            self.assertIn(key, cart_data, f"Key '{key}' missing from Cart checkout response data")

        self.assertEqual(cart_data["amount"], 10000)  # 1 * 100.00 * 100 paise
        self.assertEqual(cart_data["amount_rupees"], "100.00")
        self.assertEqual(cart_data["currency"], "INR")
        self.assertEqual(cart_data["razorpay_order_id"], "order_rzp_std_cart")

    # ========================================================
    # TASK 3: PRODUCT IMAGE UPLOAD & PERSISTENCE
    # ========================================================

    @patch("cloudinary.uploader.upload_resource")
    def test_product_image_upload_and_persistence(self, mock_upload):
        mock_upload.return_value = CloudinaryResource(
            public_id="prod_image_pub_123",
            format="png",
            type="upload",
            resource_type="image",
        )

        url = reverse("products")
        image_file = SimpleUploadedFile(
            "product.png",
            b"fake-image-bytes",
            content_type="image/png",
        )

        # 1. Anonymous POST -> 401
        res_anon = self.client.post(url, {"name": "Anon Prod", "price": "100", "stock": "5"}, format="multipart")
        self.assertEqual(res_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # 2. Regular user POST -> 403
        self.client.force_authenticate(user=self.user)
        res_user = self.client.post(url, {"name": "User Prod", "price": "100", "stock": "5"}, format="multipart")
        self.assertEqual(res_user.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Staff user POST with multipart image -> 201
        self.client.force_authenticate(user=self.staff_user)
        res_staff = self.client.post(
            url,
            {
                "name": "Noise Cancelling Headphones",
                "description": "High quality audio",
                "price": "2999.00",
                "stock": "15",
                "category": self.category.id,
                "image": image_file,
            },
            format="multipart",
        )
        self.assertEqual(res_staff.status_code, status.HTTP_201_CREATED)
        product_id = res_staff.data["data"]["id"]
        self.assertIn("prod_image_pub_123", res_staff.data["data"]["image"])

        # 4. Public GET product returns image URL
        self.client.force_authenticate(user=None)
        detail_url = reverse("product-detail", kwargs={"pk": product_id})
        res_get = self.client.get(detail_url)
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertIn("prod_image_pub_123", res_get.data["data"]["image"])

        # 5. Staff PATCH without image preserves existing image
        self.client.force_authenticate(user=self.staff_user)
        res_patch_no_img = self.client.patch(
            detail_url,
            {"price": "2799.00"},
            format="json",
        )
        self.assertEqual(res_patch_no_img.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch_no_img.data["data"]["price"], "2799.00")
        self.assertIn("prod_image_pub_123", res_patch_no_img.data["data"]["image"])

        # 6. Staff PATCH with new image replaces image
        mock_upload.return_value = CloudinaryResource(
            public_id="prod_image_pub_NEW",
            format="png",
            type="upload",
            resource_type="image",
        )
        new_image_file = SimpleUploadedFile(
            "new_product.png",
            b"new-fake-image-bytes",
            content_type="image/png",
        )
        res_patch_new_img = self.client.patch(
            detail_url,
            {"image": new_image_file},
            format="multipart",
        )
        self.assertEqual(res_patch_new_img.status_code, status.HTTP_200_OK)
        self.assertIn("prod_image_pub_NEW", res_patch_new_img.data["data"]["image"])

    # ========================================================
    # TASK 4: ORDER DELIVERY ADDRESS SNAPSHOT
    # ========================================================

    def test_order_delivery_address_snapshot_persists_across_address_edits(self):
        # Create an order with original address values
        order = Order.objects.create(
            user=self.user,
            delivery_full_name=self.address.full_name,
            delivery_phone=self.address.phone,
            delivery_address_line=self.address.address_line,
            delivery_city=self.address.city,
            delivery_state=self.address.state,
            delivery_postal_code=self.address.postal_code,
            delivery_country=self.address.country,
            total_amount=500.00,
            status="paid",
        )
        OrderItem.objects.create(
            order=order,
            product=self.product_a,
            quantity=5,
            price=self.product_a.price,
        )

        # Mutate the user's address record
        self.address.full_name = "Modified Name"
        self.address.phone = "0000000000"
        self.address.city = "New Metropolis"
        self.address.address_line = "999 Altered Road"
        self.address.save()

        # Fetch order details via API
        self.client.force_authenticate(user=self.user)
        detail_url = reverse("order-detail", kwargs={"pk": order.id})
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["data"]

        # Assert flat snapshot fields retain the purchase-time values
        self.assertEqual(data["delivery_full_name"], "Original Name")
        self.assertEqual(data["delivery_phone"], "9876543210")
        self.assertEqual(data["delivery_address_line"], "100 Tech Lane")
        self.assertEqual(data["delivery_city"], "Tech City")
        self.assertEqual(data["delivery_state"], "Tech State")
        self.assertEqual(data["delivery_postal_code"], "500001")
        self.assertEqual(data["delivery_country"], "India")

        # Assert structured delivery_address object also contains snapshot
        self.assertIn("delivery_address", data)
        self.assertEqual(data["delivery_address"]["full_name"], "Original Name")
        self.assertEqual(data["delivery_address"]["phone"], "9876543210")
        self.assertEqual(data["delivery_address"]["city"], "Tech City")


class CategoryAPITestCase(APITestCase):

    def setUp(self):
        self.staff_user = User.objects.create_superuser(
            username="adminuser",
            email="admin@example.com",
            password="AdminPassword123!",
            is_staff=True,
        )
        self.normal_user = User.objects.create_user(
            username="normaluser",
            email="normal@example.com",
            password="UserPassword123!",
            is_staff=False,
        )

        self.category_1 = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Gadgets and tech",
            is_active=True,
        )
        self.category_2 = Category.objects.create(
            name="Clothing",
            slug="clothing",
            description="Apparel and fashion",
            is_active=True,
        )

        self.product = Product.objects.create(
            category=self.category_1,
            name="Smartphone",
            description="Latest smartphone",
            price=500.00,
            stock=10,
            is_active=True,
        )

    def test_public_get_categories(self):
        url = reverse("category-list-create")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 2)

    def test_staff_create_category_success(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("category-list-create")
        data = {
            "name": "Home & Kitchen",
            "slug": "home-kitchen",
            "description": "Appliances",
        }
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Category.objects.filter(name="Home & Kitchen").exists())

    def test_staff_edit_category_success(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("category-detail", kwargs={"pk": self.category_1.id})
        data = {
            "name": "Electronics & Audio",
            "slug": "electronics-audio",
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.category_1.refresh_from_db()
        self.assertEqual(self.category_1.name, "Electronics & Audio")

    def test_staff_edit_category_blank_name_rejected(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("category-detail", kwargs={"pk": self.category_1.id})
        data = {
            "name": "   ",
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_staff_edit_category_duplicate_name_rejected(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("category-detail", kwargs={"pk": self.category_1.id})
        data = {
            "name": "Clothing", # Name already exists on category_2
        }
        response = self.client.patch(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_staff_delete_category_products_remain_uncategorized(self):
        self.client.force_authenticate(user=self.staff_user)
        url = reverse("category-detail", kwargs={"pk": self.category_1.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify category record is removed
        self.assertFalse(Category.objects.filter(id=self.category_1.id).exists())
        
        # Verify product is NOT deleted and category FK is set to NULL
        self.product.refresh_from_db()
        self.assertIsNotNone(self.product)
        self.assertIsNone(self.product.category)

    def test_non_staff_cannot_create_edit_or_delete_category(self):
        self.client.force_authenticate(user=self.normal_user)
        list_url = reverse("category-list-create")
        detail_url = reverse("category-detail", kwargs={"pk": self.category_1.id})

        res_post = self.client.post(list_url, {"name": "Books"}, format="json")
        self.assertEqual(res_post.status_code, status.HTTP_403_FORBIDDEN)

        res_patch = self.client.patch(detail_url, {"name": "New Electronics"}, format="json")
        self.assertEqual(res_patch.status_code, status.HTTP_403_FORBIDDEN)

        res_delete = self.client.delete(detail_url)
        self.assertEqual(res_delete.status_code, status.HTTP_403_FORBIDDEN)

    def test_category_not_found_returns_404(self):
        self.client.force_authenticate(user=self.staff_user)
        detail_url = reverse("category-detail", kwargs={"pk": 99999})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)




