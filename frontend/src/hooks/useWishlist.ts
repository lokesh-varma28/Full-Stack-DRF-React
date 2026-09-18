import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../api/wishlist';
import { useAuthStore } from '../stores/useAuthStore';

export const WISHLIST_QUERY_KEY = ['wishlist'];

export function useWishlist() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data || [];
    },
    enabled: isAuthenticated,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.addToWishlist({ product: productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });

  const wishlist = wishlistQuery.data || [];
  const wishlistedProductIds = new Set(wishlist.map((item) => item.product?.id));

  const isWishlisted = (productId: number) => wishlistedProductIds.has(productId);

  const toggleWishlist = async (productId: number) => {
    if (isWishlisted(productId)) {
      await removeFromWishlistMutation.mutateAsync(productId);
    } else {
      await addToWishlistMutation.mutateAsync(productId);
    }
  };

  return {
    wishlist,
    itemCount: wishlist.length,
    isLoading: wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    isWishlisted,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutateAsync,
    removeFromWishlist: removeFromWishlistMutation.mutateAsync,
  };
}
