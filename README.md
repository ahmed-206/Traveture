# Traveture

A full-stack tour discovery and booking platform built with React, TypeScript, Node.js, Express, and MongoDB. Users can explore tours, manage their accounts, save favourites, submit reviews, and make bookings.

**[Live Demo](https://traveture.vercel.app)**

### Demo Accounts

Try the application without creating an account:

| Role  | Email                | Password   |
| ----- | -------------------- | ---------- |
| Admin | `admin@traveture.io` | `test1234` |
| User  | `loulou@example.com` | `test1234` |

*These are demo credentials intended for application evaluation.*

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, React Leaflet

**Backend:** Node.js, Express 5, MongoDB, Mongoose, REST APIs

**Authentication & Payments:** JWT, HTTP-only Cookies, Refresh Token Rotation, Stripe Checkout, Stripe Webhooks

**Testing:** Vitest, Supertest

**Other Integrations:** Nodemailer

## Key Features

* **Tour Discovery:** Browse, filter, sort, and paginate tours, with interactive maps, ratings, and reviews.
* **Authentication:** Implemented signup, login, logout, access and refresh tokens, password reset, and profile management.
* **Access Control:** Enforced role-based permissions for users, lead guides, and administrators.
* **Favourites:** Allow authenticated users to save and manage their favourite tours.
* **Booking Management:** Validate tour availability for specific start dates and enforce booking capacity rules.
* **Payment Integration:** Integrated Stripe Checkout and webhook handling for payment event processing.
* **Reviews:** Support tour reviews through dedicated API endpoints.

## Architecture & Implementation

* **MVC-Based Backend:** Organized backend responsibilities across models, controllers, and routes, with a separate service layer for business logic.
* **Server-Side Filtering & Pagination:** Implemented tour filtering, sorting, and pagination on the backend to retrieve the requested results from the database.
* **Authentication & Session Management:** Implemented cookie-based JWT authentication using access and refresh tokens, with refresh token rotation and protected routes.
* **Database Integration:** Used MongoDB and Mongoose to model application data and manage relationships between users, tours, bookings, and reviews.
* **Booking Validation:** Implemented date-specific availability checks to enforce tour capacity rules during booking operations.
* **Payment Event Handling:** Integrated Stripe webhooks to process payment events and update the application's payment workflow.

## Booking & Payment Architecture

The booking and payment system is designed to maintain data consistency, prevent duplicate operations, and handle concurrent requests and payment failures safely.

### Core Design Principles

The system follows four core principles:

1. **Database as the source of truth:** The Stripe `success_url` is not proof of payment. A booking is confirmed only after the Stripe webhook verifies the payment.
2. **Atomic state transitions:** State changes use conditional updates (compare-and-set), ensuring a transition occurs only when the current state matches the expected state.
3. **External operations outside database transactions:** Stripe API calls and refund execution happen outside MongoDB transactions. Their intent is persisted within a transaction before execution.
4. **Idempotency at every boundary:** Duplicate requests are handled safely across booking creation, Checkout Session creation, webhook processing, and refund execution.

### Booking & Payment Flow

1. A booking is created with a `pending` status, and the requested seats are reserved within the same MongoDB transaction.
2. A Stripe Checkout Session is created using an idempotency key tied to the booking and checkout attempt.
3. After the customer completes payment, Stripe sends a webhook event to the backend.
4. The webhook handler validates the payment status, amount, and currency before transitioning the booking from `pending` to `confirmed`.
5. The webhook event record and booking state changes are committed atomically to prevent duplicate processing.

### Cancellation & Refund Flow

1. The system attempts to expire the Stripe Checkout Session before cancelling a pending booking.
2. A MongoDB transaction updates the booking status, releases the reserved seats, and persists a `RefundRequest` when a refund is required.
3. After the transaction commits, the refund is submitted to Stripe.
4. Failed or retryable refund operations remain recorded and can be retried by a background maintenance job.

This approach keeps database transactions short and avoids executing external API calls inside transactions.

### Handling Race Conditions

#### 1. Concurrent Requests for the Last Available Seat

**Problem:** Two users may attempt to reserve the last available seat simultaneously. Both requests could initially observe sufficient capacity.

**Solution:** The system maintains a shared availability document for each `(tour, startDate)` pair. Seat reservation uses a conditional atomic update:

```js
findOneAndUpdate(
  { bookedGuests: { $lte: maxGroupSize - guests } },
  { $inc: { bookedGuests: guests } }
);
```

The condition and increment execute as a single database operation. Concurrent requests contend for the same availability document, preventing the total reserved capacity from exceeding the limit.

If a transaction encounters a write conflict, MongoDB may retry it. The retried operation evaluates the updated capacity and rejects the reservation if insufficient seats remain.

#### 2. Duplicate Booking Requests

**Problem:** A user may submit the booking request multiple times, including when two requests arrive concurrently.

**Solution:**

* An existing matching pending booking is reused when possible.
* A partial unique index on `{ user, tour, startDate }` prevents multiple pending bookings for the same user, tour, and date.
* If concurrent requests conflict, the losing transaction rolls back, including its seat reservation, and the existing booking is retrieved.
* If the requests specify different guest counts, the API returns `409 Conflict` rather than silently reusing a booking with different parameters.

#### 3. Duplicate Webhook Events

**Problem:** Stripe may deliver the same webhook event more than once, including concurrently.

**Solution:** The event ID is persisted in a `ProcessedWebhookEvent` collection within the same transaction as the associated database changes. A unique index on the event ID prevents duplicate records.

Concurrent duplicate deliveries are handled through transaction retries and duplicate-event detection, preventing the same event from applying its database changes more than once.

#### 4. Payment During Booking Cancellation

**Problem:** A customer may complete payment while a cancellation request is being processed.

**Solution:** For pending bookings, the system attempts to expire the Checkout Session before cancelling the booking in the database.

If the session is already complete, cancellation is rejected with `409 Conflict` so the system can reconcile the payment rather than incorrectly releasing the seats.

If cancellation succeeds but a payment is subsequently confirmed, the webhook handler detects the cancelled booking and queues a refund instead of confirming it.

#### 5. Delayed or Out-of-Order Webhook Events

**Problem:** An event from an older Checkout Session may arrive after a newer session has been created or the booking state has changed.

**Solution:**

* Booking transitions use conditional state checks.
* Session expiration events are matched against the relevant session ID before cancelling a booking.
* Payment confirmation is allowed only when the booking and payment state satisfy the expected conditions.
* Payments received for cancelled bookings are handled through the refund workflow.

These safeguards prevent stale events from incorrectly changing the current booking state.



## Testing

Implemented automated tests using Vitest and Supertest to verify backend behavior and API responses.

* **Authentication:** Tested signup, login, and logout flows, including relevant invalid-input and authentication failure scenarios.
* **Authorization:** Tested access restrictions for protected endpoints and role-based permissions.
* **Bookings:** Tested booking-related API behavior and validation rules.
* **Favourites:** Tested favourite management endpoints and their access requirements.

*The test coverage described above should reflect the test cases implemented in the repository.*

## Getting Started

### Prerequisites

* Node.js 20+
* MongoDB local instance or MongoDB Atlas account
* Stripe account and Stripe CLI for local webhook testing

### Installation

Clone the repository:

```bash
git clone 
cd traveture
```

Install the client dependencies:

```bash
cd client
npm install
```

Install the server dependencies:

```bash
cd ../server
npm install
```

### Environment Variables

Create a `server/.env` file and configure the environment variables required by the application:

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

Use the exact environment variable names expected by the application. Never commit real credentials or secrets to version control.

### Run Locally

Start the backend:

```bash
cd server
npm start
```

Start the frontend in a separate terminal:

```bash
cd client
npm run dev
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

## Roadmap

* [ ] In-app notifications for booking and account activity
* [ ] Email notifications for booking confirmations and payments
* [ ] Complete client-side checkout experience
* [ ] Enhanced booking history and analytics
