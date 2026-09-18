import { apiClient } from './client';
import { Product, ProductFilterParams } from '../types/product';
import { ApiResponse, PaginatedResponse } from '../types/api';

export const productsApi = {
  // GET /products/ - Paginated response
  getProducts: async (params?: ProductFilterParams): Promise<PaginatedResponse<Product>> => {
    const res = await apiClient.get<PaginatedResponse<Product>>('/products/', { params });
    return res.data;
  },

  // GET /products/:id/
  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}/`);
    return res.data;
  },

  // POST /products/ (Staff only, supports multipart/form-data or JSON)
  createProduct: async (formData: FormData | Partial<Product>): Promise<ApiResponse<Product>> => {
    const isFormData = formData instanceof FormData;
    const res = await apiClient.post<ApiResponse<Product>>('/products/', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  // PATCH /products/:id/ (Staff only)
  updateProduct: async (id: number, formData: FormData | Partial<Product>): Promise<ApiResponse<Product>> => {
    const isFormData = formData instanceof FormData;
    const res = await apiClient.patch<ApiResponse<Product>>(`/products/${id}/`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  // DELETE /products/:id/ (Staff only)
  deleteProduct: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/products/${id}/`);
    return res.data;
  },
};
