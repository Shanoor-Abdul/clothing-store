import { Package, FolderTree, ShoppingCart, Users } from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

const AdminDashboardPage = () => {
  return (
    <div className="space-y-10">
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 shadow-xl shadow-slate-900/30 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">
              Admin dashboard
            </p>
            <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
              Welcome back, Administrator
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              View store performance, manage inventory, and process orders in one place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:w-full sm:max-w-xs">
            <div className="rounded-3xl bg-white/10 p-4 text-white shadow-md shadow-slate-950/20 backdrop-blur">
              <p className="text-sm text-slate-300">Today</p>
              <p className="mt-2 text-2xl font-semibold">142</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 text-white shadow-md shadow-slate-950/20 backdrop-blur">
              <p className="text-sm text-slate-300">New orders</p>
              <p className="mt-2 text-2xl font-semibold">18</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Products"
          value={0}
          icon={<Package size={28} />}
        />

        <DashboardCard
          title="Categories"
          value={0}
          icon={<FolderTree size={28} />}
        />

        <DashboardCard
          title="Orders"
          value={0}
          icon={<ShoppingCart size={28} />}
        />

        <DashboardCard title="Customers" value={0} icon={<Users size={28} />} />
      </div>
    </div>
  );
};
export default AdminDashboardPage;
