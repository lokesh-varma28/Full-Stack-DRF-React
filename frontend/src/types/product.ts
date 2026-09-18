export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category: number | Category | null;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  search?: string;
  category?: number | string;
  stock?: number;
  ordering?: 'price' | '-price' | 'name' | '-name' | 'created_at' | '-created_at';
  is_active?: boolean;
}
