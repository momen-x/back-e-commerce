# Backend architecture

Products, User, User/Auth, Order, Order_Items, and Payment follow:

```text
Routes → Controller → Service → Repository contract → Prisma repository → PostgreSQL
```

Each module's `*.module.ts` constructs its repository, service, and controller.
Routes use the controller instance's arrow-function handlers and keep their
existing authorization and upload middleware. Controllers parse HTTP input,
reuse the existing Zod schemas, and write responses. Services receive repository
contracts and contain the business rules. Only Prisma repository implementations
execute database operations.

`types/` contains reusable persistence and service inputs. Prisma create-input
types use `Parameters<...create>[0]`. Update inputs omit relation callbacks before
making scalar fields optional, because Prisma's create and update relation
callbacks differ. Entity types reflect actual query results, including Prisma's
Temporal timestamps. All local TypeScript imports use `.js` for compiled ESM.

Cloudinary operations remain in the Product and User services. Password hashing
and JWT generation remain in services; cookies and token-verification middleware
remain in the HTTP layer. PaymentService calls an injected Stripe client, while
PaymentRepository reads and updates payment state on the existing Order model.
OrderService calculates totals from stored product prices; PrismaOrderRepository
writes the order and its items using one `db.transaction` callback.

Services throw `AppError`. The existing global error handler maps these errors
to the original status and JSON shape (`message`, `error`, or a JSON string).
Unexpected errors retain the previous global-handler behavior.

This refactor preserves the implemented behavior: registration still sets
`emailVerified: true`, the resend branch does not send email, password-reset
routes remain commented out, and there is no refresh-token or webhook flow.
Category-filtered product listings still report the global product count.

## Verification

```sh
pnpm build
node --test tests/architecture.test.mjs
```

Tests use compiled ESM and test doubles for persistence and external APIs. They
cover business rules, response bodies, route paths, middleware order, controller
wiring, uploads, authentication, and transaction failure propagation. They do
not connect to PostgreSQL, Cloudinary, or Stripe; real database rollback and
external integrations require a separately configured integration environment.
