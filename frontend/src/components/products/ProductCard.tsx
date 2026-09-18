import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/formatters';
import { PRODUCT_FALLBACK_IMAGE } from '../../utils/constants';
import { getImageUrl } from '../../utils/imageUtils';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuthStore } from '../../stores/useAuthStore';
import { toast } from '../../stores/useToastStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const inWishlist = isWishlisted(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const imageUrl = getImageUrl(product.image);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-[#111418] rounded-xl border border-[#252A31] hover:border-[#38404B] hover:bg-[#15191F] transition-all duration-200 flex flex-col overflow-hidden relative h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
    >
      {/* Image Container — 4:3 Aspect Ratio with Object Contain */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#171B20] p-3 sm:p-4 flex items-center justify-center border-b border-[#252A31]">
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== PRODUCT_FALLBACK_IMAGE) {
              target.src = PRODUCT_FALLBACK_IMAGE;
            }
          }}
          className="w-full h-full object-contain object-center group-hover:scale-[1.02] transition-transform duration-200 ease-out"
        />

        {/* Sold Out Indicator — Understated Status Only (No numeric badges) */}
        {product.stock <= 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 bg-[#0B0D10]/95 text-rose-400 border border-rose-900/40 text-[10px] font-medium rounded uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Sold Out
          </div>
        )}

        {/* Wishlist Button — Small, Restrained & Accessible */}
        <button
          type="button"
          onClick={handleWishlistClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-lg border transition-all z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
            inWishlist
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-[#111418]/85 text-[#747B87] border-[#252A31] hover:text-[#F5F7FA] hover:bg-[#171B20] hover:border-[#38404B]'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-400 text-rose-400' : ''}`} />
        </button>
      </div>

      {/* Product Discovery Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="font-medium text-[#F5F7FA] text-xs sm:text-sm line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-snug group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold text-[#F5F7FA] tracking-tight">
            {formatCurrency(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
};

