"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {getPages().map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 w-10 items-center justify-center text-sm text-slate-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={clsx(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition",
              currentPage === page
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;