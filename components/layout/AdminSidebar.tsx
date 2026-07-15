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
    title: "Products",
    href: "/admin/products",
    icon: Package,
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
    <aside className="w-64 bg-slate-900 text-white h-screen sticky top-0 overflow-y-auto">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold">Clothing Admin</h1>
        <p className="text-sm text-slate-400 mt-1">
          Management Panel
        </p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(({ title, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200",
                  pathname === href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
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