import catchAsync from '../utils/catchAsync.js';
import { createCheckoutSession } from '../services/paymentService.js';
import sendResponse from '../utils/sendResponse.js';

export const createCheckoutSessionHandler = catchAsync(async (req, res) => {
  const session = await createCheckoutSession({
    userId: req.user.id,
    tourId: req.body.tourId,
    guests: req.body.guests,
    startDate: req.body.startDate,
  });

  sendResponse(res, 200, { data: { url: session.url } });
});
