import { FaBell, FaCheck, FaCircleCheck, FaBan, FaRotateLeft } from 'react-icons/fa6';
import type { Notification } from '../types';

const TYPE_ICON: Record<Notification['type'], React.ReactNode> = {
  BOOKING_CONFIRMED: <FaCircleCheck className="text-green-500" size={16} />,
  BOOKING_CANCELLED: <FaBan className="text-red-500" size={16} />,
  BOOKING_COMPLETED: <FaCheck className="text-primary" size={16} />,
  REFUND_SUCCEEDED: <FaRotateLeft className="text-amber-500" size={16} />,
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
  return new Date(dateStr).toLocaleDateString();
};

interface Props {
  notification: Notification;
  onRead: (id: string) => void;
  isMarkingRead: boolean;
}

export const NotificationItem = ({ notification, onRead, isMarkingRead }: Props) => {
  return (
    <article
      className={`flex gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-primary/5' : ''
      }`}
    >
      {/* Type icon */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
        {TYPE_ICON[notification.type] ?? <FaBell size={15} className="text-body" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${notification.isRead ? 'text-body' : 'text-heading'}`}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-body line-clamp-2">{notification.message}</p>
        <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(notification.occurredAt)}</p>
      </div>

      {/* Mark-read button */}
      {!notification.isRead && (
        <button
          onClick={() => onRead(notification._id)}
          disabled={isMarkingRead}
          aria-label="Mark as read"
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
        />
      )}
    </article>
  );
};
