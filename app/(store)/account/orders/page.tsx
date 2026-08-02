"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  PackageCheck,
  ShoppingBag,
  RotateCcw,
  Star,
  Edit,
  MapPin,
  Plus,
  Minus,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { formatCurrency } from "@/utils";
import { useAppSelector } from "@/store";

const fetchUserOrders = async () => {
  const { data } = await api.get("/orders");
  return data.data;
};

const fetchProductsCatalog = async () => {
  const { data } = await api.get("/products");
  return data.data;
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Address edit modal state
  const [editingAddressOrder, setEditingAddressOrder] = useState<any | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Saudi Arabia",
  });

  // Item edit modal state
  const [editingItemsOrder, setEditingItemsOrder] = useState<any | null>(null);
  const [draftItems, setDraftItems] = useState<any[]>([]);
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [showCatalog, setShowCatalog] = useState<boolean>(false);

  // Review modal state
  const [reviewItem, setReviewItem] = useState<{ productId: string; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["user", "orders"],
    queryFn: fetchUserOrders,
    enabled: isAuthenticated,
  });

  const { data: catalog = [] } = useQuery({
    queryKey: ["products", "catalog"],
    queryFn: fetchProductsCatalog,
    enabled: showCatalog,
  });

  // Action mutation (Cancel, Return, Address update, Items update)
  const orderActionMutation = useMutation({
    mutationFn: async ({ orderId, payload }: { orderId: string; payload: any }) => {
      const res = await api.patch(`/orders/${orderId}`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Order updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user", "orders"] });
      setEditingAddressOrder(null);
      setEditingItemsOrder(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update order");
    },
  });

  // Review submit mutation
  const reviewMutation = useMutation({
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
          <p className="text-xs text-slate-500">Track shipments, edit order items, manage delivery, and request returns</p>
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

                {/* Progress Stepper */}
                {!isCancelled && (
                  <div className="py-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span className={currentStepIdx >= 0 ? "text-blue-600" : ""}>Placed</span>
                      <span className={currentStepIdx >= 1 ? "text-blue-600" : ""}>Confirmed</span>
                      <span className={currentStepIdx >= 2 ? "text-purple-600" : ""}>Shipped</span>
                      <span className={currentStepIdx >= 3 ? "text-emerald-600" : ""}>Delivered</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                        style={{
                          width: `${((currentStepIdx + 1) / steps.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Return Window Alert */}
                {isDelivered && (
                  <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    isReturnable ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <span>
                      {isReturnable
                        ? `⏱️ 24-Hour Return Window Active (${hoursRemaining} hours remaining)`
                        : "Return window closed (Expired after 24 hours)"}
                    </span>
                    {isReturnable && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to request a return for this order?")) {
                            orderActionMutation.mutate({ orderId: order.id, payload: { action: "RETURN" } });
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
                      >
                        <RotateCcw size={14} /> Request Return
                      </button>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Order Items</h3>
                    {canModify && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItemsOrder(order);
                          setDraftItems(JSON.parse(JSON.stringify(order.items)));
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Edit size={13} /> Edit Order Items
                      </button>
                    )}
                  </div>

                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 rounded-lg border bg-slate-50 p-1 flex items-center justify-center">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Package size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.productName}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.color && <span>Color: {item.color}</span>}
                            {item.size && <span>Size: {item.size}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{formatCurrency(Number(item.price) * item.quantity)}</p>
                        {isDelivered && (
                          <button
                            type="button"
                            onClick={() => setReviewItem({ productId: item.productId, productName: item.productName })}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition mt-1"
                          >
                            <Star size={13} /> Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Payment Details */}
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
                      <p>Method: <span className="font-semibold text-slate-800">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</span></p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-slate-500">Status:</span>
                        {order.paymentStatus === "PAID" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                            ✓ Payment Received (Paid)
                          </span>
                        ) : order.paymentStatus === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-300">
                            ✕ Payment Failed
                          </span>
                        ) : order.paymentStatus === "REFUNDED" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 border border-purple-300">
                            ↩ Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                            ⏳ Payment Pending
                          </span>
                        )}
                      </div>
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
                          setEditingItemsOrder(order);
                          setDraftItems(JSON.parse(JSON.stringify(order.items)));
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
                      >
                        Edit Order Items
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this order?")) {
                            orderActionMutation.mutate({ orderId: order.id, payload: { action: "CANCEL" } });
                          }
                        }}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Order Items Modal */}
      {editingItemsOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Items for Order #{editingItemsOrder.orderNumber}</h3>
              <button onClick={() => setEditingItemsOrder(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {draftItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border p-3 bg-slate-50 gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[11px] text-slate-500">{formatCurrency(Number(item.price))} each</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border bg-white p-1">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...draftItems];
                          updated[idx].quantity = Math.max(1, updated[idx].quantity - 1);
                          setDraftItems(updated);
                        }}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...draftItems];
                          updated[idx].quantity += 1;
                          setDraftItems(updated);
                        }}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDraftItems(draftItems.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Catalog Search to Add Another Item */}
            <div className="border-t pt-3 space-y-3">
              <button
                type="button"
                onClick={() => setShowCatalog(!showCatalog)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add item from store catalog
              </button>

              {showCatalog && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-xl border">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search product to add..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-500"
                    />
                    <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {catalog
                      .filter((p: any) => p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .slice(0, 5)
                      .map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between rounded bg-white p-2 text-xs border">
                          <span className="font-semibold text-slate-900">{p.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDraftItems([
                                ...draftItems,
                                {
                                  productId: p.id,
                                  productName: p.name,
                                  price: Number(p.sellingPrice || p.price),
                                  quantity: 1,
                                  productImage: p.imageUrl,
                                },
                              ]);
                            }}
                            className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-blue-700"
                          >
                            + Add Item
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setEditingItemsOrder(null)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  orderActionMutation.mutate({
                    orderId: editingItemsOrder.id,
                    payload: { items: draftItems },
                  })
                }
                disabled={draftItems.length === 0}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                Save Order Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editingAddressOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Update Shipping Address</h3>
              <button onClick={() => setEditingAddressOrder(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setEditingAddressOrder(null)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  orderActionMutation.mutate({
                    orderId: editingAddressOrder.id,
                    payload: { address: addressForm },
                  })
                }
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                Save New Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Write Product Review</h3>
              <button onClick={() => setReviewItem(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600 font-semibold">{reviewItem.productName}</p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-2xl transition hover:scale-110"
                  >
                    {star <= reviewRating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Review Comment</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your feedback about the fit, quality, and material..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setReviewItem(null)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  reviewMutation.mutate({
                    productId: reviewItem.productId,
                    rating: reviewRating,
                    comment: reviewComment,
                  })
                }
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
