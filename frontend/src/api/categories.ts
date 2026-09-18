import { apiClient } from './client';
import { Category } from '../types/product';
import { ApiResponse } from '../types/api';

export const categoriesApi = {
  // GET /categories/ - returns wrapped list of active categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories/');
    return res.data;
  },

  // GET /categories/:id/
  getCategory: async (id: number): Promise<ApiResponse<Category>> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}/`);
    return res.data;
  },

  // POST /categories/ (Staff only)
  createCategory: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories/', data);
    return res.data;
  },

  // PUT/PATCH /categories/:id/ (Staff only)
  updateCategory: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}/`, data);
    return res.data;
  },

  // DELETE /categories/:id/ (Staff only)
  deleteCategory: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/categories/${id}/`);
    return res.data;
  },
};
