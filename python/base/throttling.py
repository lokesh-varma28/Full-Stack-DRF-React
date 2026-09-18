from rest_framework.throttling import UserRateThrottle


class ProductUserThrottle(UserRateThrottle):

    scope = "product"


class CartUserThrottle(UserRateThrottle):

    scope = "cart"