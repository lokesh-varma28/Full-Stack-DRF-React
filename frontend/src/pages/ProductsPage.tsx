import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageX,
  RotateCcw,
  X,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCard } from '../components/products/ProductCard';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract initial filters from URL query string
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const orderingParam = (searchParams.get('ordering') as any) || '-created_at';

  const [search, setSearch] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [ordering, setOrdering] = useState<'price' | '-price' | 'name' | '-name' | 'created_at' | '-created_at'>(
    orderingParam
  );
  const [page, setPage] = useState(pageParam);
  const pageSize = 12;

  const { categories } = useCategories();

  // Debounce search input by 300ms to eliminate redundant network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state when URL query params change externally (e.g. browser back/forward or global search redirect)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    const urlOrdering = (searchParams.get('ordering') as any) || '-created_at';
    const urlPage = parseInt(searchParams.get('page') || '1', 10);

    if (urlSearch !== search) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlOrdering !== ordering) setOrdering(urlOrdering);
    if (urlPage !== page) setPage(urlPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync state with URL params whenever active filter state changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCategory) params.category = selectedCategory;
    if (ordering !== '-created_at') params.ordering = ordering;
    if (page > 1) params.page = page.toString();

    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategory, ordering, page, setSearchParams]);

  // Fetch products with backend filters
  const { products, count, isLoading, isError, refetch } = useProducts({
    page,
    size: pageSize,
    search: debouncedSearch.trim() || undefined,
    category: selectedCategory || undefined,
    ordering,
  });

  const totalPages = Math.ceil(count / pageSize);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setOrdering('-created_at');
    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(
    debouncedSearch.trim() || selectedCategory || ordering !== '-created_at'
  );

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 bg-[#0B0D10] text-[#F5F7FA]">
      {/* 1. Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] tracking-tight">
          Products
        </h1>
        <p className="text-xs sm:text-sm text-[#747B87]">
          Browse our collection
        </p>
      </div>

      {/* 2. Primary Product Search Bar — Single Clean Input */}
      <div className="relative max-w-2xl">
        <label htmlFor="products-search-input" className="sr-only">
          Search products
        </label>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#747B87] absolute left-3.5 pointer-events-none" />
          <input
            id="products-search-input"
            type="text"
            role="searchbox"
            aria-label="Search products"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 sm:h-12 pl-10 pr-10 bg-[#111418] text-[#F5F7FA] placeholder:text-[#747B87] border border-[#252A31] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#38404B] focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search input"
              className="absolute right-3 p-1 text-[#747B87] hover:text-[#F5F7FA] rounded-md hover:bg-[#171B20] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/40"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter & Sort Toolbar + Product Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-4 border-b border-[#252A31]">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <label htmlFor="category-filter" className="sr-only">
              Filter by Category
            </label>
            <select
              id="category-filter"
              aria-label="Filter by Category"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-7 h-9 sm:h-10 bg-[#111418] border border-[#252A31] hover:border-[#38404B] rounded-lg text-xs font-medium text-[#F5F7FA] focus:outline-none focus:border-[#38404B] focus:ring-1 focus:ring-indigo-500/30 cursor-pointer appearance-none transition-colors"
            >
              <option value="" className="bg-[#111418] text-[#F5F7FA]">
                All Categories
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#111418] text-[#F5F7FA]">
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-[#747B87] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#747B87] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Price Filter / Sort Dropdown */}
          <div className="relative">
            <label htmlFor="price-filter" className="sr-only">
              Filter by Price
            </label>
            <select
              id="price-filter"
              aria-label="Filter by Price"
              value={ordering === 'price' || ordering === '-price' ? ordering : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setOrdering(val as any);
                } else if (ordering === 'price' || ordering === '-price') {
                  setOrdering('-created_at');
                }
                setPage(1);
              }}
              className="pl-8 pr-7 h-9 sm:h-10 bg-[#111418] border border-[#252A31] hover:border-[#38404B] rounded-lg text-xs font-medium text-[#F5F7FA] focus:outline-none focus:border-[#38404B] focus:ring-1 focus:ring-indigo-500/30 cursor-pointer appearance-none transition-colors"
            >
              <option value="" className="bg-[#111418] text-[#F5F7FA]">
                Price: All
              </option>
              <option value="price" className="bg-[#111418] text-[#F5F7FA]">
                Price: Low to High
              </option>
              <option value="-price" className="bg-[#111418] text-[#F5F7FA]">
                Price: High to Low
              </option>
            </select>
            <Tag className="w-3.5 h-3.5 text-[#747B87] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#747B87] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <label htmlFor="sort-ordering" className="sr-only">
              Sort Products
            </label>
            <select
              id="sort-ordering"
              aria-label="Sort Products"
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value as any);
                setPage(1);
              }}
              className="pl-8 pr-7 h-9 sm:h-10 bg-[#111418] border border-[#252A31] hover:border-[#38404B] rounded-lg text-xs font-medium text-[#F5F7FA] focus:outline-none focus:border-[#38404B] focus:ring-1 focus:ring-indigo-500/30 cursor-pointer appearance-none transition-colors"
            >
              <option value="-created_at" className="bg-[#111418] text-[#F5F7FA]">
                Newest Arrivals
              </option>
              <option value="name" className="bg-[#111418] text-[#F5F7FA]">
                Name: A to Z
              </option>
              <option value="-name" className="bg-[#111418] text-[#F5F7FA]">
                Name: Z to A
              </option>
              <option value="price" className="bg-[#111418] text-[#F5F7FA]">
                Price: Low to High
              </option>
              <option value="-price" className="bg-[#111418] text-[#F5F7FA]">
                Price: High to Low
              </option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#747B87] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-[#747B87] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-9 sm:h-10 px-3 text-xs text-rose-400 hover:bg-rose-950/30 border border-rose-900/40 rounded-lg font-medium flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
              title="Reset all filters"
              aria-label="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* 4. Product Count */}
        <div className="text-xs font-medium text-[#A7ADB7] shrink-0 self-center sm:self-auto">
          {isLoading ? (
            <span className="text-[#747B87]">Updating items...</span>
          ) : count > 0 ? (
            <span>
              <span className="text-[#F5F7FA] font-semibold">{count}</span>{' '}
              {count === 1 ? 'Product' : 'Products'}
            </span>
          ) : (
            <span className="text-[#747B87]">0 Products</span>
          )}
        </div>
      </div>

      {/* 5. Product Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-80 bg-[#111418] rounded-xl border border-[#252A31] animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-12 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-300">
            Failed to load products from server.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[#111418] rounded-xl border border-[#252A31] p-12 sm:p-16 text-center space-y-4 max-w-md mx-auto my-6">
          <div className="w-14 h-14 bg-[#171B20] border border-[#252A31] rounded-xl flex items-center justify-center text-[#747B87] mx-auto">
            <PackageX className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-[#F5F7FA] text-lg">No Products Found</h3>
          <p className="text-xs text-[#747B87] leading-relaxed">
            We couldn't find any products matching your active search or filter criteria. Try searching for another keyword or reset filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Products pagination"
              className="flex items-center justify-center gap-3 pt-8 border-t border-[#252A31]"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="p-2.5 rounded-lg border border-[#252A31] bg-[#111418] text-[#A7ADB7] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#171B20] hover:text-[#F5F7FA] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-medium text-[#A7ADB7] px-3">
                Page <span className="text-[#F5F7FA] font-semibold">{page}</span> of{' '}
                <span className="text-[#F5F7FA] font-semibold">{totalPages}</span>
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
                className="p-2.5 rounded-lg border border-[#252A31] bg-[#111418] text-[#A7ADB7] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#171B20] hover:text-[#F5F7FA] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

