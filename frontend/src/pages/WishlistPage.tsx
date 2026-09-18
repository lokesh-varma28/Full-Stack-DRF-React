import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import { PRODUCT_FALLBACK_IMAGE } from '../utils/constants';
import { toast } from '../stores/useToastStore';

export const WishlistPage: React.FC = () => {
  const { wishlist, itemCount, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-[#111418] border border-[#252A31] rounded-lg w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-72 bg-[#111418] border border-[#252A31] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 bg-rose-950/40 text-rose-400 border border-rose-900/50 rounded-xl flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#F5F7FA]">Your Wishlist is Empty</h2>
        <p className="text-xs text-[#747B87] leading-relaxed">
          Save your favorite products to your wishlist so you can revisit and purchase them anytime.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Discover Products
        </Link>
      </div>
    );
  }

  const handleMoveToCart = async (productId: number, productName: string) => {
    try {
      await addToCart({ product: productId, quantity: 1 });
      await removeFromWishlist(productId);
      toast.success(`Moved ${productName} to cart!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to move product to cart');
    }
  };

  const handleRemove = async (productId: number, productName: string) => {
    try {
      await removeFromWishlist(productId);
      toast.info(`Removed ${productName} from wishlist.`);
    } catch {
      toast.error('Failed to remove item.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#0B0D10] text-[#F5F7FA]">
      <div>
        <h1 className="text-3xl font-bold text-[#F5F7FA] tracking-tight">Saved Wishlist</h1>
        <p className="text-xs text-[#747B87] mt-1">Items you saved for later ({itemCount} total)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;
          const isInvalidImage = !product.image || product.image.includes('unsplash');
          const imageUrl = isInvalidImage ? PRODUCT_FALLBACK_IMAGE : product.image!;

          return (
            <div
              key={item.id}
              className="bg-[#111418] rounded-xl border border-[#252A31] hover:border-[#3B424E] flex flex-col justify-between overflow-hidden group transition-all duration-200"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#171B20] p-4 flex items-center justify-center border-b border-[#252A31]">
                <img
                  src={imageUrl}
                  alt={product.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PRODUCT_FALLBACK_IMAGE) {
                      target.src = PRODUCT_FALLBACK_IMAGE;
                    }
                  }}
                  className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(product.id, product.name)}
                  className="absolute top-3 right-3 p-2 bg-[#111418]/80 text-rose-400 border border-[#252A31] hover:bg-rose-950/40 hover:border-rose-900/50 rounded-lg transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="font-medium text-[#F5F7FA] text-sm hover:text-indigo-400 line-clamp-1 block transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs font-semibold text-[#F5F7FA] mt-1">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleMoveToCart(product.id, product.name)}
                  disabled={product.stock <= 0}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

