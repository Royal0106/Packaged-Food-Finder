# FoodLens

FoodLens is a packaged-food product search application. Users search by product title or keyword, browse normalized results from Open Food Facts, and unlock detailed nutrition with a Stripe test-mode subscription.

The assignment uses one predefined demo user. There is no signup or login flow.

## Project Overview

Users can search for products such as Coca Cola, Nutella, Oreo, chocolate, or milk. The Next.js frontend talks only to the Express API. The API searches Open Food Facts, stores recent searches in MySQL, and returns nutrition only after the database shows an active subscription.

## Architecture

```text
Next.js frontend  →  Express API  →  Open Food Facts
                                 →  MySQL (Prisma)
                                 →  Stripe Checkout / Webhooks
```

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma, MySQL
- **Integrations:** Open Food Facts, Stripe Checkout, Stripe Subscriptions, Stripe Webhooks

The frontend never calls Open Food Facts or Stripe with secret keys. Premium access is decided by the backend from the demo user's stored subscription status, not from the Stripe success page.

## Setup

### Requirements

- Node.js 20+
- MySQL 8+
- A Stripe account with test-mode keys
- Stripe CLI for local webhook forwarding

### Installation

```bash
git clone <repository-url>
cd home_assessment_test

cd backend
copy .env.example .env
npm install

cd ../frontend
copy .env.example .env.local
npm install
```

On macOS or Linux, use `cp` instead of `copy`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma MySQL connection string |
| `PORT` | Express port. Defaults to `4000` |
| `FRONTEND_URL` | Allowed CORS origin and Stripe redirect base, e.g. `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe **test** secret key. Backend only |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret from Stripe CLI or the Dashboard |
| `STRIPE_PRICE_ID` | Monthly subscription Price ID |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Public Express base URL, e.g. `http://localhost:4000` |

Do not put Stripe secret keys in frontend environment variables.

## Database Setup

Create an empty MySQL database first:

```sql
CREATE DATABASE food_search CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then, from `backend/`:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`prisma migrate dev` applies the initial migration in `backend/prisma/migrations`. The seed script upserts the demo user:

- id: `1`
- email: `demo@example.com`
- name: `Demo User`
- subscription status: `inactive`

The API also upserts this user on startup.

## Stripe Setup

1. In the Stripe Dashboard (test mode), create a product with a **monthly** recurring price.
2. Copy the Price ID (`price_...`) into `STRIPE_PRICE_ID`.
3. Copy the test secret key (`sk_test_...`) into `STRIPE_SECRET_KEY`.
4. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and log in.
5. Forward webhook events to the local API:

```bash
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

6. Copy the CLI signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

Use a Stripe test card such as `4242 4242 4242 4242` on Checkout.

The webhook endpoint reads the **raw request body** and verifies the Stripe signature before any event is applied. Visiting `/subscription/success` does not activate premium access.

## Running the Application

Start MySQL, then run both apps:

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend health: [http://localhost:4000/api/health](http://localhost:4000/api/health)

Keep `stripe listen` running while testing checkout.

## Testing

From `backend/`:

```bash
npm test
npm run typecheck
npm run lint
```

From `frontend/`:

```bash
npm run typecheck
npm run lint
```

Backend tests mock Open Food Facts, Prisma, and Stripe. They do not make live network calls.

Covered cases include:

1. Open Food Facts normalization with missing fields
2. Search validation rejecting an empty query
3. Nutrition access denied for an inactive subscription
4. Nutrition returned only for an active subscription
5. Stripe webhook signature verification and status updates
6. Search history create and dedupe behavior

## Internationalization Approach

- UI copy lives in `frontend/src/messages/{en,nl,de,fr}.json`
- The header has a manual selector: English, Nederlands, Deutsch, Français
- The selected language is stored in `localStorage` and a cookie so it survives refresh
- Browser language is not used as the source of truth
- Product search sends `lang` to the backend
- The backend prefers localized Open Food Facts fields (`product_name_nl`, `ingredients_text_fr`, and similar)
- Fallback order: selected language → generic field → English → `"Unknown product"`
- There is no machine translation

## Technical Decisions

- **Open Food Facts stays on the backend** so the frontend cannot be pointed at a different catalog, request timeouts are centralized, and responses can be normalized before they reach the browser.
- **Nutrition authorization is server-side.** Search and product detail payloads never include nutrition. `GET /api/products/:code/nutrition` checks the demo user's database status first and returns `nutrition: null` when access is inactive.
- **Webhooks are the source of truth.** Checkout success is only a confirmation screen. It reads `/api/subscription/status` and can show a pending state until Stripe events land.
- **Product responses are normalized.** Missing images, brands, categories, ingredients, and nutrients become `null` instead of leaking the raw Open Food Facts document.
- **Authentication is a single demo user** because the assignment asks for that simplification.

## Database Schema

### User

- `id`, `email`, `name`
- `stripeCustomerId`, `stripeSubscriptionId`
- `subscriptionStatus`: `inactive` | `active` | `canceled` | `past_due`
- `subscriptionCurrentPeriodEnd`
- `createdAt`, `updatedAt`

### SearchHistory

- `id`, `userId`, `query`, `language`, `createdAt`
- A user has many search history rows
- The API keeps the latest 12 searches and refreshes an existing query/language pair instead of inserting duplicates

## API Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/products/search?q=&lang=` | Search + record history |
| `GET` | `/api/products/:code` | Public product details, no nutrition |
| `GET` | `/api/products/:code/nutrition` | Premium nutrition or `{ hasAccess: false, nutrition: null }` |
| `GET` | `/api/search-history` | Recent searches, newest first |
| `POST` | `/api/stripe/create-checkout-session` | Monthly Checkout session |
| `POST` | `/api/stripe/webhook` | Raw-body Stripe events |
| `GET` | `/api/subscription/status` | Database-backed access flag |

Success responses:

```json
{ "success": true, "data": {} }
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_SEARCH_FAILED",
    "message": "Unable to search products."
  }
}
```

## Stripe Flow

1. The user clicks **Subscribe Monthly** or **Unlock Nutrition**.
2. The API creates a Stripe Checkout Session in `subscription` mode for the demo user.
3. Stripe redirects to `/subscription/success` or `/subscription/cancel`.
4. Webhooks (`checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`) update the demo user in MySQL.
5. The frontend asks `/api/subscription/status` and `/api/products/:code/nutrition` for access. It never unlocks nutrition from the success URL alone.

## Known Limitations

- Open Food Facts data quality varies; many products have missing images, ingredients, or nutrients.
- Localized product names, categories, and ingredients are not always present.
- There is no full authentication system because the assignment specifies one demo user.
- A Stripe customer portal for self-serve cancellation is not included.
- Search results depend on Open Food Facts availability and response times.
- Subscription management after checkout happens in the Stripe Dashboard / test CLI, not in-app.

## Project Scripts

### Backend

```bash
npm run dev
npm run build
npm start
npm test
npm run typecheck
npm run lint
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```
