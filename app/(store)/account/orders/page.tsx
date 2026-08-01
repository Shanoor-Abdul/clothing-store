"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle, ShoppingBag, Edit, Star, RotateCcw, MapPin } from "lucide-react";
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

  const [editingAddressOrder, setEditingAddressOrder] = useState<any | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Saudi Arabia",
  });

  const [reviewItem, setReviewItem] = useState<{ productId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.patch(`/orders/${orderId}`, { action: "CANCEL" });
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

  const returnMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.patch(`/orders/${orderId}`, { action: "RETURN" });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Return request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to request return");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ orderId, address }: { orderId: string; address: any }) => {
      const res = await api.patch(`/orders/${orderId}`, { address });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Shipping address updated successfully");
      setEditingAddressOrder(null);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update address");
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) => {
      const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Review submitted! Thank you for your feedback.");
      setReviewItem(null);
      setReviewComment("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit review");
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
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
          <p className="text-xs text-slate-500">Track shipments, manage delivery, and request returns</p>
        </div>
        <Link href="/products" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
          <ShoppingBag size={14} /> Continue Shopping
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500 shadow-sm">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border bg-white p-12 text-center shadow-sm space-y-3">
          <p className="text-slate-500">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition">
            Explore Catalog &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => {
            const currentStepIdx = steps.indexOf(order.status);
            const isCancelled = order.status === "CANCELLED";
            const canModify = order.status === "PENDING" || order.status === "CONFIRMED";
            const isDelivered = order.status === "DELIVERED";

            // 24-Hour Return Window Calculation
            const deliveredTime = new Date(order.updatedAt).getTime();
            const hoursElapsed = (Date.now() - deliveredTime) / (1000 * 60 * 60);
            const hoursRemaining = Math.max(0, Math.floor(24 - hoursElapsed));
            const isReturnable = isDelivered && hoursElapsed <= 24;

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

                {/* 24h Return Countdown Banner */}
                {isDelivered && (
                  <div className={`rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs ${
                    isReturnable ? "bg-amber-50 border border-amber-200 text-amber-900" : "bg-slate-100 text-slate-600"
                  }`}>
                    <div className="flex items-center gap-2">
                      <RotateCcw size={16} className={isReturnable ? "text-amber-600" : "text-slate-400"} />
                      <span>
                        {isReturnable
                          ? `24-Hour Return Window Active (${hoursRemaining} hours remaining)`
                          : "Return window closed (Expired 24 hours after delivery)"}
                      </span>
                    </div>

                    {isReturnable && (
                      <button
                        type="button"
                        onClick={() => returnMutation.mutate(order.id)}
                        disabled={returnMutation.isPending}
                        className="rounded-lg bg-amber-600 px-3.5 py-1.5 font-bold text-white shadow hover:bg-amber-700 transition"
                      >
                        {returnMutation.isPending ? "Processing..." : "Request Return"}
                      </button>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Items</h3>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between text-sm py-2 border-b border-dashed last:border-0 gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{item.productName}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {item.color && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">Color: {item.color}</span>}
                          {item.size && <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">Size: {item.size}</span>}
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{formatCurrency(Number(item.price) * item.quantity)}</span>
                        {isDelivered && (
                          <button
                            type="button"
                            onClick={() => setReviewItem({ productId: item.productId, productName: item.productName })}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                          >
                            <Star size={13} /> Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Payment Info */}
                {order.address && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl text-slate-700">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <MapPin size={14} className="text-blue-600" /> Shipping Address
                        </p>
                        {canModify && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressOrder(order);
                              setAddressForm({
                                fullName: order.address.fullName || "",
                                phone: order.address.phone || "",
                                street: order.address.street || "",
                                city: order.address.city || "",
                                state: order.address.state || "",
                                country: order.address.country || "Saudi Arabia",
                              });
                            }}
                            className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <Edit size={12} /> Edit Address
                          </button>
                        )}
                      </div>
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

                {/* Total & Action Footer (Edit / Cancel before shipping) */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                  <div className="text-slate-900">
                    <span className="text-xs text-slate-500 block">Total Amount</span>
                    <span className="text-lg font-bold">{formatCurrency(Number(order.total))}</span>
                  </div>

                  {canModify && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressOrder(order);
                          setAddressForm({
                            fullName: order.address.fullName || "",
                            phone: order.address.phone || "",
                            street: order.address.street || "",
                            city: order.address.city || "",
                            state: order.address.state || "",
                            country: order.address.country || "Saudi Arabia",
                          });
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Edit Address
                      </button>

                      <button
                        type="button"
                        onClick={() => cancelMutation.mutate(order.id)}
                        disabled={cancelMutation.isPending}
                        className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                      >
                        {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Address Modal */}
      {editingAddressOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Edit Shipping Address</h3>
            <p className="text-xs text-slate-500">Update your address before the order is shipped.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full rounded-lg border p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setEditingAddressOrder(null)}
                className="rounded-lg border px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  updateAddressMutation.mutate({
                    orderId: editingAddressOrder.id,
                    address: addressForm,
                  })
                }
                disabled={updateAddressMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                {updateAddressMutation.isPending ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Product Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Review Product</h3>
            <p className="text-xs text-slate-500">{reviewItem.productName}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`p-1 text-xl transition ${star <= reviewRating ? "text-amber-400 scale-110" : "text-slate-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Review Comment</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell us what you loved about this clothing item..."
                  className="w-full rounded-lg border p-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <button
                type="button"
                onClick={() => setReviewItem(null)}
                className="rounded-lg border px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  submitReviewMutation.mutate({
                    productId: reviewItem.productId,
                    rating: reviewRating,
                    comment: reviewComment,
                  })
                }
                disabled={submitReviewMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
