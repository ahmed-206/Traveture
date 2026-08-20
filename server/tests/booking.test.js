import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import Booking from '../models/bookingModel.js';

const createAdminAndGetCookies = async (credentials) => {
  const admin = await User.create({
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    passwordConfirm: credentials.passwordConfirm,
    role: 'admin',
  });

  const loginRes = await request(app).post('/api/v1/users/login').send({
    email: credentials.email,
    password: credentials.password,
  });

  return loginRes.headers['set-cookie'];
};
const userCredentials = {
  name: 'Regular User',
  email: 'user@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
};

const adminCredentials = {
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'test1234',
  passwordConfirm: 'test1234',
  role: 'admin',
};

const futureDate = new Date('2028-06-15');

const tourData = {
  name: 'The Forest Adventure Test',
  duration: 5,
  maxGroupSize: 10,
  difficulty: 'easy',
  price: 250,
  summary: 'A beautiful forest hike for testing',
  imageCover: 'tour-cover.jpg',
  startDates: [futureDate],
};

const signupAndGetCookies = async (credentials) => {
  const res = await request(app).post('/api/v1/users/signup').send(credentials);
  return res.headers['set-cookie'];
};

const createTour = async (overrides = {}) => {
  return Tour.create({ ...tourData, ...overrides });
};

const createBookingViaAPI = async (cookies, body) => {
  return request(app)
    .post('/api/v1/bookings')
    .set('Cookie', cookies)
    .send(body);
};

//  Start the Tests
describe('Booking Integration Tests', () => {
  let userCookies;
  let adminCookies;
  let tour;

  beforeEach(async () => {
    userCookies = await signupAndGetCookies(userCredentials);
    adminCookies = await createAdminAndGetCookies(adminCredentials);
    tour = await createTour();
  });

  describe('POST /api/v1/bookings  (Create Booking)', () => {
    
    it('should create a booking with valid data and return 201', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Booking created successfully');

      const booking = res.body.data;
      expect(booking.guests).toBe(2);
      expect(booking.price).toBe(tour.price * 2);
      expect(booking.status).toBe('pending');
      expect(booking.paymentStatus).toBe('pending');
    });

    it('should create a booking for a single guest (minimum)', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.guests).toBe(1);
      expect(res.body.data.price).toBe(tour.price);
    });

    it('should create a booking that fills the tour to max capacity', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 10,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.guests).toBe(10);
    });

    it('should return 401 when no auth cookies are provided', async () => {
      const res = await request(app).post('/api/v1/bookings').send({
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 when an admin tries to create a booking (user-only)', async () => {
      const res = await createBookingViaAPI(adminCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 when tourId does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await createBookingViaAPI(userCookies, {
        tourId: fakeId,
        guests: 1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 when guests is 0', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 0,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when guests is negative', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: -1,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when guests is a decimal (non-integer)', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2.5,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when startDate is not a valid tour start date', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: new Date('2029-01-01'),
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when guests exceed available spots', async () => {
      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 11,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when cumulative bookings exceed capacity', async () => {
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 8,
        startDate: futureDate,
      });

      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 3,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should allow booking remaining spots after a partial booking', async () => {
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 7,
        startDate: futureDate,
      });

      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 3,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(201);
    });

    it('should free capacity when a booking is cancelled', async () => {
      const firstRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 10,
        startDate: futureDate,
      });
      const bookingId = firstRes.body.data._id;

      await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      const res = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 5,
        startDate: futureDate,
      });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('GET /api/v1/bookings/my-bookings  (List My Bookings)', () => {
    it('should return an empty list when the user has no bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/my-bookings')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.results).toBe(0);
    });

    it('should return only bookings belonging to the logged-in user', async () => {
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      const otherCookies = await signupAndGetCookies({
        name: 'Other User',
        email: 'other@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });
      await createBookingViaAPI(otherCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      const res = await request(app)
        .get('/api/v1/bookings/my-bookings')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return 401 when no auth cookies are provided', async () => {
      const res = await request(app).get('/api/v1/bookings/my-bookings');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/bookings/my-bookings/:id  (Get My Booking)', () => {
    it('should return the booking when the user owns it', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 3,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(bookingId);
    });

    it('should return 404 when the booking belongs to another user', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const otherCookies = await signupAndGetCookies({
        name: 'Other User',
        email: 'other2@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      const res = await request(app)
        .get(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', otherCookies);

      expect(res.statusCode).toBe(404);
    });

    it('should return 404 when booking ID does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/bookings/my-bookings/${fakeId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/bookings/my-bookings/:id  (Cancel My Booking)', () => {
    it('should cancel a pending booking and return 200', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Booking cancelled successfully');
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should return 400 when trying to cancel an already cancelled booking', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when trying to cancel a completed booking', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      await Booking.findByIdAndUpdate(bookingId, { status: 'completed' });

      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 when user tries to cancel another user's booking", async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const otherCookies = await signupAndGetCookies({
        name: 'Other User',
        email: 'other3@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });

      const res = await request(app)
        .patch(`/api/v1/bookings/my-bookings/${bookingId}`)
        .set('Cookie', otherCookies);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/bookings  (Admin: Get All Bookings)', () => {
    it('should return all bookings for admin', async () => {
      await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });

      const otherCookies = await signupAndGetCookies({
        name: 'Other User',
        email: 'other4@test.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      });
      await createBookingViaAPI(otherCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });

      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBe(2);
    });

    it('should return 403 when a regular user tries to access all bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/bookings/:id  (Admin: Get Single Booking)', () => {
    it('should return a specific booking for admin', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 4,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.data._id).toBe(bookingId);
    });

    it('should return 404 for a non-existent booking ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/v1/bookings/${fakeId}`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(404);
    });

    it('should return 403 when a regular user accesses admin route', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/v1/bookings/:id  (Admin: Update Booking)', () => {
    let bookingId;

    beforeEach(async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 2,
        startDate: futureDate,
      });
      bookingId = createRes.body.data._id;
    });

    it('should update status to confirmed', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('should update paymentStatus to paid', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ paymentStatus: 'paid' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.paymentStatus).toBe('paid');
    });

    it('should update both status and paymentStatus at once', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'confirmed', paymentStatus: 'paid' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
      expect(res.body.data.paymentStatus).toBe('paid');
    });

    it('should return 400 for an invalid status enum value', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ status: 'invalid_status' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for an invalid paymentStatus enum value', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ paymentStatus: 'invalid_payment' });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when trying to update non-allowed fields (e.g. price)', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', adminCookies)
        .send({ price: 9999 });

      expect(res.statusCode).toBe(400);
    });

    it('should return 403 when a regular user tries to update a booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Cookie', userCookies)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PATCH /api/v1/bookings/:id/cancel  (Admin: Cancel Booking)', () => {
    it('should cancel any booking as admin', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 3,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Booking cancelled successfully');
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should return 400 when admin tries to cancel an already cancelled booking', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', adminCookies);

      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 for a non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/v1/bookings/${fakeId}/cancel`)
        .set('Cookie', adminCookies);

      expect(res.statusCode).toBe(404);
    });

    it('should return 403 when a regular user hits the admin cancel route', async () => {
      const createRes = await createBookingViaAPI(userCookies, {
        tourId: tour._id,
        guests: 1,
        startDate: futureDate,
      });
      const bookingId = createRes.body.data._id;

      const res = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Cookie', userCookies);

      expect(res.statusCode).toBe(403);
    });
  });
});
