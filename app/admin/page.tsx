"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

import DashboardCard from "@/components/dashboard/DashboardCard";
import { StatsCardSkeleton } from "@/components/common/Skeleton";
import api from "@/lib/axios";
import { formatCurrency } from "@/utils";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    user: { name: string; email: string } | null;
    items: Array<{ id: string; productName: string; quantity: number }>;
  }>;
  ordersByStatus: Record<string, number>;
}

const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<ApiResponse<DashboardData>>(
    "/admin/dashboard"
  );
  return data.data;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const AdminDashboardPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 shadow-xl sm:p-10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-white/20" />
            <div className="h-10 w-72 rounded bg-white/20" />
            <div className="h-4 w-48 rounded bg-white/20" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600 font-medium">
            Failed to load dashboard data
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentOrders, ordersByStatus } = data;

  return (
    <div className="space-y-10">
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 sm:p-8 shadow-xl shadow-slate-900/30 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
              Admin dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
              Store Overview
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              View store performance, manage inventory, and process orders in
              one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:w-full sm:max-w-xs">
            <div className="rounded-3xl bg-white/10 p-4 text-white shadow-md shadow-slate-950/20 backdrop-blur">
              <p className="text-sm text-slate-300">Total Orders</p>
              <p className="mt-2 text-2xl font-semibold">
                {stats.totalOrders}
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 text-white shadow-md shadow-slate-950/20 backdrop-blur">
              <p className="text-sm text-slate-300">Revenue</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(Number(stats.totalRevenue))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/products">
          <DashboardCard
            title="Products"
            value={stats.totalProducts}
            icon={<Package size={28} />}
            description="Manage inventory"
          />
        </Link>

        <Link href="/admin/categories">
          <DashboardCard
            title="Categories"
            value={stats.totalCategories}
            icon={<FolderTree size={28} />}
            description="Organize products"
          />
        </Link>

        <Link href="/admin/orders">
          <DashboardCard
            title="Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart size={28} />}
            description={`${ordersByStatus.PENDING || 0} pending`}
          />
        </Link>

        <DashboardCard
          title="Customers"
          value={stats.totalCustomers}
          icon={<Users size={28} />}
          description="Registered users"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-slate-500" />
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No orders yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.user?.name || "Guest"} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[order.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-slate-500" />
            <h2 className="text-lg font-semibold">Orders by Status</h2>
          </div>
          {Object.keys(ordersByStatus).length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              No order data available
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(ordersByStatus).map(([status, count]) => {
                const total = stats.totalOrders || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">
                        {status.toLowerCase()}
                      </span>
                      <span className="text-slate-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === "DELIVERED"
                            ? "bg-green-500"
                            : status === "PENDING"
                            ? "bg-yellow-500"
                            : status === "CANCELLED"
                            ? "bg-red-500"
                            : status === "SHIPPED"
                            ? "bg-purple-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;