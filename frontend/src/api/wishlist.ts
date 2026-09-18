import { apiClient } from './client';
import { AddWishlistRequest, WishlistItem } from '../types/wishlist';
import { ApiResponse } from '../types/api';

export const wishlistApi = {
  // GET /wishlist/
  getWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
    const res = await apiClient.get<ApiResponse<WishlistItem[]>>('/wishlist/');
    return res.data;
  },

  // POST /wishlist/add/ - sends { product: productId }
  addToWishlist: async (data: AddWishlistRequest): Promise<ApiResponse<WishlistItem>> => {
    const res = await apiClient.post<ApiResponse<WishlistItem>>('/wishlist/add/', data);
    return res.data;
  },

  // DELETE /wishlist/remove/<product_id>/
  removeFromWishlist: async (productId: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/wishlist/remove/${productId}/`);
    return res.data;
  },
};
