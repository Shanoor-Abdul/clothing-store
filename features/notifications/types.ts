export type NotificationType = "order_created" | "order_status_changed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  orderId?: string;
  orderNumber?: string;
  timestamp: string;
}
