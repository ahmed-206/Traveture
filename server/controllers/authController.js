import catchAsync from '../utils/catchAsync.js';

import User from '../models/userModel.js';
import * as authService from '../services/authService.js';
import { setAuthCookies } from '../utils/cookie.js';

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
