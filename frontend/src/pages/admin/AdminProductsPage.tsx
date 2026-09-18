import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useProducts, PRODUCTS_QUERY_KEY } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { productsApi } from '../../api/products';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/formatters';
import { PRODUCT_FALLBACK_IMAGE } from '../../utils/constants';
import { getImageUrl } from '../../utils/imageUtils';
import { normalizeError } from '../../utils/error';
import { toast } from '../../stores/useToastStore';

export const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { products, count: totalCount, isLoading, refetch } = useProducts({ size: 100 });
  const { categories } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter products based on search, category and stock filter
  const filteredProducts = products.filter((p) => {
    // Search match
    const matchesSearch =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toString().includes(searchTerm);

    // Category match
    const categoryId = p.category
      ? typeof p.category === 'object'
        ? p.category.id.toString()
        : p.category.toString()
      : '';
    const matchesCategory = !selectedCategory || categoryId === selectedCategory;

    // Stock / Status filter match
    let matchesFilter = true;
    if (stockFilter === 'active') matchesFilter = p.is_active;
    else if (stockFilter === 'inactive') matchesFilter = !p.is_active;
    else if (stockFilter === 'low_stock') matchesFilter = p.stock > 0 && p.stock <= 5;
    else if (stockFilter === 'out_of_stock') matchesFilter = p.stock <= 0;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);

    try {
      await productsApi.deleteProduct(deletingProduct.id);
      toast.success(`Product "${deletingProduct.name}" deleted successfully.`);

      await queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] });
      refetch();

      setDeletingProduct(null);
    } catch (err: any) {
      const normalized = normalizeError(err);
      toast.error(normalized.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-5">
          <div>
            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
              PRODUCTS
            </span>
            <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">
              Product Inventory
            </h1>
            <p className="text-xs text-[#A7ADB7] mt-0.5">
              Manage catalog products, stock counts, pricing and availability.
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>

        {/* Filter and Search Control Bar */}
        <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#747B87] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search products by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3.5 bg-[#171B20] text-[#F5F7FA] text-xs placeholder:text-[#747B87] border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#747B87]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 bg-[#171B20] text-[#F5F7FA] text-xs border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status / Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-10 px-3 bg-[#171B20] text-[#F5F7FA] text-xs border border-[#252A31] rounded-lg focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="low_stock">Low Stock (≤5)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {isLoading ? (
          <div className="bg-[#111418] border border-[#252A31] rounded-xl p-12 text-center text-xs text-[#747B87]">
            <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin mx-auto mb-2" />
            Loading catalog inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-[#111418] border border-[#252A31] rounded-xl p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-[#747B87] mx-auto" />
            <h3 className="text-sm font-bold text-[#F5F7FA]">No Products Found</h3>
            <p className="text-xs text-[#A7ADB7] max-w-sm mx-auto">
              {searchTerm || selectedCategory || stockFilter !== 'all'
                ? 'No items match your active search or filter criteria.'
                : 'Your catalog is empty. Click above to create your first product.'}
            </p>
          </div>
        ) : (
          <div className="bg-[#111418] border border-[#252A31] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#171B20] border-b border-[#252A31] text-[#A7ADB7] uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-5">Product</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Price</th>
                    <th className="py-3.5 px-5">Stock</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A31]/50 text-[#F5F7FA]">
                  {filteredProducts.map((p) => {
                    const productImageUrl = getImageUrl(p.image);
                    const categoryName = p.category
                      ? typeof p.category === 'object'
                        ? p.category.name
                        : categories.find((c) => c.id === p.category)?.name || 'Category #' + p.category
                      : 'General';

                    return (
                      <tr key={p.id} className="hover:bg-[#171B20]/60 transition-colors">
                        <td className="py-3.5 px-5 flex items-center gap-3">
                          <img
                            src={productImageUrl}
                            alt={p.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                            }}
                            className="w-10 h-10 rounded-lg object-cover bg-[#171B20] border border-[#252A31] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-[#F5F7FA] block truncate max-w-xs">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#747B87]">ID #{p.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[#A7ADB7]">
                          <span className="px-2.5 py-1 bg-[#171B20] border border-[#252A31] text-[11px] font-medium rounded-md">
                            {categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-[#F5F7FA]">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="py-3.5 px-5">
                          {p.stock <= 0 ? (
                            <span className="text-rose-400 font-semibold">0 (Out of Stock)</span>
                          ) : p.stock <= 5 ? (
                            <span className="text-amber-400 font-semibold">{p.stock} units (Low)</span>
                          ) : (
                            <span className="text-[#A7ADB7]">{p.stock} units</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {p.is_active ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-800/40">
                              <AlertCircle className="w-3 h-3" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-1">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            aria-label={`Edit ${p.name}`}
                            className="p-1.5 inline-block text-[#A7ADB7] hover:text-[#6366F1] hover:bg-[#171B20] rounded-md transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingProduct(p)}
                            aria-label={`Delete ${p.name}`}
                            className="p-1.5 text-[#747B87] hover:text-rose-400 hover:bg-[#171B20] rounded-md transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#111418] rounded-xl max-w-md w-full p-6 border border-[#252A31] space-y-5 shadow-2xl">
              <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-[#F5F7FA] text-base">Delete Product</h3>
                <p className="text-xs text-[#A7ADB7] leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold text-[#F5F7FA]">"{deletingProduct.name}"</span>?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeletingProduct(null)}
                  className="w-full py-2 bg-[#171B20] hover:bg-[#252A31] text-[#F5F7FA] font-semibold text-xs rounded-lg border border-[#252A31] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
