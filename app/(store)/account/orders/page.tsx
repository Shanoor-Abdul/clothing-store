"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/utils";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchOrders = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/orders");
  return data.data;
};

const OrdersPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.patch(`/orders/${orderId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    },
  });

  if (!isAuthenticated) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"><Clock size={14} /> Pending Confirmation</span>;
      case "CONFIRMED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800"><CheckCircle2 size={14} /> Order Accepted</span>;
      case "SHIPPED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800"><Truck size={14} /> Out For Delivery</span>;
      case "DELIVERED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"><PackageCheck size={14} /> Delivered</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800"><XCircle size={14} /> Cancelled</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{status}</span>;
    }
  };

  const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
          <p className="text-xs text-slate-500">Track shipment status and order details</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <ShoppingBag size={14} /> Continue Shopping
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-2xl border bg-white p-12 text-center text-slate-500 shadow-sm">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-12 text-center shadow-sm space-y-3">
          <p className="text-slate-500">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition">
            Explore Catalog &rarr;
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {orders.map((order: any) => {
            const currentStepIdx = steps.indexOf(order.status);
            const isCancelled = order.status === "CANCELLED";

            return (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
                    <h2 className="text-base font-bold text-slate-900">{order.orderNumber}</h2>
                    <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Status Timeline Tracker */}
                {!isCancelled && (
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                      <span className={currentStepIdx >= 0 ? "text-blue-600 font-bold" : ""}>1. Pending</span>
                      <span className={currentStepIdx >= 1 ? "text-blue-600 font-bold" : ""}>2. Accepted</span>
                      <span className={currentStepIdx >= 2 ? "text-blue-600 font-bold" : ""}>3. Shipped</span>
                      <span className={currentStepIdx >= 3 ? "text-emerald-600 font-bold" : ""}>4. Delivered</span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${currentStepIdx < 0 ? 0 : Math.min(100, ((currentStepIdx + 1) / steps.length) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Items</h3>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-dashed last:border-0">
                      <div>
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {item.color && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">Color: {item.color}</span>}
                          {item.size && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">Size: {item.size}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{formatCurrency(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Payment Info */}
                {order.address && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl text-slate-700">
                    <div>
                      <p className="font-bold text-slate-900 mb-1">Shipping Address</p>
                      <p>{order.address.fullName} ({order.address.phone})</p>
                      <p>{order.address.street}, {order.address.city}, {order.address.country}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-1">Payment Details</p>
                      <p>Method: <span className="font-semibold">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</span></p>
                      <p>Payment Status: <span className="font-semibold text-amber-600">{order.paymentStatus}</span></p>
                    </div>
                  </div>
                )}

                {/* Total & Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                  <div className="text-slate-900">
                    <span className="text-xs text-slate-500 block">Total Amount</span>
                    <span className="text-lg font-bold">{formatCurrency(Number(order.total))}</span>
                  </div>

                  {order.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => cancelOrderMutation.mutate(order.id)}
                      disabled={cancelOrderMutation.isPending}
                      className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                    >
                      {cancelOrderMutation.isPending ? "Cancelling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
