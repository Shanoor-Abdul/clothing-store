"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

import { useAppSelector } from "@/store";
import { useCart } from "@/features/cart/hooks";

const AccountPage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Account</h1>
      <p className="mt-1 text-slate-500">
        {user.name} {user.email ? `(${user.email})` : ""}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="font-semibold">My Orders</h2>
          <p className="mt-1 text-sm text-slate-500">
            View and track your orders.
          </p>
        </Link>
        <Link
          href="/cart"
          className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="font-semibold">Cart</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review items in your cart.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;
