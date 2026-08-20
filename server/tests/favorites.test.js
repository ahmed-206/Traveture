import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import User from '../models/userModel';
import Tour from '../models/tourModel';

describe('Favorites Integration Tests', () => {
  const userData = {
    name: 'Favorite Test User',
    email: 'favtest@example.com',
    password: 'test1234',
    passwordConfirm: 'test1234',
  };

  const tourData = {
    name: 'Test Tour for Favorites',
    duration: 5,
    maxGroupSize: 10,
    difficulty: 'easy',
    price: 499,
    summary: 'A beautiful test tour for verifying the favorites feature.',
    imageCover: 'tour-1-cover.jpg',
  };

  let activeCookies;
  let testTourId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Tour.deleteMany({});

    
    await User.create(userData);

    
    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: userData.email,
      password: userData.password,
    });
    activeCookies = loginRes.headers['set-cookie'];

    // Create Tour
    const tour = await Tour.create(tourData);
    testTourId = tour._id.toString();
  });

  describe('POST /api/v1/favorites/:tourId', () => {
    it('should add a tour to favorites successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/favorites/${testTourId}`)
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tourId).toBe(testTourId);
      expect(response.body.data.isFavorite).toBe(true);

      // Verify in DB
      const user = await User.findOne({ email: userData.email });
      expect(user.favorites.map(id => id.toString())).toContain(testTourId);
    });

    it('should fail if tourId is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/favorites/invalid-id')
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('fail');
    });

    it('should fail if tour does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post(`/api/v1/favorites/${nonExistentId}`)
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /api/v1/favorites', () => {
    beforeEach(async () => {
      // Pre-add the favorite
      await request(app)
        .post(`/api/v1/favorites/${testTourId}`)
        .set('Cookie', activeCookies);
    });

    it('should return user favorites successfully', async () => {
      const response = await request(app)
        .get('/api/v1/favorites')
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]._id).toBe(testTourId);
      expect(response.body.data[0].name).toBe(tourData.name);
    });
  });

  describe('DELETE /api/v1/favorites/:tourId', () => {
    beforeEach(async () => {
   
      await request(app)
        .post(`/api/v1/favorites/${testTourId}`)
        .set('Cookie', activeCookies);
    });

    it('should remove a tour from favorites successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/favorites/${testTourId}`)
        .set('Cookie', activeCookies);

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tourId).toBe(testTourId);
      expect(response.body.data.isFavorite).toBe(false);

     
      const user = await User.findOne({ email: userData.email });
      expect(user.favorites.map(id => id.toString())).not.toContain(testTourId);
    });
  });
});
