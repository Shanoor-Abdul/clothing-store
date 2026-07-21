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
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <h2 className="mt-3 text-4xl font-semibold text-slate-900">
            {value}
          </h2>
          {description && (
            <p className="mt-3 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;