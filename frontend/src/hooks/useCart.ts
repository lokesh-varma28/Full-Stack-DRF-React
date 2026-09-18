import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { useAuthStore } from '../stores/useAuthStore';
import { AddToCartRequest, UpdateCartItemRequest } from '../types/cart';

export const CART_QUERY_KEY = ['cart'];

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await cartApi.getCart();
      return res.data;
    },
    enabled: isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartRequest) => cartApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCartItemRequest }) =>
      cartApi.updateCartItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: (id: number) => cartApi.removeCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });

  const cart = cartQuery.data;
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return {
    cart,
    itemCount,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    refetch: cartQuery.refetch,
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    updateCartItem: updateCartItemMutation.mutateAsync,
    isUpdatingCartItem: updateCartItemMutation.isPending,
    removeCartItem: removeCartItemMutation.mutateAsync,
    isRemovingCartItem: removeCartItemMutation.isPending,
  };
}
