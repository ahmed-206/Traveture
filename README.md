# Traveture

Full-stack tour discovery and booking platform — browse tours, manage bookings with real-time seat availability, save favourites, and check out with Stripe.

**[Live Demo](https://traveture.vercel.app)**

> **Try it instantly** — no signup required:
> | Role | Email | Password |
> |---|---|---|
> | Admin | `admin@traveture.io` | `test1234` |
> | User | `loulou@example.com` | `test1234` |

---

## Tech Stack

**Client** — React 19 · TypeScript · Vite · Tailwind CSS · TanStack Query · React Hook Form + Zod · React Leaflet

**Server** — Node.js · Express 5 · MongoDB / Mongoose · JWT (HTTP-only cookies) · Stripe · Nodemailer

**Testing** — Vitest · Supertest

---

## Features

-  Browse, filter, sort, and paginate tours with interactive maps and reviews
-  Cookie-based JWT auth with access/refresh tokens, password reset, and profile management
-  Save and manage favourite tours
-  Book tours with per-start-date capacity checks that prevent overbooking
-  Stripe Checkout with signed webhook confirmation
-  Role-based access control (`user`, `lead-guide`, `admin`)
-  Integration test suite covering auth, bookings, favourites, and permissions

## Project Structure

```text
Traveture/
├── client/          # React + TypeScript app
│   └── src/
│       ├── api/
│       ├── components/
│       ├── features/   # auth, tours, favourites, profile, bookings
│       └── routes/
└── server/          # Express REST API
    ├── controllers/
    ├── models/          # User, Tour, Booking, Review
    ├── services/
    ├── routes/
    └── tests/
```

## API Overview

| Resource | Endpoint | Access |
| --- | --- | --- |
| Auth & Users | `/api/v1/users` | Public / Authenticated |
| Tours | `/api/v1/tours` | Public read · Admin/lead-guide write |
| Bookings | `/api/v1/bookings` | Authenticated · Admin management |
| Favourites | `/api/v1/favorites` | Authenticated |
| Reviews | `/api/v1/reviews` | Authenticated |
| Stripe Webhook | `/api/v1/stripe/webhook` | Stripe-signed |

Booking states: `pending → confirmed → completed` (or `cancelled`) · Payment states: `pending → paid` (or `failed` / `refunded`)

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account + [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing

### Installation

```bash
git clone https://github.com/<your-username>/traveture.git
cd traveture

# Install client
cd client && npm install

# Install server
cd ../server && npm install
```

### Environment Variables

Create `server/.env`:

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

### Run Locally

```bash
# Terminal 1 — API (http://localhost:3000)
cd server && npm start

# Terminal 2 — Client (http://localhost:5173)
cd client && npm run dev
```

### Run Tests

```bash
cd server
npm run test:run
```

### Test Stripe Webhooks Locally

```bash
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```

---

## Roadmap

- [ ] Admin dashboard for managing tours, users, and bookings
- [ ] In-app notifications for booking and account activity
- [ ] Email notifications for confirmations and payments
- [ ] Full client-side checkout flow
- [ ] Enhanced booking history and analytics

---

