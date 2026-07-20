"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";

import { makeStore } from "@/store/store";

interface ReduxProviderProps {
  children: ReactNode;
}

export default function ReduxProvider({
  children,
}: ReduxProviderProps) {
  const store = makeStore();

  return (
    <Provider store={store}>{children}</Provider>
  );
}
