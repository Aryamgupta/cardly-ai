"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import {
  getPendingFollowUpNotifications,
  NotificationItem,
} from "@/app/actions/notifications";
import { NotificationCard } from "./Cards/NotificationCard";

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch notifications on mount
    const fetchNotifs = async () => {
      const data = await getPendingFollowUpNotifications();
      setNotifications(data);
    };
    fetchNotifs();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length; // Simple mapping, they are all 'unread' technically

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground relative hover:bg-slate-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    onClick={setIsOpen}
                  />
                ))}
              </div>
            ) : (
              NotificationEmptyBanner()
            )}
          </div>
          <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
            <span className="text-xs text-muted-foreground font-medium">
              Cardly Reminders
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


const NotificationEmptyBanner = () => {
  return (
    <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-2">
      <Bell className="w-8 h-8 opacity-20" />
      <p className="text-sm">You&apos;re all caught up!</p>
    </div>
  )
}