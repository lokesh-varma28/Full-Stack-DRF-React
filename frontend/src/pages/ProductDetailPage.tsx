import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  Heart,
  Minus,
  Plus,
  ArrowLeft,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuthStore } from '../stores/useAuthStore';
import { formatCurrency } from '../utils/formatters';
import { PRODUCT_FALLBACK_IMAGE } from '../utils/constants';
import { getImageUrl } from '../utils/imageUtils';
import { toast } from '../stores/useToastStore';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;

  const { product, isLoading, isError } = useProduct(productId);
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart, isAddingToCart } = useCart();

  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-[#111418] border border-[#252A31] rounded-xl" />
          <div className="space-y-6">
            <div className="h-8 bg-[#111418] border border-[#252A31] rounded-lg w-3/4" />
            <div className="h-6 bg-[#111418] border border-[#252A31] rounded-lg w-1/4" />
            <div className="h-24 bg-[#111418] border border-[#252A31] rounded-lg" />
            <div className="h-12 bg-[#111418] border border-[#252A31] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-[#F5F7FA]">Product Not Found</h2>
        <p className="text-xs text-[#747B87]">The product you requested does not exist or has been removed.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const inWishlist = isWishlisted(product.id);
  const imageUrl = getImageUrl(product.image);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to save items to your wishlist.', 'Login Required');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product.id);
      toast.success(
        inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        product.name
      );
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart.', 'Login Required');
      navigate('/login');
      return;
    }
    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }
    try {
      await addToCart({ product: product.id, quantity });
      toast.success(`Added ${quantity} item(s) to cart!`, product.name);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to proceed to checkout.', 'Login Required');
      navigate('/login');
      return;
    }
    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }
    navigate(`/checkout?direct_product=${product.id}&quantity=${quantity}`);
  };

  const categoryName = product.category
    ? typeof product.category === 'object'
      ? product.category.name
      : `Category #${product.category}`
    : 'General';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#A7ADB7] hover:text-[#F5F7FA] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {/* Product Image Display Area */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#171B20] border border-[#252A31] p-6 flex items-center justify-center">
            <img
              src={imageUrl}
              alt={product.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== PRODUCT_FALLBACK_IMAGE) {
                  target.src = PRODUCT_FALLBACK_IMAGE;
                }
              }}
              className="w-full h-full object-contain object-center"
            />
            {/* Floating Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-lg border transition-all ${
                inWishlist
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-[#111418]/80 text-[#747B87] border-[#252A31] hover:text-[#F5F7FA] hover:bg-[#171B20]'
              }`}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-400 text-rose-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Details & Primary Actions */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-[#171B20] text-[#A7ADB7] border border-[#252A31] text-xs font-medium rounded-md">
              {categoryName}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA] tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-3xl font-bold text-[#F5F7FA] tracking-tight">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-[#747B87] font-medium">Inclusive of all taxes</span>
            </div>

            {/* Stock status indicator */}
            <div className="pt-1">
              {product.stock <= 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-950/40 border border-rose-900/50 text-rose-400 text-xs font-medium rounded-md">
                  <AlertCircle className="w-4 h-4 text-rose-400" /> Out of Stock
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs font-medium rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> In Stock ({product.stock} items remaining)
                </div>
              )}
            </div>

            <p className="text-sm text-[#A7ADB7] leading-relaxed pt-3 border-t border-[#252A31]">
              {product.description ||
                'Experience premium build quality and superior performance with this carefully designed product.'}
            </p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-5 pt-6 border-t border-[#252A31]">
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A7ADB7]">Quantity</label>
                <div className="flex items-center border border-[#252A31] rounded-lg bg-[#171B20] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-[#A7ADB7] hover:text-[#F5F7FA] disabled:opacity-30 rounded hover:bg-[#20252D] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#F5F7FA]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 text-[#A7ADB7] hover:text-[#F5F7FA] disabled:opacity-30 rounded hover:bg-[#20252D] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions: Add to Cart (Standard Secondary) & Buy Now (Prominent Conversion CTA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAddingToCart}
                className="w-full py-3.5 px-6 bg-[#171B20] hover:bg-[#20252D] active:bg-[#111418] disabled:opacity-40 text-[#F5F7FA] border border-[#252A31] font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#A7ADB7]" /> Add to Cart
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" /> Buy Now
              </button>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#111418] border border-[#252A31] rounded-xl text-center text-[#A7ADB7] text-xs font-medium">
            <div className="space-y-1">
              <Truck className="w-5 h-5 mx-auto text-indigo-400" />
              <span>Fast Shipping</span>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-indigo-400" />
              <span>Razorpay Safe</span>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-indigo-400" />
              <span>Easy Return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

