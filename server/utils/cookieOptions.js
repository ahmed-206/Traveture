const isProd = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/users/refresh", // sent only to refresh endpoint
};
export const clearAccessCookie = {
  ...accessTokenCookieOptions,
  maxAge: 0,
};
export const clearRefreshCookie = {
  ...refreshTokenCookieOptions,
  maxAge: 0,
};
