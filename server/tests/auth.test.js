import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import app from '../app';
import User from '../models/userModel';

describe('Authentication Integration Tests', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test1234',
    passwordConfirm: 'test1234',
  };
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('POST /api/v1/users/signup', () => {
    it('Should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/signup')
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('test@example.com');

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.includes('accessToken'))).toBe(
        true,
      );
      expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(
        true,
      );
    });
    it('Should fail when passwordConfirm dose not match', async () => {
      const response = await request(app)
        .post('/api/v1/users/signup')
        .send({
          ...userData,
          passwordConfirm: 'pass1234',
        });
      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST, /api/v1/users/login', () => {
    beforeEach(async () => {
      await User.create(userData);
    });
    it('Should login successfully', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: userData.email,
        password: userData.password,
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((cookie) => cookie.includes('accessToken'))).toBe(
        true,
      );
      expect(cookies.some((cookie) => cookie.includes('refreshToken'))).toBe(
        true,
      );
    });
    it('Should fail to login with wrong password', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: userData.email,
        password: 'testwrong',
      });

      expect(response.statusCode).toBe(404);
      expect(response.body.status).not.toBe('success');
    });
  });

  describe('GET /api/v1/users/logout', () => {
    let activeCookies;
    beforeEach(async () => {
      await User.create(userData);
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: userData.email,
        password: userData.password,
      });
      activeCookies = loginRes.headers['set-cookie'];
    });
    it('Should clear cookies and remove refreshTokenHash from DB', async () => {
      const response = await request(app)
        .get('/api/v1/users/logout')
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');

      const clearCookies = response.headers['set-cookie'].join(';');
      expect(clearCookies).toContain('accessToken=;');
      expect(clearCookies).toContain('refreshToken=;');

      const user = await User.findOne({ email: 'test@example.com' }).select(
        '+refreshTokenHash',
      );
      expect(user.refreshTokenHash).toBeUndefined();
    });
  });

  describe('POST /api/v1/users/refresh', () => {
    let activeCookies;
    beforeEach(async () => {
      await User.create(userData);
      const loginRes = await request(app).post('/api/v1/users/login').send({
        email: userData.email,
        password: userData.password,
      });
      activeCookies = loginRes.headers['set-cookie'];
    });
    it('Should issue new cookies and rotate the refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/users/refresh')
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');

      const newCookies = response.headers['set-cookie'];
      expect(newCookies).toBeDefined();
      expect(newCookies.some((c) => c.includes('accessToken'))).toBe(true);
      expect(newCookies.some((c) => c.includes('refreshToken'))).toBe(true);
    });

    it('Should detect token reuse and revoke session (Reuse Detection)', async () => {
      await request(app)
        .post('/api/v1/users/refresh')
        .set('Cookie', activeCookies);
      const reuseRes = await request(app)
        .post('/api/v1/users/refresh')
        .set('Cookie', activeCookies);

      expect(reuseRes.statusCode).toBe(401);
      const user = await User.findOne({ email: userData.email }).select(
        '+refreshTokenHash',
      );
      expect(user.refreshTokenHash).toBeUndefined();
    });
  });

  describe('POST /api/v1/users/forgotPassword', () => {
    beforeEach(async () => {
      await User.create(userData);
      vi.clearAllMocks();
    });
    it('Should generate a token, save its hash to DB, and trigger email', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgotPassword')
        .send({ email: userData.email });
      expect(response.statusCode).toBe(200);

      const user = await User.findOne({ email: userData.email }).select(
        '+passwordResetToken +passwordResetExpires',
      );
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
    });
    it('Should return 200 even if the email does not exist (Anti-Enumeration)', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgotPassword')
        .send({ email: 'noexist@example.com' });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('PATCH /api/v1/users/resetPassword/:token', () => {
    let resetToken;
    beforeEach(async () => {
      await User.create(userData);
      resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      await User.findOneAndUpdate(
        { email: userData.email },
        {
          passwordResetToken: hashedToken,
          passwordResetExpires: Date.now() + 10 * 60 * 1000,
        },
      );
    });
    it('Should reset password with valid token, clear reset fields, and log user in', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/resetPassword/${resetToken}`)
        .send({
          password: 'newPassword',
          passwordConfirm: 'newPassword',
        });
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');

      const user = await User.findOne({ email: 'test@example.com' }).select(
        '+passwordResetToken +passwordResetExpires',
      );
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();

      const newCookies = response.headers['set-cookie'];
      expect(newCookies).toBeDefined();
      expect(newCookies.some((c) => c.includes('accessToken'))).toBe(true);
      expect(newCookies.some((c) => c.includes('refreshToken'))).toBe(true);

      const loginRes = await request(app)
        .post('/api/v1/users/login')
        .send({ email: userData.email, password: 'newPassword' });

      expect(loginRes.statusCode).toBe(200);
    });
    it('Should fail if the token is invalid', async() => {
      const response = await request(app)
        .patch('/api/v1/users/resetPassword/invalid_token_here')
        .send({
          password: 'newPassword123',
          passwordConfirm: 'newPassword123'
        });

      expect(response.statusCode).toBe(400);
    })
  });
});
