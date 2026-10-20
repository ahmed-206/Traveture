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
