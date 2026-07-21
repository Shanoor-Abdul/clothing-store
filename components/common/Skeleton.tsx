import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "image";
  width?: string | number;
  height?: string | number;
}

const Skeleton = ({
  className,
  variant = "text",
  width,
  height,
}: SkeletonProps) => {
  return (
    <div
      className={clsx(
        "animate-pulse bg-slate-200",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        variant === "image" && "rounded-xl",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      style={{ width, height }}
    />
  );
};

export default Skeleton;

export const ProductCardSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
    <div className="mb-3 aspect-[4/5] w-full rounded-xl bg-slate-200" />
    <div className="space-y-2 p-1">
      <div className="h-3 w-3/4 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
      <div className="mt-2 h-8 w-full rounded-lg bg-slate-200" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="rounded-xl border bg-white p-4">
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton variant="circular" className="h-10 w-10" />
    </div>
    <Skeleton className="mt-4 h-3 w-32" />
  </div>
);