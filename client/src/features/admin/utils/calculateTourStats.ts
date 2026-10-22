import type { Tour } from "../../tours/types";

export const calculateTourStats = (tours: Tour[]) => {
  const totalTours = tours.length;

  if (totalTours === 0) {
    return {
      totalTours: 0,
      avgRating: 0,
      avgPrice: 0,
      totalCapacity: 0,
    };
  }

  const totals = tours.reduce(
    (acc, tour) => ({
      ratings: acc.ratings + tour.ratingsAverage,
      prices: acc.prices + tour.price,
      capacity: acc.capacity + tour.maxGroupSize,
    }),
    {
      ratings: 0,
      prices: 0,
      capacity: 0,
    },
  );

  return {
    totalTours,
    avgRating: Number((totals.ratings / totalTours).toFixed(1)),
    avgPrice: Math.round(totals.prices / totalTours),
    totalCapacity: totals.capacity,
  };
};