import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { useAuthStore } from '../stores/useAuthStore';
import { AdminOrderFilterParams, OrderStatus } from '../types/order';

export const ADMIN_ORDERS_QUERY_KEY = ['admin-orders'];

export function useAdminOrders(params?: AdminOrderFilterParams) {
  const { isAuthenticated, user } = useAuthStore();
  const isStaff = user?.is_staff || false;
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await ordersApi.getAdminOrders(params);
      return res.data || [];
    },
    enabled: isAuthenticated && isStaff,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersApi.updateAdminOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}

export function useAdminOrder(id: number | null) {
  const { isAuthenticated, user } = useAuthStore();
  const isStaff = user?.is_staff || false;

  const query = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await ordersApi.getAdminOrder(id);
      return res.data || null;
    },
    enabled: isAuthenticated && isStaff && !!id,
  });

  return {
    order: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
