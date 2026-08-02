"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function GlobalLoadingOverlay() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0 || isMutating > 0;
  const isSaving = isMutating > 0;

  if (!isLoading) return null;

  return (
    <>
      {/* Top Animated Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 animate-pulse" />

      {/* Glassmorphic Mutation Overlay when saving data to prevent double-clicks */}
      {isSaving && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] transition-all">
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 px-6 py-4 shadow-2xl border border-slate-100 text-slate-800">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-xs font-bold tracking-wide">
              Processing request... Please wait
            </span>
          </div>
        </div>
      )}
    </>
  );
}
