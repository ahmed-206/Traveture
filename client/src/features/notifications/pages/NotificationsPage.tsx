import { FaBell, FaCheck, FaCircleCheck, FaBan, FaRotateLeft } from 'react-icons/fa6';
import { useMyNotifications } from '../hooks/useMyNotifications';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import { useMarkAllRead } from '../hooks/useMarkAllRead';
import type { Notification } from '../types';

const TYPE_ICON: Record<Notification['type'], React.ReactNode> = {
  BOOKING_CONFIRMED: <FaCircleCheck className="text-green-500" size={18} />,
  BOOKING_CANCELLED: <FaBan className="text-red-500" size={18} />,
  BOOKING_COMPLETED: <FaCheck className="text-primary" size={18} />,
  REFUND_SUCCEEDED: <FaRotateLeft className="text-amber-500" size={18} />,
};

const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NotificationsPage = () => {
  const { data, isPending, isError } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading">Notifications</h1>
          <p className="mt-1 text-sm text-body">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <FaCheck size={10} />
            Mark all as read
          </button>
        )}
      </header>

      {/* Loading */}
      {isPending && (
        <div className="flex justify-center py-16" role="status" aria-label="Loading notifications">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      )}

      {/* Error */}
      {!isPending && isError && (
        <div
          className="rounded-xl border border-error/50 bg-red-50 p-5 text-sm text-error"
          role="alert"
        >
          Failed to load your notifications. Please try again.
        </div>
      )}

      {/* Empty state */}
      {!isPending && !isError && notifications.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
            <FaBell />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-heading">No notifications yet</h2>
          <p className="mt-1 text-sm text-body">
            We'll notify you about booking updates, cancellations, and refunds.
          </p>
        </div>
      )}

      {/* Notification list */}
      {!isPending && !isError && notifications.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {notifications.map((n, i) => (
            <article
              key={n._id}
              className={`flex gap-4 px-5 py-4 transition-colors hover:bg-gray-50 ${
                i < notifications.length - 1 ? 'border-b border-gray-100' : ''
              } ${!n.isRead ? 'bg-primary/5' : ''}`}
            >
              {/* Icon */}
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                {TYPE_ICON[n.type] ?? <FaBell size={16} className="text-body" />}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${n.isRead ? 'text-body' : 'text-heading'}`}>
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatRelativeTime(n.occurredAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-body">{n.message}</p>
              </div>

              {/* Unread dot / mark-read button */}
              {!n.isRead && (
                <button
                  onClick={() => markRead.mutate(n._id)}
                  disabled={markRead.isPending}
                  aria-label="Mark as read"
                  title="Mark as read"
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary hover:opacity-70 transition-opacity disabled:opacity-40 cursor-pointer"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
