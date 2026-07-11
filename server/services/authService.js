import User from '../models/userModel.js';
import { generateAuthTokens, hashToken } from './tokenService.js';
import AppError from '../utils/appError.js';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

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
    throw new AppError('The user belonging to this token no longer exists.!', 401);
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    throw new AppError(
      'User recently changed password! please log in to get access.',
      401,
    );
  }

  return currentUser;
};
