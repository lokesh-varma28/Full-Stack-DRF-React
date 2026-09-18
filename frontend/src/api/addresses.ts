import { apiClient } from './client';
import { Address, AddressInput } from '../types/address';
import { ApiResponse } from '../types/api';

export const addressesApi = {
  // GET /addresses/
  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    const res = await apiClient.get<ApiResponse<Address[]>>('/addresses/');
    return res.data;
  },

  // POST /addresses/
  createAddress: async (data: AddressInput): Promise<ApiResponse<Address>> => {
    const res = await apiClient.post<ApiResponse<Address>>('/addresses/', data);
    return res.data;
  },

  // GET /addresses/:id/
  getAddress: async (id: number): Promise<ApiResponse<Address>> => {
    const res = await apiClient.get<ApiResponse<Address>>(`/addresses/${id}/`);
    return res.data;
  },

  // PATCH /addresses/:id/
  updateAddress: async (id: number, data: Partial<AddressInput>): Promise<ApiResponse<Address>> => {
    const res = await apiClient.patch<ApiResponse<Address>>(`/addresses/${id}/`, data);
    return res.data;
  },

  // DELETE /addresses/:id/
  deleteAddress: async (id: number): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/addresses/${id}/`);
    return res.data;
  },

  // PATCH /addresses/:id/set-default/
  setDefaultAddress: async (id: number): Promise<ApiResponse<Address>> => {
    const res = await apiClient.patch<ApiResponse<Address>>(`/addresses/${id}/set-default/`);
    return res.data;
  },
};
