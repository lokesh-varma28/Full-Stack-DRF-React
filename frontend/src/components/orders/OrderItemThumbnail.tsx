import React from 'react';
import { Product } from '../../types/product';
import { PRODUCT_FALLBACK_IMAGE } from '../../utils/constants';
import { getImageUrl } from '../../utils/imageUtils';

export interface OrderItemThumbnailProps {
  product?: Product | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

export const OrderItemThumbnail: React.FC<OrderItemThumbnailProps> = ({
  product,
  className = '',
  size,
  alt,
}) => {
  const isProductObj = typeof product === 'object' && product !== null;
  const imageField = isProductObj ? product.image : null;
  const imageUrl = getImageUrl(imageField);

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const hasExplicitDimension = className.includes('w-') || className.includes('h-');
  const resolvedSizeClass = size ? sizeClasses[size] : hasExplicitDimension ? '' : 'w-10 h-10';
  const productName = isProductObj ? product.name : 'Product';

  return (
    <div
      className={`bg-[#171B20] border border-[#252A31] rounded-lg overflow-hidden shrink-0 p-1 flex items-center justify-center ${resolvedSizeClass} ${className}`.trim().replace(/\s+/g, ' ')}
    >
      <img
        src={imageUrl}
        alt={alt || productName || 'Product'}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== PRODUCT_FALLBACK_IMAGE) {
            target.src = PRODUCT_FALLBACK_IMAGE;
          }
        }}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
};

export default OrderItemThumbnail;

