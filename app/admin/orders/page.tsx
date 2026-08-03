"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, RefreshCw, ShoppingBag, CreditCard, User, MapPin, Calendar, Maximize2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { formatCurrency } from "@/utils";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  color?: string | null;
  size?: string | null;
  quantity: number;
  price: number;
}

interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  country: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  user?: { name: string; email: string; mobile?: string };
  address?: Address;
  items: OrderItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchOrders = async (statusFilter: string): Promise<Order[]> => {
  const url = statusFilter === "ALL" ? "/admin/orders" : `/admin/orders?status=${statusFilter}`;
  const { data } = await api.get<ApiResponse<Order[]>>(url);
  return data.data;
};

const updateOrderStatusApi = async ({ id, status, paymentStatus }: { id: string; status?: string; paymentStatus?: string }) => {
  const { data } = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}`, { status, paymentStatus });
  return data.data;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-300",
};

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold",
  FAILED: "bg-rose-100 text-rose-800 border-rose-300",
  REFUNDED: "bg-purple-100 text-purple-800 border-purple-300",
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [customMonth, setCustomMonth] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const { data: orders = [], isLoading, isRefetching } = useQuery({
    queryKey: ["admin", "orders", statusFilter],
    queryFn: () => fetchOrders(statusFilter),
  });

  const updateMutation = useMutation({
    mutationFn: updateOrderStatusApi,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "revenue"] });
      toast.success(`Order #${updated.orderNumber} updated successfully!`);
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: updated.status, paymentStatus: updated.paymentStatus } : null);
      }
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });

  // Filter orders by search term AND date range
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          o.orderNumber.toLowerCase().includes(q) ||
          (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
          (o.user?.email && o.user.email.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // 2. Date Filter
      const orderDate = new Date(o.createdAt);
      const now = new Date();

      if (dateFilter === "TODAY") {
        const isToday =
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === "7DAYS") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < sevenDaysAgo) return false;
      } else if (dateFilter === "THIS_MONTH") {
        const isThisMonth =
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
        if (!isThisMonth) return false;
      } else if (dateFilter === "CUSTOM_MONTH" && customMonth) {
        const [yearStr, monthStr] = customMonth.split("-");
        const matchYear = orderDate.getFullYear() === parseInt(yearStr, 10);
        const matchMonth = orderDate.getMonth() + 1 === parseInt(monthStr, 10);
        if (!matchYear || !matchMonth) return false;
      }

      return true;
    });
  }, [orders, searchQuery, dateFilter, customMonth]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-slate-500">Track orders, update shipment status, and confirm payments.</p>
        </div>

        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })}
          disabled={isRefetching}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw size={16} className={isRefetching ? "animate-spin text-blue-600" : ""} />
          {isRefetching ? "Refreshing..." : "Refresh Feed"}
        </button>
      </div>

      {/* Date Range & Status Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        {/* Date Quick Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar size={16} className="text-blue-600" /> Filter Date Range:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ALL", label: "All Time" },
              { id: "TODAY", label: "Today" },
              { id: "7DAYS", label: "Last 7 Days" },
              { id: "THIS_MONTH", label: "This Month" },
              { id: "CUSTOM_MONTH", label: "Select Month" },
            ].map((df) => (
              <button
                key={df.id}
                type="button"
                onClick={() => setDateFilter(df.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  dateFilter === df.id
                    ? "bg-blue-600 text-white shadow"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {df.label}
              </button>
            ))}

            {dateFilter === "CUSTOM_MONTH" && (
              <input
                type="month"
                value={customMonth}
                onChange={(e) => setCustomMonth(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs outline-none focus:border-blue-500 font-bold"
              />
            )}
          </div>
        </div>

        {/* Status Filter Tabs & Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
            {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Search by order #, customer, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
          Loading order history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">
          No orders found matching the filter.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Total</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900">
                    {order.orderNumber}
                    <p className="text-[11px] font-normal text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{order.user?.name || "Guest"}</p>
                    <p className="text-xs text-slate-400">{order.user?.email || "No email"}</p>
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">
                    {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{formatCurrency(Number(order.total))}</td>

                  {/* Order Status Column: Lock dropdown if DELIVERED or CANCELLED */}
                  <td className="p-4">
                    {order.status === "DELIVERED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                        <CheckCircle2 size={13} /> Delivered
                      </span>
                    ) : order.status === "CANCELLED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 border border-rose-300">
                        ✕ Cancelled
                      </span>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateMutation.mutate({ id: order.id, status: e.target.value })
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-bold outline-none cursor-pointer ${
                          statusColors[order.status]
                        }`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    )}
                  </td>

                  {/* Payment Status Column: Lock dropdown once PAID */}
                  <td className="p-4">
                    {order.paymentStatus === "PAID" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                        ✓ Payment Received (Paid)
                      </span>
                    ) : (
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          updateMutation.mutate({ id: order.id, paymentStatus: e.target.value })
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-bold outline-none cursor-pointer ${
                          paymentStatusColors[order.paymentStatus]
                        }`}
                      >
                        <option value="PENDING">Payment Pending</option>
                        <option value="PAID">Payment Received (Paid)</option>
                        <option value="FAILED">Payment Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition"
                      title="View Full Order Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-none sm:rounded-2xl bg-white shadow-2xl space-y-0 sm:my-8 min-h-screen sm:min-h-0">
            {/* Sticky Close Bar — always visible on mobile */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Order Detail View</span>
                <h3 className="text-base sm:text-xl font-bold text-slate-900">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-600 transition text-lg font-bold"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b pb-2">
                  <User size={16} className="text-blue-600" /> Customer Information
                </div>
                <p className="font-bold text-slate-800 pt-1">{selectedOrder.user?.name || "Guest Customer"}</p>
                <p className="text-slate-600">Email: {selectedOrder.user?.email || "N/A"}</p>
                {selectedOrder.user?.mobile && <p className="text-slate-600">Phone: {selectedOrder.user.mobile}</p>}
              </div>

              {selectedOrder.address ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b pb-2">
                    <MapPin size={16} className="text-emerald-600" /> Shipping Address
                  </div>
                  <p className="font-bold text-slate-800 pt-1">{selectedOrder.address.fullName}</p>
                  <p className="text-slate-600">Phone: {selectedOrder.address.phone}</p>
                  <p className="text-slate-500 leading-relaxed">
                    {selectedOrder.address.street}, {selectedOrder.address.city}
                    {selectedOrder.address.state ? `, ${selectedOrder.address.state}` : ""}, {selectedOrder.address.country}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Payment Status Lock in Modal */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-purple-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Payment Method: {selectedOrder.paymentMethod === "COD" ? "Cash on Delivery (COD)" : selectedOrder.paymentMethod}</span>
                  <span className="text-slate-500">Update payment status upon cash collection or online confirmation</span>
                </div>
              </div>

              {selectedOrder.paymentStatus === "PAID" ? (
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800 border border-emerald-300">
                  ✓ Payment Received (Paid)
                </span>
              ) : (
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) =>
                    updateMutation.mutate({ id: selectedOrder.id, paymentStatus: e.target.value })
                  }
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                    paymentStatusColors[selectedOrder.paymentStatus]
                  }`}
                >
                  <option value="PENDING">Payment Pending</option>
                  <option value="PAID">Payment Received (Paid)</option>
                  <option value="FAILED">Payment Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              )}
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag size={16} className="text-blue-600" /> Purchased Items ({selectedOrder.items.length})
                </h4>
                <span className="text-[11px] text-slate-400">Click image thumbnail to enlarge</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 transition gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Thumbnail with LightBox Trigger */}
                      <button
                        type="button"
                        onClick={() => item.productImage && setLightboxImage(item.productImage)}
                        className="group relative h-14 w-14 shrink-0 rounded-lg border bg-slate-50 p-1 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                      >
                        {item.productImage ? (
                          <>
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="max-h-full max-w-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                              <Maximize2 size={14} />
                            </div>
                          </>
                        ) : (
                          <div className="text-[10px] font-bold text-slate-400 text-center">
                            No Img
                          </div>
                        )}
                      </button>

                      {/* Details */}
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.productName || "Product Item"}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                          {item.color && (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              Size: {item.size}
                            </span>
                          )}
                          <span className="font-semibold text-slate-600">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{item.quantity} × {formatCurrency(Number(item.price))}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount Summary */}
            <div className="rounded-xl bg-slate-900 p-4 text-white space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Items Subtotal</span>
                <span>{formatCurrency(Number(selectedOrder.subtotal || selectedOrder.total))}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Shipping Fee</span>
                <span>{selectedOrder.shipping > 0 ? formatCurrency(Number(selectedOrder.shipping)) : "FREE"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-base font-bold">
                <span>Grand Total</span>
                <span className="text-sky-400">{formatCurrency(Number(selectedOrder.total))}</span>
              </div>
            </div>
            </div>{/* end modal body */}
          </div>
        </div>
      )}

      {/* High-Res Image LightBox Zoom Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 cursor-pointer"
        >
          <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="High resolution product view"
              className="max-h-[80vh] max-w-[80vw] object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow hover:bg-rose-600 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
