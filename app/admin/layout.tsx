import { ReactNode } from "react";
import AdminLayout from "@/components/layout/AdminLayout";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}