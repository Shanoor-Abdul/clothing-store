"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, LogOut, Heart, MapPin, Menu } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/axios";
import { useCart } from "@/features/cart/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { useLogout } from "@/features/auth/hooks";
import { clearAuth } from "@/features/auth/slice";
import useDebounce from "@/hooks/useDebounce";
import NotificationBadge from "@/components/NotificationBadge";

interface Category {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  data: T;
}

const StoreHeader = () => {
  const router = useRouter();
  const { totalItems } = useCart();
  const dispatch = useAppDispatch();
  const logout = useLogout();
  const searchRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _debouncedSearch = useDebounce(searchValue, 600);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["header-categories"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>("/categories");
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const performSearch = useCallback(
    (value: string, catId?: string) => {
      const trimmed = value.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set("search", trimmed);
      if (catId || selectedCategory) params.set("category", catId || selectedCategory);
      router.push(`/products?${params.toString()}`);
    },
    [router, selectedCategory]
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      performSearch(searchValue);
      searchRef.current?.blur();
      setMobileSearchOpen(false);
    },
    [searchValue, performSearch]
  );

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      dispatch(clearAuth());
    } finally {
      router.push("/login");
    }
  };

  const SearchForm = ({ className = "" }: { className?: string }) => (
    <form
      onSubmit={handleSearchSubmit}
      className={`flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800 text-slate-900 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 ${className}`}
    >
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="hidden sm:block border-r border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 outline-none hover:bg-slate-700 cursor-pointer"
      >
        <option value="">All Departments</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input
        ref={searchRef}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search shirts, dresses, brands..."
        className="w-full bg-slate-800 px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-400 outline-none"
      />

      <button
        type="submit"
        className="flex h-10 w-11 items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition flex-shrink-0"
        aria-label="Search"
      >
        <Search size={17} />
      </button>
    </form>
  );

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
      {/* ── Main Navigation Row ── */}
      <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg sm:text-xl font-extrabold tracking-tight text-white transition hover:text-sky-400 flex-shrink-0"
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-white font-black shadow-md">
            S
          </span>
          <span className="hidden sm:inline">ClothingStore</span>
        </Link>

        {/* Deliver To — lg+ only */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs hover:bg-slate-800 transition cursor-pointer flex-shrink-0">
          <MapPin size={15} className="text-sky-400" />
          <div className="leading-tight">
            <p className="text-[10px] text-slate-400">Deliver to</p>
            <p className="font-bold text-white">Saudi Arabia</p>
          </div>
        </div>

        {/* Search Bar — hidden on xs, shown on sm+ */}
        <div className="hidden sm:flex flex-1 min-w-0">
          <SearchForm className="w-full" />
        </div>

        {/* Right Actions */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto sm:ml-0">
          {/* Mobile search toggle */}
          <button
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 transition"
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <Search size={19} />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/account/orders"
                className="hidden md:flex flex-col text-left px-2 py-1 text-xs hover:bg-slate-800 rounded transition"
              >
                <span className="text-[10px] text-slate-400">Returns &</span>
                <span className="font-bold text-white">Orders</span>
              </Link>

              <Link
                href="/account/wishlist"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                aria-label="Wishlist"
              >
                <Heart size={19} />
              </Link>

              {/* Live notification badge for store users */}
              <NotificationBadge variant="store" />

              <Link
                href="/account"
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : <User size={14} />}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-white">
                  {user?.name || "Account"}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition"
                title="Sign Out"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex flex-col px-2.5 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-500 font-bold text-white transition shadow whitespace-nowrap"
            >
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            aria-label="Cart"
          >
            <ShoppingCart size={19} className="text-sky-400" />
            <span className="hidden sm:inline text-xs font-bold text-white">Cart</span>
            {totalItems > 0 && (
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-amber-400 text-[9px] sm:text-[10px] font-black text-slate-950 shadow">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* ── Mobile Search Bar (dropdown below header) ── */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3">
          <SearchForm className="w-full" />
        </div>
      )}

      {/* ── Sub-navigation Ribbon ── */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-3 sm:px-4 py-2 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          
          {/* Mobile Category Dropdown */}
          <div className="flex-1 sm:hidden">
             <select 
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-500"
               onChange={(e) => {
                 if (e.target.value) {
                   router.push(e.target.value);
                 }
               }}
               defaultValue=""
             >
               <option value="" disabled>Browse Categories...</option>
               <option value="/products">All Clothing Catalog</option>
               <option value="/products?featured=true">Featured Deals</option>
               {categories.map((cat) => (
                 <option key={cat.id} value={`/products?category=${cat.id}`}>
                   {cat.name}
                 </option>
               ))}
             </select>
          </div>

          {/* Desktop Ribbon */}
          <div className="hidden sm:flex items-center gap-4 overflow-x-auto whitespace-nowrap text-slate-300 scrollbar-none flex-1">
            <Link href="/products" className="flex items-center gap-1 font-bold text-white hover:text-sky-400">
              <Menu size={13} /> All
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/products?featured=true" className="hover:text-white transition">
              Featured Deals
            </Link>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="hover:text-white transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Track Orders (Always Visible) */}
          <Link href="/account/orders" className="hover:text-sky-300 transition font-bold text-sky-400 flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="hidden sm:inline">Track Orders</span>
            <span className="sm:hidden">Orders</span> →
          </Link>
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;
