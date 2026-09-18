import { apiClient } from './client';
import { AddToCartRequest, Cart, CartItem, UpdateCartItemRequest } from '../types/cart';
import { ApiResponse } from '../types/api';

export const cartApi = {
  // GET /cart/
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const res = await apiClient.get<ApiResponse<Cart>>('/cart/');
    return res.data;
  },

  // POST /cart/items/
  addToCart: async (data: AddToCartRequest): Promise<ApiResponse<CartItem>> => {
    const res = await apiClient.post<ApiResponse<CartItem>>('/cart/items/', data);
    return res.data;
  },

  // GET /cart/items/:id/
  getCartItem: async (id: number): Promise<ApiResponse<CartItem>> => {
    const res = await apiClient.get<ApiResponse<CartItem>>(`/cart/items/${id}/`);
    return res.data;
  },

  // PATCH /cart/items/:id/
  updateCartItem: async (id: number, data: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> => {
    const res = await apiClient.patch<ApiResponse<CartItem>>(`/cart/items/${id}/`, data);
    return res.data;
  },

  // DELETE /cart/items/:id/
  removeCartItem: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/cart/items/${id}/`);
    return res.data;
  },
};
