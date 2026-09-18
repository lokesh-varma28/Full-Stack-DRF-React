import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { ProductFilterParams } from '../types/product';

export const PRODUCTS_QUERY_KEY = 'products';
export const PRODUCT_DETAIL_QUERY_KEY = 'product';

export function useProducts(params?: ProductFilterParams) {
  const query = useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, params],
    queryFn: async () => {
      const data = await productsApi.getProducts(params);
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    products: query.data?.results || [],
    count: query.data?.count || 0,
    next: query.data?.next || null,
    previous: query.data?.previous || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProduct(id: number | null) {
  const query = useQuery({
    queryKey: [PRODUCT_DETAIL_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const res = await productsApi.getProduct(id);
      return res.data;
    },
    enabled: !!id,
  });

  return {
    product: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
