import crypto from 'crypto';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generateToken.js';

export const generateAuthTokens = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
