import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/userModel';

describe('Authentication Integration Tests', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test1234',
    passwordConfirm: 'test1234',
  };
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

  describe('Get /api/v1/users/logout', () => {
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
});
