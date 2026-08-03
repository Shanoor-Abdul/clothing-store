"use client";

import { Menu, LogOut, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLogout } from "@/features/auth/hooks";
import { useAppDispatch } from "@/store";
import { clearAuth } from "@/features/auth/slice";
import NotificationBadge from "@/components/NotificationBadge";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

const AdminHeader = ({ onMenuClick }: AdminHeaderProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      dispatch(clearAuth());
      toast.success("Logged out");
    } catch {
      toast.error("Unable to log out. Redirecting to login.");
    } finally {
      router.replace("/admin/login");
    }
  };

  return (
    <header className="h-14 md:h-16 border-b bg-white px-3 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-base md:text-xl font-semibold text-slate-800 truncate">
          Admin Dashboard
        </h2>
      </div>

      {/* Center: Search bar — hidden on small screens */}
      <div className="hidden lg:flex items-center relative w-[280px] xl:w-[350px]">
        <Search className="absolute left-3 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right: Bell + User + Logout */}
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationBadge variant="admin" />

        <div className="hidden sm:flex items-center gap-2">
          <UserCircle size={28} />
          <div className="hidden md:block leading-tight">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-500">admin@store.com</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg bg-red-500 px-2.5 md:px-4 py-2 text-white hover:bg-red-600 transition text-sm"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
