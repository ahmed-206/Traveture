import AppError from './appError.js';



export const BOOKING_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
};

export const PAYMENT_TRANSITIONS = {
  pending: ['paid', 'failed'],
  paid: ['refunded'],
  failed: ['paid'],
  refunded: [],
};


export const SEAT_HOLDING_STATUSES = ['pending', 'confirmed', 'completed'];

export const holdsSeats = (status) => SEAT_HOLDING_STATUSES.includes(status);

export const isFinalBookingStatus = (status) =>
  BOOKING_TRANSITIONS[status]?.length === 0;


const assertTransition = (map, label, from, to) => {
  if (from === to) return;
  if (!map[from]?.includes(to)) {
    throw new AppError(`Illegal ${label} transition: ${from} -> ${to}`, 400);
  }
};



export const assertBookingTransition = (from, to) =>
  assertTransition(BOOKING_TRANSITIONS, 'booking status', from, to);

export const assertPaymentTransition = (from, to) =>
  assertTransition(PAYMENT_TRANSITIONS, 'payment status', from, to);

export const validateBookingChange = (current, changes) => {
  const status = changes.status ?? current.status;
  const paymentStatus = changes.paymentStatus ?? current.paymentStatus;

  assertBookingTransition(current.status, status);
  assertPaymentTransition(current.paymentStatus, paymentStatus);


  if ((status === 'confirmed' || status === 'completed') && paymentStatus !== 'paid') {
    throw new AppError('A confirmed/completed booking must be paid', 400);
  }
  if (paymentStatus === 'failed' && status !== 'cancelled') {
    throw new AppError('Payment can only be marked failed on a cancelled booking', 400);
  }
  if (paymentStatus === 'refunded' && status !== 'cancelled') {
    throw new AppError('Only a cancelled booking can be refunded', 400);
  }

  return { status, paymentStatus };
};
