"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";

import QueryProvider from "./QueryProvider";
import ReduxProvider from "./ReduxProvider";
import GlobalLoadingOverlay from "@/components/common/GlobalLoadingOverlay";

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({
  children,
}: AppProviderProps) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <Toaster position="top-right" richColors closeButton duration={4000} />
        <GlobalLoadingOverlay />
        {children}
      </QueryProvider>
    </ReduxProvider>
  );
}
