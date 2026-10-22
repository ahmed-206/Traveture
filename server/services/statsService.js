import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';

const toCountMap = (rows, keys) => {
  const map = Object.fromEntries(keys.map((key) => [key, 0]));
  rows.forEach(({ _id, count }) => {
    map[_id] = count;
  });
  return map;
};

const getTourStats = async () => {
  const [stats] = await Tour.aggregate([
    {
      $group: {
        _id: null,
        totalTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        // $avg ignores null, so tours without reviews don't pull the average
        avgRating: {
          $avg: {
            $cond: [{ $gt: ['$ratingsQuantity', 0] }, '$ratingsAverage', null],
          },
        },
      },
    },
  ]);

  return {
    totalTours: stats?.totalTours ?? 0,
    avgPrice: Math.round(stats?.avgPrice ?? 0),
    avgRating:
      stats?.avgRating != null ? Number(stats.avgRating.toFixed(1)) : null,
  };
};

const getBookingStats = async () => {
  const BOOKING_STATUSES = Booking.schema.path('status').options.enum;
  const PAYMENT_STATUSES = Booking.schema.path('paymentStatus').options.enum;

  const [result] = await Booking.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        byPaymentStatus: [
          { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
        ],
        paid: [
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, revenue: { $sum: '$price' } } },
        ],
      },
    },
  ]);

  return {
    total: result.total[0]?.count ?? 0,
    byStatus: toCountMap(result.byStatus, BOOKING_STATUSES),
    byPaymentStatus: toCountMap(result.byPaymentStatus, PAYMENT_STATUSES),
    revenue: result.paid[0]?.revenue ?? 0,
  };
};

export const getDashboardStats = async () => {
  const [tours, bookings, recentBookings] = await Promise.all([
    getTourStats(),
    getBookingStats(),
    Booking.find().sort('-createdAt').limit(5),
  ]);

  return { tours, bookings, recentBookings };
};
