import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import * as statsService from '../services/statsService.js';

export const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await statsService.getDashboardStats();
  sendResponse(res, 200, { data: stats });
});
