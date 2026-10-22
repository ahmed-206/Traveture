const tones: Record<string, { dot: string; badge: string }> = {
  pending: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  confirmed: { dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
  completed: { dot: "bg-sky-500", badge: "bg-sky-100 text-sky-700" },
  cancelled: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" },
  paid: { dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
  failed: { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  refunded: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
};

const toneOf = (status: string) => tones[status] ?? tones.cancelled;

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${toneOf(status).badge}`}
  >
    {status}
  </span>
);

interface BookingStatusListProps {
  title: string;
  counts: Record<string, number>;
}

export const BookingStatusList = ({ title, counts }: BookingStatusListProps) => (
  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-heading">{title}</h2>

    <ul className="mt-4 divide-y divide-gray-100">
      {Object.entries(counts).map(([status, count]) => (
        <li key={status} className="flex items-center justify-between py-3">
          <span className="flex items-center gap-3 text-sm capitalize text-body">
            <span
              className={`h-2.5 w-2.5 rounded-full ${toneOf(status).dot}`}
              aria-hidden="true"
            />
            {status}
          </span>
          <span className="font-semibold text-heading">{count}</span>
        </li>
      ))}
    </ul>
  </section>
);
