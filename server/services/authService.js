import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { generateAuthTokens, hashToken } from './tokenService.js';
import { sendEmail } from './emailService.js';
import AppError from '../utils/appError.js';
import validator from 'validator';

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
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+password',
  );
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
      "You're not logged in, please log in to get access.",
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

// Logout
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

  if (!user) {
    throw new AppError('Invalid refresh token', 401);
  }
  if (incomingHash !== user.refreshTokenHash) {
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
const RESET_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown between reset emails per user

export const forgotPassword = async (userEmail, requestUrl) => {
  const genericResponse = {
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  };

  if (typeof userEmail !== 'string' || !validator.isEmail(userEmail.trim())) {
    throw new AppError('Please provide a valid email', 400);
  }

  const cooldownThreshold = new Date(Date.now() - RESET_COOLDOWN_MS);

  const user = await User.findOneAndUpdate(
    {
      email: userEmail.trim().toLowerCase(),
      $or: [
        { passwordResetRequestedAt: null },
        { passwordResetRequestedAt: { $lt: cooldownThreshold } },
      ],
    },
    { passwordResetRequestedAt: new Date() },
    { new: true },
  );

  if (!user) {
    return genericResponse;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${requestUrl}/resetPassword/${resetToken}`;
  const message = `Hi ${user.name.split(' ')[0]},

We received a request to reset the password for your Traveture account.

Click the link below to choose a new password. The link is valid for 10 minutes:

${resetURL}

If you didn't request this, you can safely ignore this email. Your password will stay the same.

The Traveture Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
  } catch (error) {
    console.error('[forgotPassword] Failed to send email:', error);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetRequestedAt = undefined;
    await user.save({ validateBeforeSave: false });
  }
  return genericResponse;
};

// Reset Password
export const resetPassword = async ({ token, password, passwordConfirm }) => {
  if (typeof token !== 'string' || !password || !passwordConfirm) {
    throw new AppError('Token, password and passwordConfirm are required', 400);
  }
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
  user.passwordResetRequestedAt = undefined;

  // Invalidate all existing sessions so old refresh tokens can't be reused
  user.refreshTokenHash = undefined;
  await user.save();

  return createAuthResponse(user);
};

// Update Password
export const updatePassword = async ({
  userId,
  currentPassword,
  password,
  passwordConfirm,
}) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!(await user.isPasswordCorrect(currentPassword, user.password))) {
    throw new AppError('Incorrect password', 401);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  // Invalidate old session before issuing new tokens
  user.refreshTokenHash = undefined;
  await user.save();

  return createAuthResponse(user);
};
