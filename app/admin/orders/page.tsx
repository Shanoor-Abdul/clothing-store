"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, RefreshCw, ShoppingBag, CreditCard, Truck, User, MapPin, PackageCheck } from "lucide-react";
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
  paymentStatus: string;
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

const updateOrderStatusApi = async ({ id, status }: { id: string; status: string }) => {
  const { data } = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}`, { status });
  return data.data;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-300",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-300",
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading, isRefetching } = useQuery({
    queryKey: ["admin", "orders", statusFilter],
    queryFn: () => fetchOrders(statusFilter),
  });

  const updateMutation = useMutation({
    mutationFn: updateOrderStatusApi,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success(`Order #${updated.orderNumber} status updated to ${updated.status}`);
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder((prev) => prev ? { ...prev, status: updated.status } : null);
      }
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
      (o.user?.email && o.user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-slate-500">Track and manage customer orders and shipment statuses.</p>
        </div>

        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })}
          disabled={isRefetching}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={16} className={isRefetching ? "animate-spin text-blue-600" : ""} />
          {isRefetching ? "Refreshing..." : "Refresh Feed"}
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 rounded-xl bg-slate-200/60 p-1.5">
          {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
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
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
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
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900">{order.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{order.user?.name || "Guest"}</p>
                    <p className="text-xs text-slate-400">{order.user?.email || "No email"}</p>
                  </td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">
                    {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{formatCurrency(Number(order.total))}</td>
                  <td className="p-4">
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
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
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
      )}

      {/* Comprehensive Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Order Detail View</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                ✕ Close
              </button>
            </div>

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
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b pb-2">
                    <CreditCard size={16} className="text-purple-600" /> Payment Info
                  </div>
                  <p className="pt-1">Method: <span className="font-bold text-slate-900">{selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : selectedOrder.paymentMethod}</span></p>
                  <p>Payment Status: <span className="font-bold text-amber-600">{selectedOrder.paymentStatus}</span></p>
                </div>
              )}
            </div>

            {/* Purchased Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag size={16} className="text-blue-600" /> Purchased Product Items ({selectedOrder.items.length})
                </h4>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 transition gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Thumbnail */}
                      <div className="h-14 w-14 shrink-0 rounded-lg border bg-slate-50 p-1 flex items-center justify-center overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-[10px] font-bold text-slate-400 text-center">
                            No Img
                          </div>
                        )}
                      </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
