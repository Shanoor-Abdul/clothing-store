"use client";

import { ReactNode } from "react";

import QueryProvider from "./QueryProvider";
import ReduxProvider from "./ReduxProvider";

interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({
  children,
}: AppProviderProps) {
  return (
    <ReduxProvider>
      <QueryProvider>{children}</QueryProvider>
    </ReduxProvider>
  );
}
