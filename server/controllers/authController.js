import catchAsync from '../utils/catchAsync.js';
import * as authService from '../services/authService.js';
import { setAuthCookies } from '../utils/cookie.js';
import {
  clearAccessCookie,
  clearRefreshCookie,
} from '../utils/cookieOptions.js';
import AppError from '../utils/appError.js';

export const signup = catchAsync(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.signup(
    req.body,
  );

  setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: {
      user,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const protect = catchAsync(async (req, res, next) => {
  req.user = await authService.protect(req);
  next();
});

export const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) await authService.logout(refreshToken);

  res.clearCookie('accessToken', clearAccessCookie);
  res.clearCookie('refreshToken', clearRefreshCookie);
  res.status(200).json({
    status: 'success',
    message: 'Logged out',
  });
});

export const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('Refresh token missing', 401));
  }

  const tokens = await authService.refreshTokens(refreshToken);
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
  res.status(200).json({ status: 'success' });
});
