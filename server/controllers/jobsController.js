import crypto from 'crypto';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { runBookingMaintenance } from '../services/bookingMaintenance.js';

const safeEqual = (a, b) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

export const authorizeJob = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return next(new AppError('CRON_SECRET is not configured', 500));

  const header = req.headers.authorization ?? '';
  if (!safeEqual(header, `Bearer ${secret}`)) {
    return next(new AppError('Unauthorized', 401));
  }
  next();
};

export const runJobs = catchAsync(async (req, res) => {
  const summary = await runBookingMaintenance();
  res.status(200).json({ status: 'success', data: summary });
});
