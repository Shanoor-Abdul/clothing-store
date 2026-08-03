"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store";
import { addNotification } from "./notificationsSlice";
import { getSupabaseClient } from "./supabaseClient";
import { AppNotification } from "./types";

// Prisma generates table name exactly as the model name.
// In Supabase, without @@map, it's the model name: "Order"
// If your Supabase tables are lowercase, change to "orders"
const ORDER_TABLE = "Order";

export const useRealtime = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.role);
  const user = useAppSelector((s) => s.auth.user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("[Realtime] Supabase not configured — skipping live notifications.");
      return;
    }

    // Cleanup previous subscription
    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current); } catch { /* ignore */ }
      channelRef.current = null;
    }

    const channelName = role === "ADMIN" ? "admin-orders" : `user-orders-${user.id}`;
    const channel = supabase.channel(channelName);

    const statusLabels: Record<string, string> = {
      PENDING: "Pending",
      CONFIRMED: "Confirmed",
      PROCESSING: "Processing",
      SHIPPED: "Shipped",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      PAYMENT_PENDING: "Payment Pending",
    };

    if (role === "ADMIN") {
      // Admin: new order placed
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: ORDER_TABLE },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          try {
            const order = payload.new;
            const notification: AppNotification = {
              id: `order-created-${order.id}-${Date.now()}`,
              type: "order_created",
              message: `🛍️ New order #${order.orderNumber || order.id?.slice(0, 8)} placed!`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              timestamp: new Date().toISOString(),
            };
            dispatch(addNotification(notification));
            toast(notification.message, {
              style: { background: "#1e293b", border: "1px solid #ff8c00", color: "#fff" },
              duration: 7000,
            });
          } catch { /* ignore */ }
        }
      );

      // Admin: any order status changed
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: ORDER_TABLE },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          try {
            const order = payload.new;
            const prevStatus = payload.old?.status;
            const newStatus = order.status;
            if (prevStatus === newStatus) return;

            const label = statusLabels[newStatus] || newStatus;
            const notification: AppNotification = {
              id: `admin-status-${order.id}-${Date.now()}`,
              type: "order_status_changed",
              message: `🔄 Order #${order.orderNumber || order.id?.slice(0, 8)} updated to "${label}"`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              timestamp: new Date().toISOString(),
            };
            dispatch(addNotification(notification));
            toast(notification.message, {
              style: { background: "#1e293b", border: "1px solid #ff8c00", color: "#fff" },
              duration: 7000,
            });
          } catch { /* ignore */ }
        }
      );
    } else {
      // User: their order status changed (any change, not just payment pending)
      channel.on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: ORDER_TABLE },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          try {
            const order = payload.new;
            // Only notify for this user's orders
            if (order.userId !== user.id) return;

            const prevStatus = payload.old?.status;
            const newStatus = order.status;
            if (prevStatus === newStatus) return;

            const label = statusLabels[newStatus] || newStatus;
            const notification: AppNotification = {
              id: `order-status-${order.id}-${Date.now()}`,
              type: "order_status_changed",
              message: `📦 Your order #${order.orderNumber || order.id?.slice(0, 8)} is now "${label}"`,
              orderId: order.id,
              orderNumber: order.orderNumber,
              timestamp: new Date().toISOString(),
            };
            dispatch(addNotification(notification));
            toast(notification.message, {
              style: { background: "#1e293b", border: "1px solid #ff8c00", color: "#fff" },
              duration: 7000,
            });
          } catch { /* ignore */ }
        }
      );
    }

    try {
      channel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Subscribed to channel: ${channelName}`);
        }
        if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Channel error on: ${channelName}`);
        }
      });
      channelRef.current = channel;
    } catch (err) {
      console.error("[Realtime] Subscribe failed:", err);
    }

    return () => {
      if (channelRef.current) {
        try { supabase.removeChannel(channelRef.current); } catch { /* ignore */ }
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, role, user?.id, dispatch]);
};
