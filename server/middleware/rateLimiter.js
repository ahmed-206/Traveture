import rateLimit from 'express-rate-limit';

// Rate limiter for forgot password endpoint

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'fail',
    message: 'Too many password reset requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false, 
  skipSuccessfulRequests: false, 
});
