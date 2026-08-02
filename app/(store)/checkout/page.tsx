"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/features/cart/hooks";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/utils";
import api from "@/lib/axios";

const CheckoutPage = () => {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const user = useAppSelector((state) => state.auth.user);

  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Saudi Arabia",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
      }));
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <Lock size={48} className="text-slate-400" />
        <h1 className="mt-4 text-2xl font-bold">
          Login Required
        </h1>
        <p className="mt-2 text-slate-500">
          Please sign in to complete your purchase. Your cart
          will be saved.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border px-6 py-3 font-medium hover:bg-slate-50"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);

      const required = ["fullName", "phone", "street", "city"];
      const missing = required.some(
        (k) => !address[k as keyof typeof address].trim()
      );

      if (missing) {
        toast.error("Please fill in required address fields");
        return;
      }

      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          quantity: i.quantity,
          price: i.sellingPrice,
        })),
        address,
        paymentMethod,
        total: subtotal,
      };

      await api.post("/orders", payload);

      clear();
      toast.success("Order placed successfully");
      router.push("/account/orders");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Order failed"
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 font-semibold">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Full Name *"
                value={address.fullName}
                onChange={(e) =>
                  setAddress({ ...address, fullName: e.target.value })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Phone *"
                value={address.phone}
                onChange={(e) =>
                  setAddress({ ...address, phone: e.target.value })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Street Address *"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500 sm:col-span-2"
              />
              <input
                placeholder="City *"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
              <input
                placeholder="State"
                value={address.state}
                onChange={(e) =>
                  setAddress({ ...address, state: e.target.value })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    postalCode: e.target.value,
                  })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
              <input
                placeholder="Country"
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 font-semibold">Payment Method</h2>
            <label className="flex items-center gap-3 rounded-lg border p-3">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-slate-500">
                  Pay when you receive your order.
                </p>
              </div>
            </label>
            <p className="mt-3 text-xs text-slate-400">
              Online payments (Stripe / PayTabs / Razorpay) coming
              soon.
            </p>
          </div>
        </div>

        <div className="h-fit rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div
                key={item.variantId ?? item.productId}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {formatCurrency(
                    item.sellingPrice * item.quantity
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Lock size={18} />
            {placing ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
