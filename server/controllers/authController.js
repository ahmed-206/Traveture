import catchAsync from '../utils/catchAsync.js';
import * as authService from '../services/authService.js';
import { setAuthCookies } from '../utils/cookie.js';
import {
  clearAccessCookie,
  clearRefreshCookie,
} from '../utils/cookieOptions.js';
import AppError from '../utils/appError.js';
import sendResponse from '../utils/sendResponse.js';

// //////////////////////////////////////////////////////////

export const signup = catchAsync(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.signup(
    req.body,
  );

  setAuthCookies(res, accessToken, refreshToken);
  sendResponse(res, 201, { message: 'Account created successfully', data: { user } });
});

// //////////////////////////////////////////////////////////

export const login = catchAsync(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  sendResponse(res, 200, { message: 'Logged in successfully', data: { user } });
});

// //////////////////////////////////////////////////////////

export const protect = catchAsync(async (req, res, next) => {
  req.user = await authService.protect(req);
  next();
});

// //////////////////////////////////////////////////////////

export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) await authService.logout(refreshToken);

  res.clearCookie('accessToken', clearAccessCookie);
  res.clearCookie('refreshToken', clearRefreshCookie);
  sendResponse(res, 200, { message: 'Logged out successfully' });
});

// //////////////////////////////////////////////////////////
export const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('Refresh token missing', 401));
  }

  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  sendResponse(res, 200, { message: 'Tokens refreshed successfully' });
});

// //////////////////////////////////////////////////////////

export const forgotPassword = catchAsync(async (req, res, next) => {
  const requestUrl = process.env.CLIENT_URL;
  const result = await authService.forgotPassword(req.body.email, requestUrl);

  sendResponse(res, 200, { message: result.message });
});

// //////////////////////////////////////////////////////////

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const { user, accessToken, refreshToken } = await authService.resetPassword({
    token,
    password,
    passwordConfirm,
  });

  setAuthCookies(res, accessToken, refreshToken);

  sendResponse(res, 200, { message: 'Password reset successfully', data: { user } });
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permisson to perform this action!', 403),
      );
    }
    next();
  };
