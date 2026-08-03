"use client";

import { ReactNode } from "react";
import { useRealtime } from "@/features/notifications/useRealtime";

/**
 * RealtimeProvider
 * ────────────────
 * A thin wrapper that activates the Supabase Realtime subscription.
 * Must be placed inside ReduxProvider so it can read auth state.
 */
const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  useRealtime();
  return <>{children}</>;
};

export default RealtimeProvider;
