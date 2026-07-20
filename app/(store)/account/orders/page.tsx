"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import api from "@/lib/axios";
import { useAppSelector } from "@/store";
import { formatCurrency } from "@/utils";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchOrders = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/orders");
  return data.data;
};

const OrdersPage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {isLoading ? (
        <div className="mt-8 rounded-xl border bg-white p-8 text-center">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-white p-8 text-center text-slate-500">
          You have no orders yet.{" "}
          <Link href="/products" className="text-blue-600">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="rounded-xl border bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 border-t pt-3 text-sm">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between"
                  >
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span>
                      {formatCurrency(Number(item.price))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
