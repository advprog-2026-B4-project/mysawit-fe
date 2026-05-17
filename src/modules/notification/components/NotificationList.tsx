"use client";

import { useNotifications, useMarkAllAsRead, useMarkAsRead } from "../hooks/useNotifications";
import { Button } from "@/components/ui/Button";

export default function NotificationList() {
  const { data: notifications, isLoading, isError } = useNotifications();
  const { mutate: markAsRead, isPending: isMarkingAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllAsRead } = useMarkAllAsRead();

  if (isLoading) {
    return <div className="py-12 text-center text-[13px] text-text-light">Memuat notifikasi...</div>;
  }

  if (isError) {
    return (
      <div className="mb-5 rounded border border-error/25 bg-error/[.06] px-4 py-3 text-[13px] text-error">
        Gagal memuat notifikasi.
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="overflow-hidden rounded-md border border-cream-dark bg-white py-12 text-center text-[13px] text-text-light">
        Belum ada notifikasi
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-md border border-cream-dark">
        <h2 className="text-[15px] font-medium text-text-dark">
          {unreadCount > 0 ? `${unreadCount} Belum Dibaca` : "Semua notifikasi telah dibaca"}
        </h2>
        {unreadCount > 0 && (
          <Button 
            onClick={() => markAllAsRead()} 
            disabled={isMarkingAllAsRead}
            variant="outline"
          >
            Tandai semua dibaca
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-cream-dark bg-white">
        {notifications.map((notif, i) => (
          <div 
            key={notif.notificationId} 
            className={`flex items-start justify-between gap-4 border-b border-cream-dark px-6 py-4 last:border-b-0 ${
              notif.isRead 
                ? "bg-white" 
                : "bg-cream-dark/20"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-[14px] ${notif.isRead ? "text-text-main" : "text-text-dark font-medium"}`}>
                  {notif.title}
                </h3>
                {!notif.isRead && (
                  <span className="h-2 w-2 rounded-full bg-gold inline-block"></span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-text-light leading-relaxed">{notif.description}</p>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-wider text-text-light/70">
                {new Date(notif.timestamp).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
            
            {!notif.isRead && (
              <Button
                onClick={() => markAsRead(notif.notificationId)}
                disabled={isMarkingAsRead}
                variant="outline"
                className="shrink-0 text-[12px] h-8 px-3"
              >
                Sudah dibaca
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}