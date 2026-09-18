import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Package,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCard } from '../components/products/ProductCard';
import { getImageUrl } from '../utils/imageUtils';
import { PRODUCT_FALLBACK_IMAGE } from '../utils/constants';

export const HomePage: React.FC = () => {
  const {
    products,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts({ size: 8 });

  const {
    categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  // Extract up to 3 real products for the dark editorial collage
  const collageProducts = products && products.length > 0 ? products.slice(0, 3) : [];

  return (
    <div className="bg-[#0B0D10] text-[#F5F7FA] pb-10 sm:pb-12">
      {/* 1. ANNOUNCEMENT / TRUST STRIP — Compact ~32-36px Desktop, ~34-42px Mobile */}
      <div className="border-b border-[#252A31] bg-[#0E1115]/80 text-[#A7ADB7] text-[11px] sm:text-xs h-[36px] sm:h-[34px] px-4 flex items-center justify-center font-normal tracking-wide">
        <div className="max-w-[1240px] mx-auto flex items-center justify-center gap-x-4 sm:gap-x-6">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            Free Express Delivery over ₹999
          </span>
          <span className="hidden sm:inline text-[#252A31]">•</span>
          <span className="hidden sm:flex items-center gap-1.5">
            Guaranteed Quality Assurance
          </span>
          <span className="hidden md:inline text-[#252A31]">•</span>
          <span className="hidden md:flex items-center gap-1.5">
            Secure Razorpay Checkout
          </span>
        </div>
      </div>

      {/* 2. HERO — Premium Editorial (~300-340px Desktop, ~280-330px Mobile, 55% Content / 45% Visual) */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-3 sm:mt-4">
        <div className="bg-[#111418] rounded-2xl border border-[#252A31] p-5 sm:p-6 lg:py-6 lg:px-8 min-h-[290px] lg:h-[320px] flex flex-col justify-center relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Copy & Refined CTAs (~55% Desktop) */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-3.5 text-left z-10">
              <div className="flex items-center gap-2">
                <span className="h-px w-4 sm:w-5 bg-indigo-500/70 inline-block" />
                <span className="text-[11px] sm:text-xs font-semibold text-[#747B87] uppercase tracking-[0.2em]">
                  CURATED FOR EVERYDAY LIVING
                </span>
              </div>

              <h1 className="text-[30px] sm:text-[34px] lg:text-[44px] xl:text-[48px] font-semibold tracking-tight text-[#F5F7FA] leading-[1.05]">
                Discover products you'll love.
              </h1>

              <p className="text-[#A7ADB7] text-xs sm:text-sm max-w-md leading-relaxed font-normal">
                Explore thoughtfully selected products across categories, designed to make everyday shopping simpler.
              </p>

              <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-1.5">
                <Link
                  to="/products"
                  className="h-11 px-5 sm:px-6 bg-[#6366F1] hover:bg-[#5254db] text-white font-medium text-xs sm:text-sm rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  Shop Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="#categories"
                  className="h-11 px-4 sm:px-5 bg-transparent hover:bg-[#171B20] text-[#F5F7FA] font-medium text-xs sm:text-sm rounded-lg border border-[#252A31] hover:border-[#38404B] transition-colors inline-flex items-center justify-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  Explore Categories
                </a>
              </div>
            </div>

            {/* Right Column: Editorial Merchandise Composition (~45% Desktop) */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              {collageProducts.length >= 2 ? (
                /* Asymmetric Dark Editorial Product Composition — Compact Proportions */
                <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] h-[140px] sm:h-[180px] lg:h-[210px] flex items-center justify-center select-none">
                  
                  {/* Collage Item 3 (Subtle Background Frame if present) */}
                  {collageProducts[2] && (
                    <div className="absolute top-1 right-1 sm:top-1.5 sm:right-2 w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-[#171B20] rounded-xl border border-[#252A31] p-2 shadow-md transform rotate-6 scale-90 z-0 overflow-hidden pointer-events-none">
                      <img
                        src={getImageUrl(collageProducts[2].image)}
                        alt={collageProducts[2].name || 'Featured product'}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== PRODUCT_FALLBACK_IMAGE) target.src = PRODUCT_FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-contain filter opacity-60"
                      />
                    </div>
                  )}

                  {/* Collage Item 1 (Main Dominant Visual Frame) */}
                  <div className="absolute top-1 left-1 sm:top-1.5 sm:left-2 w-28 h-28 sm:w-36 sm:h-36 lg:w-42 lg:h-42 bg-[#171B20] rounded-xl border border-[#252A31] p-2.5 sm:p-3 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300 z-10 overflow-hidden">
                    <img
                      src={getImageUrl(collageProducts[0].image)}
                      alt={collageProducts[0].name || 'Featured product'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== PRODUCT_FALLBACK_IMAGE) target.src = PRODUCT_FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Collage Item 2 (Secondary Overlapping Frame) */}
                  <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-3 w-22 h-22 sm:w-28 sm:h-28 lg:w-34 lg:h-34 bg-[#171B20] rounded-xl border border-[#252A31] p-2 sm:p-2.5 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300 z-20 overflow-hidden">
                    <img
                      src={getImageUrl(collageProducts[1].image)}
                      alt={collageProducts[1].name || 'Featured product'}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== PRODUCT_FALLBACK_IMAGE) target.src = PRODUCT_FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                /* Fallback Dark Editorial Visual Composition */
                <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] h-[140px] sm:h-[180px] lg:h-[210px] flex items-center justify-center">
                  <div className="w-full h-full bg-[#171B20] rounded-xl border border-[#252A31] p-4 sm:p-5 flex flex-col justify-between shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#252A31] pb-2">
                      <span className="text-[10px] font-semibold text-[#747B87] tracking-widest uppercase">
                        APEX STORE • CATALOG
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </div>

                    <div className="space-y-1.5 py-2">
                      <div className="h-2 w-3/4 bg-[#252A31] rounded" />
                      <div className="h-2 w-1/2 bg-[#252A31] rounded" />
                      <div className="h-2 w-5/6 bg-[#252A31] rounded" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#252A31] text-[10px] sm:text-[11px] font-medium text-[#A7ADB7]">
                      <span>Thoughtfully Selected</span>
                      <span className="text-[#F5F7FA] font-medium">Premium Quality</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION — Immediate Product Discovery (40-56px rhythm below Hero) */}
      <section className="mt-10 sm:mt-12 lg:mt-14 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 pb-2.5 border-b border-[#252A31] gap-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#747B87] uppercase tracking-[0.2em] block">
              FEATURED PRODUCTS
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#F5F7FA] tracking-tight mt-0.5">
              Discover what's worth bringing home.
            </h2>
            <p className="text-xs sm:text-sm text-[#747B87] mt-0.5">
              Explore our latest selection.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-medium text-[#A7ADB7] hover:text-[#F5F7FA] inline-flex items-center gap-1 transition-colors self-start sm:self-end focus:outline-none focus-visible:text-[#F5F7FA] group pt-1 sm:pt-0"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 sm:h-72 bg-[#111418] rounded-xl border border-[#252A31] animate-pulse" />
            ))}
          </div>
        ) : productsError ? (
          <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div>
              <h3 className="font-semibold text-rose-300 text-base">Unable to load products</h3>
              <p className="text-xs text-rose-400 mt-1">Please check connection and retry.</p>
            </div>
            <button
              onClick={() => refetchProducts()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-all cursor-pointer"
            >
              Retry Loading Products
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#111418] rounded-xl border border-[#252A31] p-10 text-center space-y-2 max-w-md mx-auto">
            <Package className="w-8 h-8 text-[#747B87] mx-auto" />
            <h3 className="font-semibold text-[#F5F7FA] text-sm">No Products Listed</h3>
            <p className="text-xs text-[#747B87]">There are currently no active items in the database.</p>
          </div>
        ) : (
          /* Responsive Discovery Grid: 2 columns on mobile, 3 columns on tablet, 4 columns on desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. COMPACT CATEGORY SECTION — Secondary Navigation (56-72px rhythm below Products) */}
      <section id="categories" className="mt-14 sm:mt-16 lg:mt-18 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        {/* Compact Header: Eyebrow + Heading + Short subtitle on left, small text link on right (below on mobile) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 pb-2.5 border-b border-[#252A31] gap-2">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#747B87] uppercase tracking-[0.2em] block">
              SHOP BY CATEGORY
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#F5F7FA] tracking-tight mt-0.5">
              Explore Collections
            </h2>
            <p className="text-xs sm:text-sm text-[#747B87] mt-0.5">
              Find your next favorite.
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-medium text-[#A7ADB7] hover:text-[#F5F7FA] inline-flex items-center gap-1 transition-colors self-start sm:self-end focus:outline-none focus-visible:text-[#F5F7FA] group pt-1 sm:pt-0"
          >
            <span>View all categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5">
            {[1, 2].map((n) => (
              <div key={n} className="h-[148px] sm:h-[160px] lg:h-[172px] bg-[#111418] rounded-[14px] border border-[#252A31] animate-pulse" />
            ))}
          </div>
        ) : categoriesError ? (
          <div className="p-5 bg-rose-950/30 border border-rose-900/40 rounded-[14px] text-center space-y-2">
            <p className="text-xs font-medium text-rose-400">Failed to load categories</p>
            <button
              onClick={() => refetchCategories()}
              className="text-xs text-rose-300 font-semibold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6 bg-[#111418] border border-[#252A31] rounded-[14px] text-center text-[#747B87] text-xs">
            No categories currently listed.
          </div>
        ) : (
          /* Compact Premium Category Grid: 2 columns on desktop/tablet, 1 column stacked on mobile */
          <div
            className={
              categories.length <= 2
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5'
            }
          >
            {categories.map((cat, index) => {
              const catImageUrl = cat.image ? getImageUrl(cat.image) : null;
              const indexMarker = String(index + 1).padStart(2, '0');
              
              // Concise subtitle from real API data
              let subtitle = 'Browse collection';
              if (cat.description) {
                const desc = cat.description.trim();
                if (desc.length <= 26) {
                  subtitle = desc;
                } else {
                  const parts = desc.split(',').map((p) => p.trim()).filter(Boolean);
                  if (parts.length >= 2 && parts[0].length + parts[1].length + 3 <= 26) {
                    subtitle = `${parts[0]} & ${parts[1]}`;
                  } else if (parts.length > 0 && parts[0].length <= 26) {
                    subtitle = parts[0];
                  } else {
                    subtitle = desc.slice(0, 24);
                  }
                }
              }

              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  title={cat.name}
                  aria-label={`Explore ${cat.name} collection`}
                  className="group p-4 sm:p-5 lg:p-6 bg-[#111418] hover:bg-[#171B20] rounded-[14px] border border-[#252A31] hover:border-[#38404B] transition-all duration-200 flex flex-col justify-between h-[148px] sm:h-[160px] lg:h-[172px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-mono font-medium text-[#747B87] tracking-wider block">
                        {indexMarker}
                      </span>
                      <h3 className="font-semibold text-[#F5F7FA] text-base sm:text-lg tracking-tight group-hover:text-indigo-400 transition-colors truncate mt-1">
                        {cat.name}
                      </h3>
                    </div>

                    {catImageUrl && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-lg bg-[#171B20] border border-[#252A31] p-1 shrink-0 overflow-hidden">
                        <img
                          src={catImageUrl}
                          alt={cat.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          className="w-full h-full object-cover rounded-md group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#747B87] group-hover:text-[#A7ADB7] transition-colors truncate">
                      {subtitle}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#747B87] group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. COMPACT TRUST / SERVICE STRIP — 56-72px Desktop, 80-100px Mobile (40-48px rhythm from categories) */}
      <section className="mt-10 sm:mt-12 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111418] rounded-[14px] border border-[#252A31] h-[88px] sm:h-[64px] px-3.5 sm:px-6 lg:px-8 flex items-center">
          {/* Mobile: 2x2 Grid (80-100px) | Desktop: Single Row (56-72px) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 w-full items-center sm:divide-x sm:divide-[#252A31]">
            
            {/* Item 1: Verified Quality */}
            <div className="flex items-center sm:justify-center gap-2 sm:gap-2.5 px-1 sm:px-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-[#F5F7FA] tracking-tight leading-tight truncate">
                  Verified Quality
                </p>
                <p className="hidden sm:block text-[10px] sm:text-[11px] text-[#747B87] truncate">
                  Genuine products
                </p>
              </div>
            </div>

            {/* Item 2: Secure Checkout */}
            <div className="flex items-center sm:justify-center gap-2 sm:gap-2.5 px-1 sm:px-2">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-[#F5F7FA] tracking-tight leading-tight truncate">
                  Secure Checkout
                </p>
                <p className="hidden sm:block text-[10px] sm:text-[11px] text-[#747B87] truncate">
                  Razorpay encrypted
                </p>
              </div>
            </div>

            {/* Item 3: Express Delivery */}
            <div className="flex items-center sm:justify-center gap-2 sm:gap-2.5 px-1 sm:px-2">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-[#F5F7FA] tracking-tight leading-tight truncate">
                  Express Delivery
                </p>
                <p className="hidden sm:block text-[10px] sm:text-[11px] text-[#747B87] truncate">
                  Carefully dispatched
                </p>
              </div>
            </div>

            {/* Item 4: Easy Returns */}
            <div className="flex items-center sm:justify-center gap-2 sm:gap-2.5 px-1 sm:px-2">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-[#F5F7FA] tracking-tight leading-tight truncate">
                  Easy Returns
                </p>
                <p className="hidden sm:block text-[10px] sm:text-[11px] text-[#747B87] truncate">
                  7-Day policy
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
