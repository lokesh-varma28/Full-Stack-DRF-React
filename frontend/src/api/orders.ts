import { apiClient } from './client';
import {
  AdminOrder,
  AdminOrderFilterParams,
  BuyNowRequest,
  CheckoutResponseData,
  CreateOrderRequest,
  Order,
  OrderStatus,
  VerifyPaymentRequest,
} from '../types/order';
import { ApiResponse } from '../types/api';

export const ordersApi = {
  // POST /orders/create/ - Create order from Cart
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<CheckoutResponseData>> => {
    const res = await apiClient.post<ApiResponse<CheckoutResponseData>>('/orders/create/', data);
    return res.data;
  },

  // POST /buy-now/ - Direct purchase single product
  buyNow: async (data: BuyNowRequest): Promise<ApiResponse<CheckoutResponseData>> => {
    const res = await apiClient.post<ApiResponse<CheckoutResponseData>>('/buy-now/', data);
    return res.data;
  },

  // POST /payment/verify/ - Verify Razorpay payment
  verifyPayment: async (data: VerifyPaymentRequest): Promise<ApiResponse<Order>> => {
    const res = await apiClient.post<ApiResponse<Order>>('/payment/verify/', data);
    return res.data;
  },

  // GET /orders/ - List user's orders
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const res = await apiClient.get<ApiResponse<Order[]>>('/orders/');
    return res.data;
  },

  // GET /orders/:id/ - Order details
  getOrder: async (id: number): Promise<ApiResponse<Order>> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}/`);
    return res.data;
  },

  // POST /orders/:id/cancel/ - Cancel created order
  cancelOrder: async (id: number): Promise<ApiResponse<Order>> => {
    const res = await apiClient.post<ApiResponse<Order>>(`/orders/${id}/cancel/`);
    return res.data;
  },

  // GET /orders/admin/ - Admin list all customer orders
  getAdminOrders: async (params?: AdminOrderFilterParams): Promise<ApiResponse<AdminOrder[]>> => {
    const res = await apiClient.get<ApiResponse<AdminOrder[]>>('/orders/admin/', { params });
    return res.data;
  },

  // GET /orders/admin/:id/ - Admin single order detail
  getAdminOrder: async (id: number): Promise<ApiResponse<AdminOrder>> => {
    const res = await apiClient.get<ApiResponse<AdminOrder>>(`/orders/admin/${id}/`);
    return res.data;
  },

  // PATCH /orders/admin/:id/ - Admin update order status
  updateAdminOrderStatus: async (id: number, status: OrderStatus): Promise<ApiResponse<AdminOrder>> => {
    const res = await apiClient.patch<ApiResponse<AdminOrder>>(`/orders/admin/${id}/`, { status });
    return res.data;
  },
};
