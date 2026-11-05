import { useRef, useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa6';
import { useMyNotifications } from '../hooks/useMyNotifications';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import { useMarkAllRead } from '../hooks/useMarkAllRead';
import { NotificationItem } from './NotificationItem';

interface Props {
  isScrolled: boolean;
}

export const NotificationDropdown = ({ isScrolled }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        className="relative p-2 rounded-full bg-body/20 backdrop-blur-md hover:scale-105 transition-transform"
      >
        <FaBell size={18} className={isScrolled ? 'text-primary' : 'text-white'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-bold text-heading">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-105 overflow-y-auto divide-y divide-gray-50">
            {isLoading && (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="py-12 text-center">
                <FaBell size={28} className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm text-body">No notifications yet</p>
              </div>
            )}

            {!isLoading &&
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onRead={(id) => markRead.mutate(id)}
                  isMarkingRead={markRead.isPending}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
