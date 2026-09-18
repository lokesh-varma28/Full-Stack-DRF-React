export interface CartItem {
  id: number;
  product: number;
  product_name: string;
  product_price: string | number;
  product_image: string | null;
  quantity: number;
  total_price: string | number;
}

export interface Cart {
  id: number;
  user: number;
  items: CartItem[];
  total_price: string | number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  product: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}
