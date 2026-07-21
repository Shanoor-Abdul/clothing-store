"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, LogOut, Heart } from "lucide-react";

import { useCart } from "@/features/cart/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { useLogout } from "@/features/auth/hooks";
import { clearAuth } from "@/features/auth/slice";

const StoreHeader = () => {
  const router = useRouter();
  const { totalItems } = useCart();
  const dispatch = useAppDispatch();
  const logout = useLogout();

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget)
      .get("search")
      ?.toString()
      .trim();

    if (value) {
      router.push(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      dispatch(clearAuth());
    } finally {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm shadow-slate-900/5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 transition hover:text-blue-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20">
            S
          </span>
          <span>ClothingStore</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 md:flex"
        >
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              name="search"
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-white/95 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </form>

        <nav className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-lg shadow-blue-500/30">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account/wishlist"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Wishlist"
              >
                <Heart size={22} />
              </Link>
              <Link
                href="/account"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                aria-label="Account"
              >
                <User size={22} />
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
                aria-label="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default StoreHeader;
