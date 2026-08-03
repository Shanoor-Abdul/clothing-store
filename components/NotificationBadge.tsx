"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useAppDispatch, useAppSelector } from "@/store";
import { clearUnread, clearAll } from "@/features/notifications/notificationsSlice";

interface NotificationBadgeProps {
  /** "admin" uses dark header bg; "store" uses slate-900 header bg */
  variant?: "admin" | "store";
}

const NotificationBadge = ({ variant = "admin" }: NotificationBadgeProps) => {
  const dispatch = useAppDispatch();
  const { list, unreadCount } = useAppSelector((s) => s.notifications);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      dispatch(clearUnread());
    }
  };

  const iconColor = variant === "admin" ? "text-slate-600" : "text-slate-300";
  const hoverBg = variant === "admin" ? "hover:bg-slate-100" : "hover:bg-slate-800";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg ${hoverBg} transition`}
        aria-label="Notifications"
      >
        <Bell size={20} className={iconColor} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow animate-bounce">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-[200] w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-orange-400" />
              <span className="text-sm font-bold text-white">Notifications</span>
              {list.length > 0 && (
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                  {list.length}
                </span>
              )}
            </div>
            {list.length > 0 && (
              <button
                onClick={() => dispatch(clearAll())}
                className="text-[11px] text-slate-400 hover:text-red-400 transition"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              list.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition"
                >
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                    {notif.type === "order_created" ? "🛍️" : "📦"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">{notif.message}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
