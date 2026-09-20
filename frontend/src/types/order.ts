import { Product } from './product';

export type OrderStatus = 'created' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'cancelled';

export interface OrderItem {
  id: number;
  product: Product | null;
  quantity: number;
  price: string | number;
}

export interface Payment {
  id: number;
  razorpay_payment_id?: string | null;
  status: 'created' | 'success' | 'failed';
  created_at: string;
}

export interface DeliveryAddressSnapshot {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: number;
  total_amount: string | number;
  status: OrderStatus;
  razorpay_order_id?: string | null;
  delivery_full_name: string;
  delivery_phone: string;
  delivery_address_line: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
  delivery_country: string;
  delivery_address?: DeliveryAddressSnapshot;
  items: OrderItem[];
  payment?: Payment | null;
  created_at: string;
}

export interface CreateOrderRequest {
  address_id: number;
}

export interface BuyNowRequest {
  product_id: number;
  quantity: number;
  address_id: number;
}

export interface CheckoutResponseData {
  order_id: number;
  razorpay_order_id: string;
  amount: number;
  amount_rupees: string;
  currency: string;
  razorpay_key_id: string;
  order?: Order | null;
  razorpay?: Record<string, unknown> | null;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface AdminCustomer {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface AdminOrder extends Order {
  user?: AdminCustomer;
  customer?: AdminCustomer;
  items_count?: number;
  updated_at?: string;
}

export interface AdminOrderFilterParams {
  search?: string;
  status?: OrderStatus | '';
  payment_status?: string;
  ordering?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
