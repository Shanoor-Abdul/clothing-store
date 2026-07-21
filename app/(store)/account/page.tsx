"use client";

import Link from "next/link";
import { Package, MapPin, Heart } from "lucide-react";

import { useAppSelector } from "@/store";

const AccountPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-slate-500">
        Manage your profile, orders and addresses.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
        >
          <Package className="text-blue-600" size={24} />
          <div>
            <p className="font-semibold">Orders</p>
            <p className="text-sm text-slate-500">Track purchases</p>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
        >
          <MapPin className="text-blue-600" size={24} />
          <div>
            <p className="font-semibold">Addresses</p>
            <p className="text-sm text-slate-500">Manage shipping</p>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm hover:shadow-md"
        >
          <Heart className="text-blue-600" size={24} />
          <div>
            <p className="font-semibold">Wishlist</p>
            <p className="text-sm text-slate-500">Saved items</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;
