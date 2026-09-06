# Traveture

Traveture is a full-stack tour discovery and booking platform. It combines a React client with an Express and MongoDB API for browsing tours, managing accounts, saving favourites, submitting reviews, and creating tour bookings.

**[Live Demo](https://traveture.vercel.app/))** 

> Demo credentials — try any role instantly:
> - **Admin:** admin@traveture.io / test1234
> - **User:** loulou@example.com / test1234
## Highlights

- Browse, filter, sort, paginate, and view detailed tour information
- Interactive tour maps, destinations, tour imagery, and reviews
- Cookie-based JWT authentication with access and refresh tokens
- Sign up, log in, log out, password reset, and profile management
- Profile photo upload and image resizing
- Protected user areas for profiles, favourites, and booking
- Save and remove favourite tours
- Create, view, and cancel bookings
- Per-start-date seat availability checks to prevent overbooking
- Role-based administration for users, tours, bookings, and reviews
- Stripe Checkout service and verified Stripe webhook handling
- Integration tests for authentication, bookings, favourites, permissions, and validation

## Tech Stack

| Area | Technology |
| --- | --- |
| Client | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Data fetching | TanStack Query, Axios |
| Forms | React Hook Form, Zod |
| Maps | React Leaflet, Leaflet |
| Server | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT, HTTP-only cookies, bcryptjs |
| Payments | Stripe |
| Email | Nodemailer |
| Testing | Vitest, Supertest |

## Project Structure

```text
Traveture/
├── client/                 # React and TypeScript application
│   └── src/
│       ├── api/
│       ├── components/
│       ├── features/       # auth, tours, favourites, profile, bookings
│       ├── layouts/
│       └── routes/
│
└── server/                 # Express REST API
    ├── controllers/
    ├── middleware/
    ├── models/             # User, Tour, Booking, Review
    ├── routes/
    ├── services/
    ├── tests/
    └── utils/
```

## Features

### Accounts and access

Users can register, log in, log out, refresh their session, update their profile and password, and request a password reset. Authentication uses JWTs stored in cookies. Protected endpoints enforce user roles:

- `user`: bookings, favourites, and reviews
- `lead-guide`: tour management
- `admin`: user, tour, booking, and review management

### Tours, favourites, and reviews

The application displays tour information including schedules, locations, guides, ratings, and reviews. Users can save tours to favourites and create, update, or delete reviews. Tour ratings are recalculated whenever reviews change.

### Booking availability

When creating a booking, the API validates that the tour exists, the chosen start date belongs to that tour, and the requested guest count is positive. It calculates seats already held for the same tour and start date, then rejects bookings that would exceed the tour's maximum group size.

Bookings have the following states:

```text
Booking: pending | confirmed | cancelled | completed
Payment: pending | paid | failed | refunded
```

### Payments

The server includes a Stripe Checkout session service and a signed webhook endpoint. On `checkout.session.completed`, the webhook finds the booking through Stripe's `client_reference_id` and marks it as confirmed and paid.

```text
POST /api/v1/stripe/webhook
```

## API Overview

| Resource | Base endpoint | Notes |
| --- | --- | --- |
| Authentication and users | `/api/v1/users` | Signup, login, session refresh, profile, password recovery, admin user management |
| Tours | `/api/v1/tours` | Public listing and detail pages; write operations for admins and lead guides |
| Bookings | `/api/v1/bookings` | Authenticated user bookings and admin booking management |
| Favourites | `/api/v1/favorites` | Authenticated user's saved tours |
| Reviews | `/api/v1/reviews` | Authenticated review management |
| Stripe webhook | `/api/v1/stripe/webhook` | Stripe-signed webhook receiver |

### Main booking endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/bookings` | User | Create a booking |
| `GET` | `/api/v1/bookings/my-bookings` | Authenticated | Get the current user's bookings |
| `GET` | `/api/v1/bookings/my-bookings/:id` | Authenticated | Get one of the current user's bookings |
| `PATCH` | `/api/v1/bookings/my-bookings/:id` | Authenticated | Cancel an eligible booking |
| `GET` | `/api/v1/bookings` | Admin | Get all bookings |
| `PATCH` | `/api/v1/bookings/:id` | Admin | Update booking or payment status |

## Getting Started

### Prerequisites

- Node.js 20 or later
- MongoDB database or MongoDB Atlas cluster
- Stripe account and Stripe CLI (needed to test webhooks locally)

### 1. Install dependencies

Install the client and server dependencies separately:

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure the server

Create `server/.env` and provide the values required by the API:

```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

DATABASE=mongodb+srv://<username>:<PASSWORD>@<cluster>/<database>
DATABASE_PASSWORD=your_database_password
DATABASE_TEST=mongodb+srv://<username>:<PASSWORD>@<cluster>/<test_database>

JWT_ACCESS_SECRET=your_access_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_USERNAME=your_smtp_username
EMAIL_PASSWORD=your_smtp_password
```



### 3. Run the application

In one terminal, start the API:

```bash
cd server
npm start
```

In another terminal, start the client:

```bash
cd client
npm run dev
```

The client runs on `http://localhost:5173` by default. The server allows that origin with credentials.

## Testing

Run the server integration suite:

```bash
cd server
npm run test:run
```

The suite covers authentication, booking creation and cancellation, capacity validation, authorization, administrative booking changes, and favourites.

## Local Stripe Webhooks

Forward Stripe events to the local API while the server is running:

```bash
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```



## Under Development

Traveture is actively being developed. Some features are still being refined, and the following improvements are planned:

- An admin dashboard for managing tours, users, bookings, and platform activity from the client application
- An in-app notification system for booking updates, account activity, and important alerts
- Email notifications for booking confirmations, password recovery, and payment updates
- A complete client-side checkout and payment experience
- Enhanced booking history and account management
- Additional search, filtering, and tour discovery features
- More administrative reporting and analytics


