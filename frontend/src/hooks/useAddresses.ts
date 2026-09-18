import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from '../api/addresses';
import { useAuthStore } from '../stores/useAuthStore';
import { AddressInput } from '../types/address';

export const ADDRESSES_QUERY_KEY = ['addresses'];

export function useAddresses() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const res = await addressesApi.getAddresses();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: AddressInput) => addressesApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AddressInput> }) =>
      addressesApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressesApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => addressesApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });

  const addresses = query.data || [];
  const defaultAddress = addresses.find((addr) => addr.is_default) || addresses[0] || null;

  return {
    addresses,
    defaultAddress,
    isLoading: query.isLoading,
    isError: query.isError,
    createAddress: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAddress: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAddress: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
