from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# ============================================================
# DEFAULT PAGINATION
# ============================================================

class CustomPagination(PageNumberPagination):
    """
    Default pagination used by DRF APIs.
    """

    page_size = 10

    page_size_query_param = "size"

    max_page_size = 100

    page_query_param = "page"

    def get_paginated_response(self, data):

        return Response({
            "success": True,
            "message": "Data fetched successfully",
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


# ============================================================
# PRODUCT PAGINATION
# ============================================================

class ProductPagination(PageNumberPagination):
    """
    Pagination specifically for Product APIs.
    """

    page_size = 10

    page_size_query_param = "size"

    max_page_size = 100

    page_query_param = "page"

    def get_paginated_response(self, data):

        return Response({
            "success": True,
            "message": "Products fetched successfully",
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })


# ============================================================
# CART PAGINATION
# ============================================================

class CartPagination(PageNumberPagination):

    page_size = 10

    page_size_query_param = "size"

    max_page_size = 50

    page_query_param = "page"


# ============================================================
# ORDER PAGINATION
# ============================================================

class OrderPagination(PageNumberPagination):

    page_size = 10

    page_size_query_param = "size"

    max_page_size = 50

    page_query_param = "page"