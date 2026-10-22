import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatCard } from "../components/StatCard";
import { BookingStatusList } from "../components/BookingStatus";
import { RecentBookings } from "../components/RecentBookings";
import { formatCurrency } from "../utils/formatters";

const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4";

const AdminDashboard = () => {
  const { data: stats, isPending, isError } = useDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-heading">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-body">
          Overview of your tours and bookings
        </p>
      </div>

      {isPending ? (
        <div className="flex justify-center py-12" role="status" aria-label="Loading">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        </div>
      ) : isError || !stats ? (
        <p className="text-sm text-error" role="alert">
          Failed to load dashboard data. Please try again.
        </p>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-heading">Bookings</h2>
            <div className={gridClass}>
              <StatCard title="Total bookings" value={stats.bookings.total} />
              <StatCard title="Confirmed" value={stats.bookings.byStatus.confirmed} />
              {/* pending = waiting for payment (or an abandoned checkout) */}
              <StatCard title="Awaiting payment" value={stats.bookings.byStatus.pending} />
              <StatCard title="Revenue" value={formatCurrency(stats.bookings.revenue)} />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <BookingStatusList title="Booking status" counts={stats.bookings.byStatus} />
              <BookingStatusList title="Payments" counts={stats.bookings.byPaymentStatus} />
            </div>

            <RecentBookings bookings={stats.recentBookings} />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-heading">Tours</h2>
            <div className={gridClass}>
              <StatCard title="Total tours" value={stats.tours.totalTours} />
              <StatCard title="Avg price" value={formatCurrency(stats.tours.avgPrice)} />
              <StatCard title="Avg rating" value={stats.tours.avgRating?.toFixed(1) ?? "—"} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
