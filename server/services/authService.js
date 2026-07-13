import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { generateAuthTokens, hashToken } from './tokenService.js';
import { sendEmail } from './emailService.js';
import AppError from '../utils/appError.js';

const saveRefreshToken = async (user, refreshToken) => {
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
};

const sanitizeUser = (user) => {
  user.password = undefined;
  user.refreshTokenHash = undefined;

  return user;
};

const createAuthResponse = async (user) => {
  const { accessToken, refreshToken } = generateAuthTokens(user._id);
  await saveRefreshToken(user, refreshToken);
  sanitizeUser(user);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const signup = async (userData) => {
  const user = await User.create({
    name: userData.name,
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    passwordConfirm: userData.passwordConfirm,
  });

  return createAuthResponse(user);
};

export const login = async (userData) => {
  const { email, password } = userData;
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  return createAuthResponse(user);
};

export const protect = async (req) => {
  let token = req.cookies.accessToken;
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new AppError(
      'Your are not logged in!, please log in to get access.',
      401,
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_ACCESS_SECRET,
  );

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError(
      'The user belonging to this token no longer exists.!',
      401,
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new AppError(
      'User recently changed password! please log in to get access.',
      401,
    );
  }

  return currentUser;
};

export const logout = async (refreshToken) => {
  try {
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );
    await User.findByIdAndUpdate(decoded.id, {
      $unset: { refreshTokenHash: 1 },
    });
  } catch (error) {
    return;
  }
};

// Refresh Tokens
export const refreshTokens = async (currentRefreshToken) => {
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      currentRefreshToken,
      process.env.JWT_REFRESH_SECRET,
    );
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  const incomingHash = hashToken(currentRefreshToken);

  if (!user || incomingHash !== user.refreshTokenHash) {
    user.refreshTokenHash = undefined; // مسح الجلسة تماماً لحماية المستخدم
    await user.save({ validateBeforeSave: false });
    throw new AppError('Invalid refresh token', 401);
  }

  const { accessToken, refreshToken } = generateAuthTokens(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// Forgot password
export const forgotPassword = async (userEmail, requestUrl) => {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
  if (!user) {
    return {
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    };
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${requestUrl}/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit the PATCH request with your new password and passwordConfirm
  to: ${resetURL}./\nIf you didn't forgot your password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    return { success: true, message: 'Token sent to email!' };
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError(
      'There was an error sending the email. Try again later.',
      500,
    );
  }
};

// Resest Password

export const resetPassword = async ({ token, password, passwordConfirm }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return createAuthResponse(user);
};
