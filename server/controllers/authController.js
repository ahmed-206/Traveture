import catchAsync from '../utils/catchAsync.js';
import * as authService from '../services/authService.js';
import { setAuthCookies } from '../utils/cookie.js';
import {
  clearAccessCookie,
  clearRefreshCookie,
} from '../utils/cookieOptions.js';
import AppError from '../utils/appError.js';

const sendSuccessResponse = (res, statusCode, message, data = undefined) => {
  const response = {
    status: 'success',
    message,
  };
  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
// //////////////////////////////////////////////////////////

export const signup = catchAsync(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.signup(
    req.body,
  );

  setAuthCookies(res, accessToken, refreshToken);
  sendSuccessResponse(res, 201, 'Account created successfully', { user });
});

// //////////////////////////////////////////////////////////

export const login = catchAsync(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  sendSuccessResponse(res, 200, 'Logged in successfully', { user });
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
  sendSuccessResponse(res, 200, 'Logged out successfully');
});

// //////////////////////////////////////////////////////////
export const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('Refresh token missing', 401));
  }

  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.status(200).json({ status: 'success' });
});

// //////////////////////////////////////////////////////////

export const forgotPassword = catchAsync(async (req, res, next) => {
  const requestUrl = `${req.protocol}://${req.get('host')}`;
  const result = await authService.forgotPassword(req.body.email, requestUrl);

  sendSuccessResponse(res, 200, result.message);
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

  sendSuccessResponse(res, 200, 'Password reset successfully', { user });
});
