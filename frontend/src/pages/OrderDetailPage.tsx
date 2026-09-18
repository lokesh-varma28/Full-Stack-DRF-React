import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, PackageCheck, AlertCircle, XCircle } from 'lucide-react';
import { useOrder, useOrders } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { PRODUCT_FALLBACK_IMAGE } from '../utils/constants';
import { toast } from '../stores/useToastStore';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;

  const { order, isLoading, isError } = useOrder(orderId);
  const { cancelOrder, isCancellingOrder } = useOrders();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-[#111418] border border-[#252A31] rounded-lg w-48 animate-pulse" />
        <div className="h-64 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-[#F5F7FA]">Order Not Found</h2>
        <p className="text-xs text-[#747B87]">The order you requested could not be found.</p>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(order.id);
        toast.info('Order has been cancelled.');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to cancel order.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#A7ADB7] hover:text-[#F5F7FA] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#252A31] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Order #{order.id}</h1>
          <p className="text-xs text-[#747B87] mt-1">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.status === 'created' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancellingOrder}
              className="px-4 py-2 bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/50 text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4 text-rose-400" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Purchased Items List */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-[#111418] p-6 rounded-xl border border-[#252A31] space-y-4">
            <h2 className="font-semibold text-[#F5F7FA] text-base flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-indigo-400" /> Purchased Items
            </h2>

            <div className="space-y-4 pt-2">
              {order.items?.map((item) => {
                const product = item.product;
                const isInvalidImage = !product?.image || product.image.includes('unsplash');
                const imageUrl = (isInvalidImage ? PRODUCT_FALLBACK_IMAGE : product!.image) || PRODUCT_FALLBACK_IMAGE;

                return (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-[#252A31] last:border-0">
                    <div className="w-16 h-16 bg-[#171B20] border border-[#252A31] rounded-lg overflow-hidden shrink-0 p-1 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={product?.name ? product.name : 'Product'}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== PRODUCT_FALLBACK_IMAGE) {
                            target.src = PRODUCT_FALLBACK_IMAGE;
                          }
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#F5F7FA] text-sm truncate">
                        {product ? product.name : 'Product'}
                      </h4>
                      <p className="text-xs text-[#747B87] mt-0.5">
                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="font-semibold text-sm text-[#F5F7FA]">
                      {formatCurrency((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Address & Payment Info Sidebar */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <div className="bg-[#111418] p-6 rounded-xl border border-[#252A31] space-y-3">
            <h3 className="font-semibold text-[#F5F7FA] text-sm flex items-center gap-2 border-b border-[#252A31] pb-3">
              <MapPin className="w-4 h-4 text-indigo-400" /> Delivery Address
            </h3>
            <div className="text-xs text-[#A7ADB7] leading-relaxed space-y-1">
              <p className="font-semibold text-[#F5F7FA]">{order.delivery_full_name}</p>
              <p>{order.delivery_address_line}</p>
              <p>
                {order.delivery_city}, {order.delivery_state} - {order.delivery_postal_code}
              </p>
              <p className="text-[#747B87] font-medium">Ph: {order.delivery_phone}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-[#111418] p-6 rounded-xl border border-[#252A31] space-y-3">
            <h3 className="font-semibold text-[#F5F7FA] text-sm flex items-center gap-2 border-b border-[#252A31] pb-3">
              <CreditCard className="w-4 h-4 text-indigo-400" /> Payment Summary
            </h3>
            <div className="text-xs space-y-2">
              <div className="flex justify-between text-[#A7ADB7]">
                <span>Status</span>
                <span className="font-semibold uppercase text-[#F5F7FA]">{order.payment?.status || order.status}</span>
              </div>
              {order.razorpay_order_id && (
                <div className="flex justify-between text-[#A7ADB7]">
                  <span>Razorpay Order</span>
                  <span className="font-mono text-[10px] text-[#A7ADB7]">{order.razorpay_order_id}</span>
                </div>
              )}
              {order.payment?.razorpay_payment_id && (
                <div className="flex justify-between text-[#A7ADB7]">
                  <span>Payment ID</span>
                  <span className="font-mono text-[10px] text-[#A7ADB7]">{order.payment.razorpay_payment_id}</span>
                </div>
              )}
              <div className="border-t border-[#252A31] pt-2 flex justify-between font-bold text-sm text-[#F5F7FA]">
                <span>Total Amount</span>
                <span className="text-indigo-400">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

