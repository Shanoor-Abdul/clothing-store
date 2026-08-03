"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import QueryProvider from "./QueryProvider";
import ReduxProvider from "./ReduxProvider";
import RealtimeProvider from "./RealtimeProvider";
import GlobalLoadingOverlay from "@/components/common/GlobalLoadingOverlay";
import AuthRehydrator from "@/components/AuthRehydrator";

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({
  children,
}: AppProviderProps) {
  return (
    <ReduxProvider>
      <QueryProvider>
        {/* Silently rehydrate auth from cookie on every page refresh */}
        <AuthRehydrator />
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <GlobalLoadingOverlay />
        {/* Activate Supabase Realtime subscriptions */}
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}

