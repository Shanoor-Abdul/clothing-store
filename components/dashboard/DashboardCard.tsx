import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

const DashboardCard = ({
  title,
  value,
  icon,
  description,
}: DashboardCardProps) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition-all">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </h2>

          {description && (
            <p className="mt-3 text-sm text-gray-400">
              {description}
            </p>
          )}

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          {icon}
        </div>

      </div>

    </div>
  );
};

export default DashboardCard;