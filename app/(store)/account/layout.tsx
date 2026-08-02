"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, ShoppingCart } from "lucide-react";
import clsx from "clsx";

import { useAppSelector } from "@/store";

const navItems = [
  { href: "/account", label: "Profile", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
];

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!isAuthenticated) window.location.href = "/login";
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      {/* Mobile: horizontal scrollable tab bar */}
      <div className="mb-4 md:hidden">
        <div className="rounded-xl border bg-white p-3 mb-3">
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition",
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop: sidebar + content grid */}
      <div className="hidden md:grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <div className="rounded-xl border bg-white p-4 mb-3">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact
                ? pathname === href
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>

      {/* Mobile: main content full width */}
      <div className="md:hidden">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default AccountLayout;
