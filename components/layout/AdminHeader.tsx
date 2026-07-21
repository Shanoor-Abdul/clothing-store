"use client";

import { Bell, LogOut, Search, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useLogout } from "@/features/auth/hooks";
import { useAppDispatch } from "@/store";
import { clearAuth } from "@/features/auth/slice";

const AdminHeader = () => {
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
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Admin Dashboard
        </h2>
      </div>

      <div className="hidden md:flex items-center relative w-[350px]">
        <Search
          className="absolute left-3 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell size={22} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={32} />
          <div className="hidden md:block">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-500">
              admin@store.com
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
