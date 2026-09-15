# E-Commerce Backend API

An Express 5 and TypeScript REST API backed by PostgreSQL and Prisma 8 (Prisma Next). The backend provides product and category management, user profiles, cookie-based JWT authentication, orders, and Stripe payment intents.

## Stack

- **Runtime:** Node.js with ESM and TypeScript 5.9
- **HTTP:** Express 5, cookie-parser, and CORS
- **Database:** PostgreSQL with `@prisma/orm-postgres` 8.0.0-rc.9 and Prisma CLI 8.0.0-rc.10
- **Validation:** Zod
- **Authentication:** bcryptjs and jsonwebtoken
- **Images:** Multer and Cloudinary
- **Payments:** Stripe
- **Tests:** Node.js test runner
- **Package manager:** pnpm 10.28.2

## Implemented features

- Product CRUD, pagination, category filtering, and image uploads/replacement.
- Category CRUD with admin-only writes.
- User profiles, profile images, password changes, and admin account deletion protection.
- Registration, login, logout, and an email-verification endpoint.
- Order creation with totals calculated from stored product prices, transactional order/item writes, order history, and owner/admin checks for order retrieval and deletion.
- Order-item CRUD with product and order relation checks.
- Stripe payment-intent creation and an endpoint that marks an order paid and changes its status to `processing`.

## Architecture

The modules follow the Category reference implementation:

```text
Route -> Controller -> Service -> Repository contract -> Prisma repository -> Database
```

| Layer | Responsibility |
| --- | --- |
| Routes | Endpoint paths, authorization middleware, uploads, and controller handlers |
| Controllers | Request parsing, existing Zod validation, HTTP status codes, responses, and service calls |
| Services | Business rules, repository calls, password hashing, JWT generation, and external API calls |
| Repository contracts | Typed persistence operations required by services |
| Prisma repositories | Database queries, mutations, and transactions |
| Module wiring | Construct repositories, services, and controller instances |

Controllers use class-based arrow-function handlers. Services have no Express or direct database dependencies. Cloudinary calls stay in the Product and User services; Stripe calls stay in PaymentService. Payment state is stored on the existing Order model.

Services throw `AppError` for business failures. The global error handler preserves each endpoint's existing error body, which may use `message`, `error`, or a JSON string.

Local imports in TypeScript source use **`.js` extensions** so the compiled application runs as ESM on Node.js and Render. Reusable input types live under `types/`; update types exclude Prisma relation callbacks to avoid incompatible create/update types and `never` errors.

See [docs/architecture.md](docs/architecture.md) for more detail.

## Project Structure

The project follows a modular architecture where each feature owns its
controllers, routes, services, repositories, validation schemas, entities,
and types.

```text
.
├── Modules/
│   ├── Category/
│   │   ├── controller/
│   │   ├── routes/
│   │   ├── service/
│   │   ├── repo/
│   │   ├── entities/
│   │   ├── types/
│   │   ├── validations/
│   │   └── category.module.ts
│   │
│   ├── Products/
│   │   ├── controller/
│   │   │   └── product.controller.ts
│   │   ├── routes/
│   │   │   └── product.routes.ts
│   │   ├── service/
│   │   │   └── product.service.ts
│   │   ├── repo/
│   │   │   ├── product.repository.ts
│   │   │   └── product.repository.types.ts
│   │   ├── entities/
│   │   │   └── product.entity.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   ├── validations/
│   │   │   └── product.validation.ts
│   │   └── product.module.ts
│   │
│   ├── User/
│   │   ├── Auth/
│   │   ├── controller/
│   │   ├── routes/
│   │   ├── service/
│   │   ├── repo/
│   │   ├── entities/
│   │   ├── types/
│   │   ├── validations/
│   │   └── user.module.ts
│   │
│   ├── Order/
│   ├── OrderItems/
│   └── Payment/
│
├── config/
│   └── env.ts
│
├── middlewares/
│   ├── auth/
│   ├── upload/
│   ├── validation/
│   └── error/
│
├── utils/
│   ├── cloudinary/
│   ├── image/
│   └── errors/
│
├── src/
│   └── prisma/
│       ├── contract.prisma
│       ├── contract.json
│       ├── contract.d.ts
│       ├── db.ts
│       └── seed.ts
│
├── migrations/
├── tests/
│   └── architecture.test.mjs
│
├── docs/
│   └── architecture.md
│
├── index.ts
├── prisma.config.ts
├── package.json
└── tsconfig.json

```
For example, Products contains:

```text
Modules/Products/
  Controller/Product.ts
  Routes/Products.ts
  service/product.ts
  repo/product-type-repo.ts
  repo/product.ts
  entities/product.ts
  types/product.ts
  Validations/Product.ts
  product.module.ts
```

## Local setup

### 1. Prerequisites and dependencies

Use Node.js **22.18.0 or newer** (required by the installed Prisma CLI), pnpm **10.28.2**, and PostgreSQL **15 or newer**. Configure Cloudinary and Stripe credentials for their respective integrations.

From the repository root:

```sh
pnpm install --frozen-lockfile
```

### 2. Configure the environment

Create `.env` in the repository root using the template below. The existing `.env.example` contains only the database URL; the application also requires the other values validated in [config/env.ts](config/env.ts).

```dotenv
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET_KEY=replace-with-a-random-secret-at-least-32-characters-long

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

STRIPE_SECRET_KEY=your-stripe-secret-key
BASE_FRONT_URL=http://localhost:5173
EMAIL_USER=your-email-account
EMAIL_PASS=your-email-password
```

`NODE_ENV` defaults to `development` and `PORT` defaults to `5000`. All other variables shown above are required. `JWT_SECRET_KEY` must contain at least 32 characters, and `BASE_FRONT_URL` must be a valid URL. Email settings are required by the configuration even though the current registration flow does not send email.

### 3. Prepare PostgreSQL

This project uses Prisma 8's contract workflow. Its schema source is [src/prisma/contract.prisma](src/prisma/contract.prisma), and generated artifacts are checked in.

For a **new, empty development database**, create the database, set `DATABASE_URL`, then initialize it from the contract:

```sh
pnpm contract:emit
pnpm exec prisma db init
pnpm exec prisma db verify
```

For an existing database, use the project's migration history and verify the schema rather than initializing it as an empty database. Re-emit the contract after schema changes; generated `contract.json` and `contract.d.ts` files should not be edited manually.

### 4. Start development

```sh
pnpm dev
```

The server connects to PostgreSQL before listening. With the default port, the API is available at `http://localhost:5000`. `GET /` returns `hello world`.

## API endpoints

### Authentication and users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/users/auth/register` | Register a user |
| POST | `/api/users/auth/login` | Log in and set the token cookie |
| GET | `/api/users/auth/logout` | Clear the token cookie |
| GET | `/api/users/auth/verify/:token` | Verify an email token |
| GET | `/api/users` | List users; admin only |
| PUT | `/api/users` | Update the logged-in user's name |
| GET | `/api/users/me` | Read the logged-in user's profile |
| GET | `/api/users/:id` | Read a user through the shared ID authorization guard |
| DELETE | `/api/users/:id` | Delete a user through the shared ID authorization guard |
| PUT | `/api/users/password/change-password` | Change the logged-in user's password |
| POST | `/api/users/photo-upload` | Upload a profile image |

### Products and categories

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/products` | List products; accepts `page` and `limit` |
| POST | `/api/products` | Create a product; admin only |
| GET | `/api/products/count` | Get product/page counts; accepts `limit` |
| GET | `/api/products/categories/:categoryId` | Filter products by category; accepts `page` and `limit` |
| GET | `/api/products/:id` | Read a product |
| PUT | `/api/products/:id` | Update a product; admin only |
| DELETE | `/api/products/:id` | Delete a product; admin only |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create a category; admin only |
| GET | `/api/categories/:id` | Read a category |
| PUT | `/api/categories/:id` | Update a category; admin only |
| DELETE | `/api/categories/:id` | Delete a category; admin only |

Product pagination defaults to page `1` and limit `8`. Product and profile image uploads use `multipart/form-data` with a single file field named `image`.

### Orders and payments

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/orders` | List orders; admin only |
| POST | `/api/orders` | Create an order for the logged-in user |
| GET | `/api/orders/last-order` | Read the logged-in user's latest order |
| GET | `/api/orders/user-orders` | List the logged-in user's orders |
| GET | `/api/orders/:id` | Read an order; owner or admin |
| DELETE | `/api/orders/:id` | Delete an order; owner or admin |
| GET | `/api/order-items` | List order items; admin only |
| POST | `/api/order-items` | Create an order item; login required |
| GET | `/api/order-items/:id` | Read an order item through the shared ID authorization guard |
| PUT | `/api/order-items/:id` | Update an order item through the shared ID authorization guard |
| DELETE | `/api/order-items/:id` | Delete an order item through the shared ID authorization guard |
| POST | `/api/payment/create-payment-intent` | Create a Stripe intent from an order's total; login required |
| POST | `/api/payment/confirm` | Mark an order paid; login required |

Both payment endpoints accept `{ "orderId": 1 }`. Payment-intent creation returns `{ "clientSecret": "..." }` and uses USD with the order total converted to cents.

## Authentication and frontend integration

Authentication middleware reads the JWT from the **`token` cookie**. Login creates a token valid for five days and a matching HTTP-only cookie. In production, the cookie uses `secure: true` and `sameSite: "none"`; otherwise it uses `secure: false` and `sameSite: "lax"`.

Browser requests to authenticated endpoints must include credentials, for example `fetch(url, { credentials: "include" })`. The current CORS allowlist in [index.ts](index.ts) contains:

- `http://localhost:5173`
- `https://front-e-commarce.vercel.app`

Setting `BASE_FRONT_URL` does not change that allowlist.

The shared `verifyTokenAndAuthorization` middleware permits admins or a strict match between the token's user ID and the route's `:id`. It does not look up order-item ownership. Order endpoints perform their own owner/admin checks in OrderService.

## Current behavior and limitations

- Registration currently creates users with `emailVerified: true`. Verification tokens are stored, but registration and the resend branch do not send email.
- Password-reset routes are commented out. Refresh-token handling and OAuth login are not implemented.
- Payment confirmation directly updates the order. It does not verify a Stripe payment result, and there is no Stripe webhook endpoint.
- Category-filtered product responses report the count and page count across all products.
- Standalone order-item changes do not recalculate order totals.
- The seed script is currently commented out, so `pnpm seed` does not populate the database.

## Build, test, and deploy

### Production build

```sh
pnpm build
pnpm start
```

`pnpm build` first runs `pnpm install --frozen-lockfile --prod=false`, then compiles TypeScript into `dist/`. `pnpm start` runs `node dist/index.js`.

### Regression tests

```sh
pnpm build
node --test tests/architecture.test.mjs
```

Tests cover service behavior, error response shapes, image replacement, authentication, order totals and access rules, transaction failure propagation, payment state, route paths, middleware order, and dependency wiring. They use compiled ESM with test doubles and do not contact PostgreSQL, Cloudinary, or Stripe. Live integration testing requires a separate configured environment.

### Render

Configure a Node web service with:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build` |
| Start command | `pnpm start` |
| Runtime | Node.js 22.18.0 or newer |
| Environment | `NODE_ENV=production` plus the required variables above |

The server reads Render's `PORT` environment variable. Apply reviewed database migrations separately; building and starting the service do not apply migrations. Keep the generated Prisma contract artifacts in the deployment and preserve `.js` extensions in local imports.
