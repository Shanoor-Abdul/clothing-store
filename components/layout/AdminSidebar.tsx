"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X,
  LayoutDashboard,
  FolderTree,
  Package,
  Layers3,
  Tags,
  Palette,
  Ruler,
  Image,
  ShoppingCart,
  DollarSign,
  Users,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Collections", href: "/admin/collections", icon: Layers3 },
  { title: "Brands", href: "/admin/brands", icon: Tags },
  { title: "Colors", href: "/admin/colors", icon: Palette },
  { title: "Sizes", href: "/admin/sizes", icon: Ruler },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Banners", href: "/admin/banners", icon: Image },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Revenue & Analytics", href: "/admin/revenue", icon: DollarSign },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidebarContent = ({ onClose }: { onClose: () => void }) => {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-slate-950 text-white h-full flex flex-col border-r border-slate-800 shadow-xl shadow-slate-950/30">
      <div className="border-b border-slate-800 p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Clothing Admin</h1>
          <p className="mt-0.5 text-xs text-slate-400">Management Panel</p>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map(({ title, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition duration-200",
                  pathname === href
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/20"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon size={18} />
                <span>{title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  return (
    <>
      {/* Desktop: always visible sticky sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 flex-shrink-0">
        <SidebarContent onClose={onClose} />
      </div>

      {/* Mobile: overlay drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <div className="relative flex h-full w-64 max-w-[85vw] flex-shrink-0 animate-[slideInLeft_0.22s_ease]">
            <SidebarContent onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;