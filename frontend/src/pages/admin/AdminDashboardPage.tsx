import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  Plus,
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Edit2,
  Clock,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUtils';
import { PRODUCT_FALLBACK_IMAGE } from '../../utils/constants';

export const AdminDashboardPage: React.FC = () => {
  const { products, count: productCount, isLoading: productsLoading } = useProducts({ size: 100 });
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { orders, isLoading: ordersLoading } = useAdminOrders();

  const activeProductsCount = products.filter((p) => p.is_active).length;
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  return (
    <AdminLayout>
      <div className="space-[#1b2028] space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-5">
          <div>
            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
              ADMINISTRATION
            </span>
            <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">Overview</h1>
            <p className="text-xs text-[#A7ADB7] mt-0.5">
              Manage your store, products, inventory and orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products/new"
              className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* KPI / Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Total Products */}
          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl hover:border-[#3B424E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Total Products
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-[#6366F1] rounded-lg flex items-center justify-center border border-[#252A31]">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F5F7FA]">{productCount || products.length}</span>
              <span className="text-[11px] text-[#747B87]">in catalog</span>
            </div>
          </div>

          {/* Active Products */}
          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl hover:border-[#3B424E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Active Catalog
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-emerald-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F5F7FA]">{activeProductsCount}</span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {products.length > 0 ? Math.round((activeProductsCount / products.length) * 100) : 0}% active
              </span>
            </div>
          </div>

          {/* Low / Out of Stock */}
          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl hover:border-[#3B424E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Stock Alerts
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-amber-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F5F7FA]">{lowStockProducts.length}</span>
              <span className="text-[11px] text-amber-400 font-medium">
                {outOfStockProducts.length} out of stock
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl hover:border-[#3B424E] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Categories
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-purple-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F5F7FA]">{categories.length}</span>
              <span className="text-[11px] text-[#747B87]">active groups</span>
            </div>
          </div>

          {/* Total Orders */}
          <Link
            to="/admin/orders"
            className="p-4 bg-[#111418] border border-[#252A31] rounded-xl hover:border-sky-500/50 transition-colors group block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] group-hover:text-[#F5F7FA] uppercase tracking-wider transition-colors">
                Store Orders
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-sky-400 group-hover:bg-sky-500/10 rounded-lg flex items-center justify-center border border-[#252A31] transition-colors">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#F5F7FA]">{orders.length}</span>
              <span className="text-[11px] text-sky-400 group-hover:underline flex items-center gap-0.5">
                Manage <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* Low Stock Warning Banner if any items low in stock */}
        {lowStockProducts.length > 0 && (
          <div className="p-4 bg-[#171B20] border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#F5F7FA]">
                  Inventory Attention Needed ({lowStockProducts.length} items low in stock)
                </h4>
                <p className="text-[11px] text-[#A7ADB7] mt-0.5">
                  Some items have reached 5 units or less. Update stock quantities to prevent overselling.
                </p>
              </div>
            </div>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0"
            >
              Manage Inventory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Main Operational Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products & Stock Table (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111418] border border-[#252A31] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#252A31] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Recent Products Overview</h3>
                  <p className="text-[11px] text-[#747B87]">Quick inventory view and status checks</p>
                </div>
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-[#6366F1] hover:text-[#818cf8] flex items-center gap-1"
                >
                  View All ({productCount || products.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {productsLoading ? (
                <div className="p-8 text-center text-xs text-[#747B87]">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#747B87]">No products in store catalog yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#171B20] text-[#A7ADB7] border-b border-[#252A31] font-semibold">
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#252A31]/50 text-[#F5F7FA]">
                      {products.slice(0, 6).map((p) => {
                        const img = getImageUrl(p.image);
                        return (
                          <tr key={p.id} className="hover:bg-[#171B20]/60 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img
                                src={img}
                                alt={p.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                                }}
                                className="w-9 h-9 rounded-lg object-cover bg-[#171B20] border border-[#252A31] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-semibold text-[#F5F7FA] block truncate max-w-[180px]">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-[#747B87]">ID #{p.id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium">{formatCurrency(p.price)}</td>
                            <td className="py-3 px-4">
                              {p.stock <= 0 ? (
                                <span className="text-rose-400 font-semibold text-[11px]">Out of Stock</span>
                              ) : p.stock <= 5 ? (
                                <span className="text-amber-400 font-semibold text-[11px]">{p.stock} (Low)</span>
                              ) : (
                                <span className="text-[#A7ADB7]">{p.stock} units</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {p.is_active ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                                  <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/30">
                                  <AlertCircle className="w-3 h-3" /> Inactive
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link
                                to={`/admin/products/${p.id}/edit`}
                                className="p-1.5 inline-block text-[#A7ADB7] hover:text-[#6366F1] hover:bg-[#171B20] rounded-md transition-colors"
                                title="Edit product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Orders / Operations Quick Actions */}
          <div className="space-y-6">
            {/* Quick Operations Box */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#F5F7FA]">Management Workspaces</h3>
              <div className="space-y-2.5">
                <Link
                  to="/admin/orders"
                  className="flex items-center justify-between p-3 bg-[#171B20] border border-[#252A31] rounded-lg hover:border-sky-500/50 hover:bg-[#171B20]/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-md">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F7FA] block">Manage Customer Orders</span>
                      <span className="text-[10px] text-[#747B87]">Track customer orders, items and fulfillment</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#747B87] group-hover:text-sky-400 transition-colors" />
                </Link>

                <Link
                  to="/admin/products/new"
                  className="flex items-center justify-between p-3 bg-[#171B20] border border-[#252A31] rounded-lg hover:border-[#6366F1]/50 hover:bg-[#171B20]/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6366F1]/10 text-[#6366F1] rounded-md">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F7FA] block">Create New Product</span>
                      <span className="text-[10px] text-[#747B87]">Add items, set pricing and upload media</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#747B87] group-hover:text-[#6366F1] transition-colors" />
                </Link>

                <Link
                  to="/admin/products"
                  className="flex items-center justify-between p-3 bg-[#171B20] border border-[#252A31] rounded-lg hover:border-[#6366F1]/50 hover:bg-[#171B20]/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-md">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F7FA] block">Manage Product Inventory</span>
                      <span className="text-[10px] text-[#747B87]">Update stock, edit prices, toggle status</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#747B87] group-hover:text-[#6366F1] transition-colors" />
                </Link>

                <Link
                  to="/admin/categories"
                  className="flex items-center justify-between p-3 bg-[#171B20] border border-[#252A31] rounded-lg hover:border-purple-500/50 hover:bg-[#171B20]/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-md">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F7FA] block">Category Catalog</span>
                      <span className="text-[10px] text-[#747B87]">Create slugs, categories & descriptions</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#747B87] group-hover:text-[#6366F1] transition-colors" />
                </Link>
              </div>
            </div>

            {/* Orders Summary (Real data if available) */}
            <div className="bg-[#111418] border border-[#252A31] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A31] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Store Orders Activity</h3>
                  <p className="text-[11px] text-[#747B87]">Recent transactions from API</p>
                </div>
                <Link
                  to="/admin/orders"
                  className="text-xs font-semibold text-[#6366F1] hover:text-[#818cf8] flex items-center gap-1"
                >
                  View All ({orders.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {ordersLoading ? (
                <p className="text-xs text-[#747B87]">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-xs text-[#747B87] py-2">No orders recorded in the system yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <Link
                      to="/admin/orders"
                      key={order.id}
                      className="p-3 bg-[#171B20] border border-[#252A31] rounded-lg flex items-center justify-between text-xs hover:border-[#3B424E] transition-all block group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#F5F7FA] group-hover:text-[#6366F1] transition-colors">
                            Order #{order.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${
                              order.status === 'paid' || order.status === 'delivered'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : order.status === 'cancelled' || order.status === 'failed'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#747B87] flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {formatDate(order.created_at)}
                        </span>
                      </div>
                      <span className="font-bold text-[#F5F7FA]">{formatCurrency(order.total_amount)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
