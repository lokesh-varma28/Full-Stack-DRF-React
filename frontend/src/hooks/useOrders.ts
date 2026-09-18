import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { useAuthStore } from '../stores/useAuthStore';
import { BuyNowRequest, CreateOrderRequest, VerifyPaymentRequest } from '../types/order';
import { CART_QUERY_KEY } from './useCart';
import { PRODUCTS_QUERY_KEY } from './useProducts';

export const ORDERS_QUERY_KEY = ['orders'];

export function useOrders() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await ordersApi.getOrders();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
  });

  const buyNowMutation = useMutation({
    mutationFn: (data: BuyNowRequest) => ordersApi.buyNow(data),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (data: VerifyPaymentRequest) => ordersApi.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (id: number) => ordersApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    createOrder: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
    buyNow: buyNowMutation.mutateAsync,
    isBuyingNow: buyNowMutation.isPending,
    verifyPayment: verifyPaymentMutation.mutateAsync,
    isVerifyingPayment: verifyPaymentMutation.isPending,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isCancellingOrder: cancelOrderMutation.isPending,
  };
}

export function useOrder(id: number | null) {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await ordersApi.getOrder(id);
      return res.data;
    },
    enabled: isAuthenticated && !!id,
  });

  return {
    order: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
