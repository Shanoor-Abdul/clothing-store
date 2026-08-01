"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  Layers3,
  Tags,
  Palette,
  Ruler,
  Image,
  ShoppingCart,
  Users,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Collections",
    href: "/admin/collections",
    icon: Layers3,
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: Tags,
  },
  {
    title: "Colors",
    href: "/admin/colors",
    icon: Palette,
  },
  {
    title: "Sizes",
    href: "/admin/sizes",
    icon: Ruler,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Banners",
    href: "/admin/banners",
    icon: Image,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-950 text-white h-screen sticky top-0 overflow-y-auto border-r border-slate-800 shadow-xl shadow-slate-950/30">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-2xl font-semibold text-white">Clothing Admin</h1>
        <p className="mt-1 text-sm text-slate-400">Management Panel</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(({ title, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-3xl px-4 py-3 text-sm transition duration-200",
                  pathname === href
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white hover:shadow-inner"
                )}
              >
                <Icon size={20} />
                <span>{title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;