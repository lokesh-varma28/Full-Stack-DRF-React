import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  X,
  MapPin,
  CreditCard,
  PackageCheck,
  Clock,
  User,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Loader2,
  DollarSign,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { AdminOrder, OrderStatus } from '../../types/order';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { OrderItemThumbnail } from '../../components/orders/OrderItemThumbnail';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from '../../stores/useToastStore';

export const AdminOrdersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const { orders, isLoading, isError, error, refetch, updateStatus } = useAdminOrders();

  // Filtered orders list based on search and filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search match: order id, username, email, delivery full name, phone
      const query = searchTerm.toLowerCase().trim();
      if (query) {
        const orderIdMatch = order.id.toString().includes(query);
        const usernameMatch = order.user?.username?.toLowerCase().includes(query) || false;
        const emailMatch = order.user?.email?.toLowerCase().includes(query) || false;
        const recipientMatch = order.delivery_full_name?.toLowerCase().includes(query) || false;
        const phoneMatch = order.delivery_phone?.includes(query) || false;
        const razorpayMatch = order.razorpay_order_id?.toLowerCase().includes(query) || false;

        if (!orderIdMatch && !usernameMatch && !emailMatch && !recipientMatch && !phoneMatch && !razorpayMatch) {
          return false;
        }
      }

      // Order status filter
      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      // Payment status filter
      if (paymentStatusFilter) {
        const orderPaymentStatus = order.payment?.status || (order.status === 'paid' ? 'success' : 'created');
        if (orderPaymentStatus !== paymentStatusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  // Summary Metrics calculation
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o) => o.status === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + (typeof o.total_amount === 'string' ? parseFloat(o.total_amount) : o.total_amount), 0);
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
    const activeCount = orders.filter((o) => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled' || o.status === 'failed').length;

    return { totalOrders, totalRevenue, deliveredCount, activeCount, cancelledCount };
  }, [orders]);

  const handleOpenDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusChangeSubmit = async () => {
    if (!selectedOrder || !newStatus || newStatus === selectedOrder.status) return;

    setUpdatingStatus(true);
    try {
      const res = await updateStatus({ id: selectedOrder.id, status: newStatus });
      toast.success(`Order #${selectedOrder.id} status updated to ${newStatus}.`);
      if (res?.data) {
        setSelectedOrder(res.data);
      } else {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      refetch();
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to update order status.';
      toast.error(errorMsg || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentStatusFilter('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-5">
          <div>
            <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider block">
              OPERATIONS
            </span>
            <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">Orders</h1>
            <p className="text-xs text-[#A7ADB7] mt-0.5">
              Manage and track customer orders, fulfillment statuses and line items.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-3.5 py-2 bg-[#171B20] hover:bg-[#252A31] text-[#A7ADB7] hover:text-[#F5F7FA] text-xs font-semibold rounded-lg border border-[#252A31] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh orders list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-sky-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#F5F7FA]">{metrics.totalOrders}</span>
              <span className="text-[11px] text-[#747B87] block mt-0.5">all customer orders</span>
            </div>
          </div>

          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Total Paid
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-emerald-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-[#F5F7FA]">{formatCurrency(metrics.totalRevenue)}</span>
              <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">collected revenue</span>
            </div>
          </div>

          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                In Progress
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-indigo-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <Truck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#F5F7FA]">{metrics.activeCount}</span>
              <span className="text-[11px] text-indigo-400 font-medium block mt-0.5">processing / shipped</span>
            </div>
          </div>

          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Delivered
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-teal-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#F5F7FA]">{metrics.deliveredCount}</span>
              <span className="text-[11px] text-teal-400 font-medium block mt-0.5">completed</span>
            </div>
          </div>

          <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A7ADB7] uppercase tracking-wider">
                Cancelled / Failed
              </span>
              <div className="w-7 h-7 bg-[#171B20] text-rose-400 rounded-lg flex items-center justify-center border border-[#252A31]">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-[#F5F7FA]">{metrics.cancelledCount}</span>
              <span className="text-[11px] text-rose-400 font-medium block mt-0.5">unfulfilled</span>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-4 bg-[#111418] border border-[#252A31] rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[#747B87] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order #, customer, email, or recipient..."
                className="w-full bg-[#171B20] border border-[#252A31] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F7FA] placeholder-[#747B87] focus:outline-none focus:border-[#6366F1] transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747B87] hover:text-[#F5F7FA]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Order Status Filter */}
            <div className="sm:col-span-3">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-[#747B87] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
                  className="w-full bg-[#171B20] border border-[#252A31] rounded-lg pl-9 pr-8 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6366F1] appearance-none cursor-pointer transition-colors"
                >
                  <option value="">All Order Statuses</option>
                  <option value="created">Created</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Payment Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="w-full bg-[#171B20] border border-[#252A31] rounded-lg px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6366F1] appearance-none cursor-pointer transition-colors"
              >
                <option value="">All Payment Statuses</option>
                <option value="success">Paid / Success</option>
                <option value="created">Payment Pending</option>
                <option value="failed">Payment Failed</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(searchTerm || statusFilter || paymentStatusFilter) && (
            <div className="flex items-center justify-between pt-2 border-t border-[#252A31]/60 text-xs">
              <span className="text-[#A7ADB7]">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#6366F1] hover:text-[#818cf8] font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Orders Table Container */}
        <div className="bg-[#111418] border border-[#252A31] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-[#6366F1] animate-spin mx-auto" />
              <p className="text-xs text-[#747B87]">Loading store orders...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center space-y-3">
              <AlertOctagon className="w-7 h-7 text-rose-400 mx-auto" />
              <p className="text-sm font-semibold text-[#F5F7FA]">Failed to load orders</p>
              <p className="text-xs text-[#747B87]">
                {error instanceof Error ? error.message : 'An error occurred while fetching orders.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-[#171B20] text-[#747B87] rounded-xl flex items-center justify-center mx-auto border border-[#252A31]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-sm">No Orders Found</h3>
              <p className="text-xs text-[#747B87] max-w-sm mx-auto">
                {searchTerm || statusFilter || paymentStatusFilter
                  ? 'No orders match your filter criteria. Try clearing the search or filters.'
                  : 'No customer orders have been placed in the store yet.'}
              </p>
              {(searchTerm || statusFilter || paymentStatusFilter) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#171B20] hover:bg-[#252A31] text-[#F5F7FA] text-xs font-semibold rounded-lg border border-[#252A31]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#171B20] text-[#A7ADB7] border-b border-[#252A31] font-semibold">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A31]/50 text-[#F5F7FA]">
                  {filteredOrders.map((order) => {
                    const customerName = order.user?.username || order.delivery_full_name || 'Customer';
                    const customerEmail = order.user?.email || '';
                    const itemsCount = order.items?.length || order.items_count || 0;
                    const firstItem = order.items?.[0];

                    return (
                      <tr key={order.id} className="hover:bg-[#171B20]/60 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F5F7FA]">
                          <span className="text-[#6366F1]">#</span>
                          {order.id}
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#252A31] flex items-center justify-center text-[#A7ADB7] shrink-0 font-semibold uppercase text-[10px]">
                              {customerName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#F5F7FA] block truncate max-w-[140px]">
                                {customerName}
                              </span>
                              {customerEmail && (
                                <span className="text-[10px] text-[#747B87] block truncate max-w-[140px]">
                                  {customerEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-[#A7ADB7]">
                          <span className="block text-[#F5F7FA]">{formatDate(order.created_at)}</span>
                          <span className="text-[10px] text-[#747B87] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* Items preview with thumbnails */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {firstItem && (
                              <OrderItemThumbnail
                                product={firstItem.product}
                                className="w-8 h-8 rounded"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="font-medium text-[#F5F7FA] block truncate max-w-[150px]">
                                {firstItem?.product?.name || 'Product'}
                              </span>
                              <span className="text-[10px] text-[#747B87]">
                                {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 font-bold text-[#F5F7FA] whitespace-nowrap">
                          {formatCurrency(order.total_amount)}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded inline-block ${
                              order.payment?.status === 'success' || order.status === 'paid' || order.status === 'delivered'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : order.payment?.status === 'failed' || order.status === 'failed'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            }`}
                          >
                            {order.payment?.status || (order.status === 'paid' ? 'success' : 'pending')}
                          </span>
                        </td>

                        {/* Order Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        {/* Action: View details */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="px-3 py-1.5 bg-[#171B20] hover:bg-[#252A31] text-[#6366F1] hover:text-[#818cf8] font-semibold text-xs rounded-lg border border-[#252A31] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
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

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#111418] border border-[#252A31] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#252A31] flex items-center justify-between bg-[#171B20]/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#F5F7FA] text-base">Order #{selectedOrder.id}</h3>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                  <span className="text-[11px] text-[#747B87] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Placed on {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg bg-[#171B20] border border-[#252A31] text-[#A7ADB7] hover:text-[#F5F7FA] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#A7ADB7]">
              {/* Order Status Management Box */}
              <div className="p-4 bg-[#171B20] border border-[#252A31] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F7FA] text-xs flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-[#6366F1]" /> Update Fulfillment Status
                  </span>
                  <span className="text-[10px] text-[#747B87]">Server-validated transition</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full sm:flex-1 bg-[#111418] border border-[#252A31] rounded-lg px-3 py-2 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#6366F1] transition-colors"
                  >
                    <option value="created">Created</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleStatusChangeSubmit}
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    className="w-full sm:w-auto px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {updatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Update Status</span>
                  </button>
                </div>
              </div>

              {/* Grid: Customer & Delivery Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Account Info */}
                <div className="p-4 bg-[#171B20]/60 border border-[#252A31] rounded-xl space-y-2.5">
                  <h4 className="font-semibold text-[#F5F7FA] text-xs flex items-center gap-1.5 border-b border-[#252A31] pb-2">
                    <User className="w-3.5 h-3.5 text-[#6366F1]" /> Customer Account
                  </h4>
                  <div className="space-y-1 leading-relaxed">
                    <p>
                      <span className="text-[#747B87]">Username:</span>{' '}
                      <span className="font-semibold text-[#F5F7FA]">{selectedOrder.user?.username || 'Guest'}</span>
                    </p>
                    <p>
                      <span className="text-[#747B87]">Email:</span>{' '}
                      <span className="font-semibold text-[#F5F7FA]">{selectedOrder.user?.email || 'N/A'}</span>
                    </p>
                    <p>
                      <span className="text-[#747B87]">Customer ID:</span>{' '}
                      <span className="font-mono text-[#F5F7FA]">#{selectedOrder.user?.id || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                {/* Delivery Snapshot */}
                <div className="p-4 bg-[#171B20]/60 border border-[#252A31] rounded-xl space-y-2.5">
                  <h4 className="font-semibold text-[#F5F7FA] text-xs flex items-center gap-1.5 border-b border-[#252A31] pb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#6366F1]" /> Shipping Address
                  </h4>
                  <div className="space-y-1 leading-relaxed">
                    <p className="font-semibold text-[#F5F7FA]">{selectedOrder.delivery_full_name}</p>
                    <p>{selectedOrder.delivery_address_line}</p>
                    <p>
                      {selectedOrder.delivery_city}, {selectedOrder.delivery_state} - {selectedOrder.delivery_postal_code}
                    </p>
                    <p className="text-[#747B87]">
                      Phone: <span className="text-[#F5F7FA] font-medium">{selectedOrder.delivery_phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Itemized Order Products */}
              <div className="space-y-3">
                <h4 className="font-semibold text-[#F5F7FA] text-xs flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#6366F1]" />
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>

                <div className="border border-[#252A31] rounded-xl overflow-hidden divide-y divide-[#252A31]">
                  {selectedOrder.items?.map((item) => {
                    const product = item.product;
                    const unitPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    const subtotal = unitPrice * item.quantity;

                    return (
                      <div key={item.id} className="p-3.5 flex items-center gap-3 bg-[#171B20]/30 hover:bg-[#171B20]/60 transition-colors">
                        <OrderItemThumbnail
                          product={product}
                          className="w-12 h-12 rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-[#F5F7FA] text-xs truncate">
                            {product ? product.name : 'Product'}
                          </h5>
                          <span className="text-[11px] text-[#747B87] block mt-0.5">
                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-[#F5F7FA] block">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="p-4 bg-[#171B20]/60 border border-[#252A31] rounded-xl space-y-2.5">
                <h4 className="font-semibold text-[#F5F7FA] text-xs flex items-center gap-1.5 border-b border-[#252A31] pb-2">
                  <CreditCard className="w-3.5 h-3.5 text-[#6366F1]" /> Payment Details
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#747B87]">Payment Status</span>
                    <span className="font-semibold text-[#F5F7FA] uppercase">
                      {selectedOrder.payment?.status || (selectedOrder.status === 'paid' ? 'success' : 'pending')}
                    </span>
                  </div>
                  {selectedOrder.razorpay_order_id && (
                    <div className="flex justify-between">
                      <span className="text-[#747B87]">Razorpay Order ID</span>
                      <span className="font-mono text-[11px] text-[#A7ADB7]">{selectedOrder.razorpay_order_id}</span>
                    </div>
                  )}
                  {selectedOrder.payment?.razorpay_payment_id && (
                    <div className="flex justify-between">
                      <span className="text-[#747B87]">Payment ID</span>
                      <span className="font-mono text-[11px] text-[#A7ADB7]">
                        {selectedOrder.payment.razorpay_payment_id}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[#252A31] pt-2 flex justify-between font-bold text-sm text-[#F5F7FA]">
                    <span>Total Amount</span>
                    <span className="text-[#6366F1]">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#252A31] bg-[#171B20]/80 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#252A31] hover:bg-[#3B424E] text-[#F5F7FA] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;
