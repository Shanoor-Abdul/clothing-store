import { ReactNode } from "react";

import StoreHeader from "./components/StoreHeader";
import StoreFooter from "./components/StoreFooter";

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
};

export default StoreLayout;
