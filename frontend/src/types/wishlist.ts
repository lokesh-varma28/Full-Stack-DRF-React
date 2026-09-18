import { Product } from './product';

export interface WishlistItem {
  id: number;
  product: Product;
  created_at: string;
}

export interface AddWishlistRequest {
  product: number; // Note: backend contract expects "product" key
}
