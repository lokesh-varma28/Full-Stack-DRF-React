import { apiClient } from './client';
import {
  BuyNowRequest,
  CheckoutResponseData,
  CreateOrderRequest,
  Order,
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
};
