import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { useOrder } from '../hooks/useOrders';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id, 10) : null;
  const { order, isLoading } = useOrder(orderId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div className="w-20 h-20 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Order Placed Successfully!</h1>
        <p className="text-xs text-[#747B87] max-w-md mx-auto">
          Thank you for your purchase. Your payment has been verified and your order is being processed.
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
      ) : order ? (
        <div className="bg-[#111418] p-6 sm:p-8 rounded-xl border border-[#252A31] text-left space-y-4 text-xs">
          <div className="flex justify-between border-b border-[#252A31] pb-3">
            <span className="text-[#A7ADB7]">Order ID</span>
            <span className="font-semibold text-[#F5F7FA]">#{order.id}</span>
          </div>
          <div className="flex justify-between border-b border-[#252A31] pb-3">
            <span className="text-[#A7ADB7]">Date</span>
            <span className="font-semibold text-[#F5F7FA]">{formatDate(order.created_at)}</span>
          </div>
          <div className="flex justify-between border-b border-[#252A31] pb-3">
            <span className="text-[#A7ADB7]">Payment Status</span>
            <span className="font-semibold text-emerald-400 uppercase">Paid</span>
          </div>
          <div className="flex justify-between border-b border-[#252A31] pb-3">
            <span className="text-[#A7ADB7]">Razorpay Payment ID</span>
            <span className="font-mono text-[#F5F7FA]">{order.payment?.razorpay_payment_id || 'Verified'}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-[#F5F7FA] pt-1">
            <span>Total Amount Paid</span>
            <span className="text-indigo-400">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {orderId && (
          <Link
            to={`/orders/${orderId}`}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2"
          >
            <PackageCheck className="w-4 h-4" /> View Order Details
          </Link>
        )}
        <Link
          to="/products"
          className="px-6 py-3 bg-[#171B20] hover:bg-[#20252D] text-[#F5F7FA] border border-[#252A31] font-semibold text-xs rounded-lg flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

