import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
} from "lucide-react";

import DashboardCard from "@/components/dashboard/DashboardCard";

const AdminDashboardPage = () => {
  return (
    <div className="p-8">

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Welcome back 👋
        </p>
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

        <DashboardCard
          title="Customers"
          value={0}
          icon={<Users size={28} />}
        />

      </div>

    </div>
  );
};

export default AdminDashboardPage;