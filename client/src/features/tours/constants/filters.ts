export const DURATION_MAP = {
  "1-3 Days": {
    "duration[gte]": 1,
    "duration[lte]": 3,
  },

  "4-7 Days": {
    "duration[gte]": 4,
    "duration[lte]": 7,
  },

  "8-10 Days": {
    "duration[gte]": 8,
    "duration[lte]": 10,
  },

  "11+ Days": {
    "duration[gte]": 11,
  },
};

export const DESTINATIONS = [
  "Cairo, Egypt",
  "Luxor, Egypt",
  "Aswan, Egypt",
  "Alexandria, Egypt",
  "Hurghada, Egypt",
  "Sharm El Sheikh, Egypt",
  "Dahab, Egypt",
  "Siwa Oasis, Egypt",
  "Fayoum, Egypt",
];

export const PRICE_MAP = {
  "Under $500": {
    "price[lte]": 500,
  },

  "$500 - $1000": {
    "price[gte]": 500,
    "price[lte]": 1000,
  },

  "$1000 - $1500": {
    "price[gte]": 1000,
    "price[lte]": 1500,
  },

  "$1500 - $2500": {
    "price[gte]": 1500,
    "price[lte]": 2500,
  },

  "$2500+": {
    "price[gte]": 2500,
  },
};

export const SORT_MAP = {
  "Most Popular": "-ratingsQuantity",
  "Highest Rated": "-ratingsAverage",
  "Price: Low to High": "price",
  "Price: High to Low": "-price",
  "Duration: Shortest": "duration",
  "Duration: Longest": "-duration",
};
