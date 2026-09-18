import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import { PRODUCT_FALLBACK_IMAGE } from '../utils/constants';
import { toast } from '../stores/useToastStore';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, itemCount, isLoading, updateCartItem, removeCartItem, isUpdatingCartItem } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-[#111418] border border-[#252A31] rounded-lg w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalPrice = cart?.total_price || 0;

  const handleQuantityChange = async (itemId: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItem({ id: itemId, data: { quantity: newQty } });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update item quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem(itemId);
      toast.info('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 rounded-xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#F5F7FA]">Your Cart is Empty</h2>
        <p className="text-xs text-[#747B87] leading-relaxed">
          Looks like you haven't added any products to your cart yet. Explore our top products and start shopping!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-[#747B87] mt-1">Review your selected items ({itemCount} total)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isInvalidImage = !item.product_image || item.product_image.includes('unsplash');
            const imageUrl = isInvalidImage ? PRODUCT_FALLBACK_IMAGE : item.product_image!;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 bg-[#111418] rounded-xl border border-[#252A31] flex items-center gap-4 sm:gap-6"
              >
                {/* Image */}
                <Link to={`/products/${item.product}`} className="w-20 h-20 shrink-0 bg-[#171B20] border border-[#252A31] rounded-lg overflow-hidden p-2 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt={item.product_name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== PRODUCT_FALLBACK_IMAGE) {
                        target.src = PRODUCT_FALLBACK_IMAGE;
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    to={`/products/${item.product}`}
                    className="font-medium text-[#F5F7FA] text-sm hover:text-indigo-400 truncate block transition-colors"
                  >
                    {item.product_name}
                  </Link>
                  <p className="text-xs text-[#747B87] font-medium">{formatCurrency(item.product_price)} each</p>

                  <div className="pt-2 flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#252A31] rounded-lg bg-[#171B20] p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={isUpdatingCartItem}
                        className="p-1 text-[#A7ADB7] hover:text-[#F5F7FA] disabled:opacity-30 rounded"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#F5F7FA]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        disabled={isUpdatingCartItem}
                        className="p-1 text-[#A7ADB7] hover:text-[#F5F7FA] disabled:opacity-30 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-bold text-sm text-[#F5F7FA]">
                      {formatCurrency(item.total_price)}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-[#747B87] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-[#111418] p-6 sm:p-8 rounded-xl border border-[#252A31] space-y-6 sticky top-24">
          <h2 className="font-bold text-[#F5F7FA] text-lg border-b border-[#252A31] pb-4">Order Summary</h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-[#A7ADB7]">
              <span>Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-[#F5F7FA]">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[#A7ADB7]">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-emerald-400 uppercase">FREE</span>
            </div>
            <div className="border-t border-[#252A31] pt-3 flex justify-between text-[#F5F7FA] font-bold text-base">
              <span>Total Amount</span>
              <span className="text-indigo-400">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#747B87] font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Guaranteed 256-bit encrypted checkout
          </div>
        </div>
      </div>
    </div>
  );
};

