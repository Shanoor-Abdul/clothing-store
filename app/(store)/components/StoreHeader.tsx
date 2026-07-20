"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, LogOut } from "lucide-react";

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
  const user = useAppSelector((state) => state.auth.user);

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
    await logout.mutateAsync();
    dispatch(clearAuth());
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Clothing<span className="text-blue-600">Store</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 md:flex"
        >
          <div className="relative w-full max-w-xl">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <input
              name="search"
              type="text"
              placeholder="Search products..."
              className="w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </div>
        </form>

        <nav className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative rounded-full p-2 hover:bg-slate-100"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full p-2 hover:bg-slate-100"
                aria-label="Account"
              >
                <User size={22} />
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-red-500 hover:bg-red-50"
                aria-label="Logout"
              >
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
