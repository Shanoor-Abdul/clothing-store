"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store";
import { addNotification } from "./notificationsSlice";
import { getSupabaseClient } from "./supabaseClient";
import { AppNotification } from "./types";

/**
 * useRealtime – subscribes to Supabase Realtime channel events.
 *   Admins listen on "orders" channel for INSERT (new orders).
 *   Users listen on "orders" channel for UPDATE where user_id matches theirs.
 *
 * Call this hook once at the app level (inside ReduxProvider).
 */
export const useRealtime = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.role);
  const user = useAppSelector((s) => s.auth.user);
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabaseClient>["channel"]> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const supabase = getSupabaseClient();

    // Unsubscribe from old channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channelName = role === "ADMIN" ? "admin-orders" : `user-orders-${user.id}`;
    const channel = supabase.channel(channelName);

    if (role === "ADMIN") {
      // Admin listens for new orders (INSERT)
      channel.on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "Order",
        },
        (payload: any) => {
          const order = payload.new;
          const notification: AppNotification = {
            id: `order-created-${order.id}-${Date.now()}`,
            type: "order_created",
            message: `🛍️ New order #${order.orderNumber || order.id.slice(0, 8)} placed!`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            timestamp: new Date().toISOString(),
          };

          dispatch(addNotification(notification));

          // Orange toast for admin
          toast(notification.message, {
            style: {
              background: "#1e293b",
              border: "1px solid #ff8c00",
              color: "#fff",
            },
            duration: 6000,
          });
        }
      );
    } else {
      // User listens for order status changes (UPDATE) on their own orders
      channel.on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "Order",
          filter: `userId=eq.${user.id}`,
        },
        (payload: any) => {
          const order = payload.new;
          const prevStatus = payload.old?.status;
          const newStatus = order.status;

          // Only notify if status actually changed
          if (prevStatus === newStatus) return;

          const statusLabels: Record<string, string> = {
            PENDING: "Pending",
            CONFIRMED: "Confirmed",
            PROCESSING: "Processing",
            SHIPPED: "Shipped",
            DELIVERED: "Delivered",
            CANCELLED: "Cancelled",
            PAYMENT_PENDING: "Payment Pending",
          };

          const label = statusLabels[newStatus] || newStatus;
          const notification: AppNotification = {
            id: `order-status-${order.id}-${Date.now()}`,
            type: "order_status_changed",
            message: `📦 Order #${order.orderNumber || order.id.slice(0, 8)} is now "${label}"`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            timestamp: new Date().toISOString(),
          };

          dispatch(addNotification(notification));

          // Orange toast for user
          toast(notification.message, {
            style: {
              background: "#1e293b",
              border: "1px solid #ff8c00",
              color: "#fff",
            },
            duration: 6000,
          });
        }
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAuthenticated, role, user?.id, dispatch]);
};
