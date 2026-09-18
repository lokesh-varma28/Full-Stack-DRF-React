import React from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, ArrowRight, XCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from '../stores/useToastStore';

export const OrdersPage: React.FC = () => {
  const { orders, isLoading, cancelOrder, isCancellingOrder } = useOrders();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-[#111418] border border-[#252A31] rounded-lg w-48 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const handleCancelOrder = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await cancelOrder(id);
        toast.info(`Order #${id} has been cancelled.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to cancel order.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">My Orders</h1>
        <p className="text-xs text-[#747B87] mt-1">Track and manage your order history</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#111418] rounded-xl border border-[#252A31] p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 rounded-xl flex items-center justify-center mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-[#F5F7FA] text-lg">No Orders Yet</h3>
          <p className="text-xs text-[#747B87] leading-relaxed">
            You haven't placed any orders yet. Explore our products and place your first order!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 bg-[#111418] rounded-xl border border-[#252A31] hover:border-[#3B424E] transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252A31] pb-4">
                <div>
                  <span className="font-bold text-[#F5F7FA] text-sm">Order #{order.id}</span>
                  <span className="text-xs text-[#747B87] block mt-0.5">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-bold text-base text-[#F5F7FA]">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="space-y-1 text-xs">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-[#A7ADB7]">
                    <span>
                      {item.product ? item.product.name : 'Product'} x {item.quantity}
                    </span>
                    <span className="font-medium text-[#F5F7FA]">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#252A31] text-xs">
                {order.status === 'created' ? (
                  <button
                    type="button"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={isCancellingOrder}
                    className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                ) : (
                  <span className="text-[11px] text-[#747B87] font-medium">
                    Delivery to: {order.delivery_full_name} ({order.delivery_city})
                  </span>
                )}

                <Link
                  to={`/orders/${order.id}`}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

