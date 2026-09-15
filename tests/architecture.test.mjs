import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Import compiled ESM with isolated configuration; no external services are contacted.
Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://test:test@localhost:1/test",
  JWT_SECRET_KEY: "test-only-secret-with-at-least-32-characters",
  CLOUDINARY_CLOUD_NAME: "test",
  CLOUDINARY_API_KEY: "test",
  CLOUDINARY_API_SECRET: "test",
  STRIPE_SECRET_KEY: "sk_test_placeholder",
  BASE_FRONT_URL: "https://example.com",
  EMAIL_USER: "test",
  EMAIL_PASS: "test",
});
const { ProductService } =
  await import("../dist/Modules/Products/service/product.js");
const { UserService } = await import("../dist/Modules/User/service/user.js");
const { AuthService } =
  await import("../dist/Modules/User/Auth/service/auth.js");
const { OrderService } = await import("../dist/Modules/Order/service/order.js");
const { OrderItemService } =
  await import("../dist/Modules/Order_Items/service/order_items.js");
const { PaymentService } =
  await import("../dist/Modules/Payment/service/payment.js");
const { ProductController } =
  await import("../dist/Modules/Products/Controller/Product.js");
const { AuthController } =
  await import("../dist/Modules/User/Auth/Controller/auth.js");
const { UserController } =
  await import("../dist/Modules/User/Controller/User.js");
const { errorHandler } = await import("../dist/middlewares/err.js");
const { AppError } = await import("../dist/utils/AppError.js");
const { db } = await import("../dist/src/prisma/db.js");
const { default: bcrypt } = await import("bcryptjs");
const { default: jwt } = await import("jsonwebtoken");
const { default: cloudinary } = await import("cloudinary");
after(() => db.close());

function invoke(handler, request = {}) {
  return new Promise((resolve, reject) => {
    const result = { status: 200, body: undefined, cookies: [] };
    const response = {
      statusCode: 200,
      status(code) {
        result.status = this.statusCode = code;
        return this;
      },
      json(body) {
        result.body = body;
        resolve(result);
        return this;
      },
      cookie(...args) {
        result.cookies.push(args);
        return this;
      },
      clearCookie(...args) {
        result.cookies.push(args);
        return this;
      },
    };
    try {
      handler(
        { params: {}, query: {}, body: {}, ...request },
        response,
        (error) =>
          error
            ? errorHandler(error, request, response, reject)
            : reject(new Error("No response")),
      );
    } catch (error) {
      reject(error);
    }
  });
}

test("product filtering retains global counts, page inputs and category response", async () => {
  const category = { id: 2, title: "cakes" };
  const products = [{ id: 3 }];
  const service = new ProductService({
    findCategoryById: async (id) => {
      assert.equal(id, 2);
      return category;
    },
    findAll: async (page, id) => {
      assert.deepEqual(page, { page: 2, limit: 8 });
      assert.equal(id, 2);
      return products;
    },
    count: async () => 17,
  });
  assert.deepEqual(await service.getAll({ page: 2, limit: 8 }, 2), {
    success: true,
    count: 17,
    pageCount: 3,
    category,
    products,
  });
});

test("business errors preserve string, error and message response shapes", async () => {
  const products = new ProductController(
    new ProductService({ findById: async () => null }),
  );
  assert.deepEqual(
    await invoke(products.getProductById, { params: { id: "8" } }),
    { status: 404, body: "product not found", cookies: [] },
  );
  const users = new UserController(
    new UserService({ findById: async () => null }),
  );
  assert.equal(
    (await invoke(users.getUserById, { params: { id: "8" } })).body.error,
    "user not found",
  );
  assert.deepEqual((await invoke(users.getMe, { user: { id: 8 } })).body, {
    message: "user not found",
  });
});

test("product validation prevents service calls and retains endpoint-specific bodies", async () => {
  const controller = new ProductController({
    create: () => assert.fail("invalid input reached service"),
  });
  const response = await invoke(controller.addProduct);
  assert.equal(response.status, 400);
  assert.equal(typeof response.body.message, "string");
  assert.equal((await invoke(controller.updateProduct)).body, "id is required");
});

test("product image replacement uploads, removes the previous image, then persists", async (t) => {
  const events = [];
  t.mock.method(
    cloudinary.v2.uploader,
    "upload_stream",
    (options, callback) => ({
      end(buffer) {
        assert.equal(buffer.toString(), "image");
        events.push("upload");
        callback(null, { public_id: "new", secure_url: "https://image/new" });
      },
    }),
  );
  t.mock.method(cloudinary.v2.uploader, "destroy", async (id) => {
    assert.equal(id, "old");
    events.push("remove");
  });
  const service = new ProductService({
    findById: async () => ({
      imageUrl: "https://image/old",
      imagePublicId: "old",
    }),
    update: async (id, data) => {
      events.push("update");
      return data;
    },
  });
  const updated = await service.update(
    1,
    { title: "new title" },
    { buffer: Buffer.from("image") },
  );
  assert.deepEqual(events, ["upload", "remove", "update"]);
  assert.equal(updated.imagePublicId, "new");
  assert.equal(updated.imageUrl, "https://image/new");
});

test("users omit passwords, protect admins and verify the old password before updating", async () => {
  const user = {
    id: 1,
    isAdmin: true,
    password: await bcrypt.hash("old password", 10),
  };
  let updated;
  const service = new UserService({
    findById: async () => user,
    findAll: async () => [user],
    update: async (id, data) => {
      updated = data;
    },
  });
  assert.deepEqual(await service.getAll(), {
    count: 1,
    users: [{ id: 1, isAdmin: true }],
  });
  await assert.rejects(service.delete(1), {
    statusCode: 403,
    message: "you can't delete admin account",
  });
  await assert.rejects(
    service.changePassword(1, {
      oldPassword: "wrong",
      newPassword: "new password",
    }),
    { statusCode: 400 },
  );
  assert.equal(updated, undefined);
  await service.changePassword(1, {
    oldPassword: "old password",
    newPassword: "new password",
  });
  assert.equal(await bcrypt.compare("new password", updated.password), true);
});

test("auth normalizes email, verifies passwords and retains JWT and cookie behavior", async () => {
  const user = {
    id: 4,
    userImageUrl: "image",
    isAdmin: false,
    emailVerified: true,
    password: await bcrypt.hash("password123", 10),
  };
  const service = new AuthService({
    findByEmail: async (email) => {
      assert.equal(email, "test@example.com");
      return user;
    },
  });
  await assert.rejects(
    service.login({ email: "test@example.com", password: "wrong" }),
    { message: "invalid credentials" },
  );
  const { token, user: publicUser } = await service.login({
    email: " TEST@EXAMPLE.COM ",
    password: "password123",
  });
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  assert.equal(payload.id, 4);
  assert.equal(payload.exp - payload.iat, 60 * 60 * 24 * 5);
  assert.equal("password" in publicUser, false);
  const controller = new AuthController(service);
  const response = await invoke(controller.loginUser, {
    body: { email: "test@example.com", password: "password123" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(response.cookies[0][2], {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 5,
  });
  const logout = await invoke(controller.logout);
  assert.deepEqual(logout.cookies[0], [
    "token",
    { httpOnly: true, secure: false, sameSite: "lax" },
  ]);
});

test("registration and verification retain existing persistence behavior", async () => {
  let created;
  let updated;
  const repository = {
    findByEmail: async () => null,
    create: async (data) => {
      created = data;
    },
    findByVerificationToken: async (token, now) => {
      assert.equal(token, "valid");
      assert.ok(now.epochMilliseconds);
      return { id: 2 };
    },
    update: async (id, data) => {
      assert.equal(id, 2);
      updated = data;
    },
  };
  const service = new AuthService(repository);
  assert.deepEqual(
    await service.register({
      email: "TEST@EXAMPLE.COM",
      firstName: "First",
      lastName: "Last",
      password: "password123",
    }),
    { created: true },
  );
  assert.equal(created.email, "test@example.com");
  assert.equal(created.emailVerified, true);
  assert.equal(created.emailVerificationToken.length, 64);
  assert.equal(await bcrypt.compare("password123", created.password), true);
  await service.verifyEmail("valid");
  assert.deepEqual(updated, {
    emailVerified: true,
    emailVerificationToken: null,
    emailVerificationExpires: null,
  });
  repository.findByEmail = async () => ({ emailVerified: false });
  created = undefined;
  assert.deepEqual(await service.register({ email: "test@example.com" }), {
    created: false,
  });
  assert.equal(created, undefined);
  repository.findByVerificationToken = async () => null;
  await assert.rejects(service.verifyEmail("expired"), {
    message: "Invalid or expired token",
  });
});

test("order totals use stored prices and missing products prevent writes", async () => {
  let saved;
  const repo = {
    findUserById: async () => ({ id: 7 }),
    findProductById: async (id) => ({ id, price: id === 1 ? "12.50" : "3.25" }),
    createWithItems: async (data) => {
      saved = data;
      return { id: 9, ...data.order };
    },
  };
  const service = new OrderService(repo);
  const input = {
    address: "address",
    customerEmail: "test@example.com",
    phone: "1234567890",
    orderItems: [
      { productId: 1, quantity: 2, price: 1 },
      { productId: 2, quantity: 3 },
    ],
  };
  await service.create(7, input);
  assert.equal(saved.order.totalPrice, 34.75);
  assert.equal(saved.order.userId, 7);
  assert.deepEqual(
    saved.items.map((item) => item.price),
    ["12.50", "3.25"],
  );
  saved = undefined;
  repo.findProductById = async () => null;
  await assert.rejects(service.create(7, input), {
    statusCode: 404,
    message: "product 1 not found",
  });
  assert.equal(saved, undefined);
});

test("order access permits owners and admins and rejects unrelated users", async () => {
  const order = { id: 1, userId: 7 };
  let deleted = false;
  const service = new OrderService({
    findById: async () => order,
    findByIdWithRelations: async () => order,
    delete: async () => {
      deleted = true;
    },
  });
  assert.equal(await service.getById(1, { id: "7", isAdmin: false }), order);
  assert.equal(await service.getById(1, { id: 8, isAdmin: true }), order);
  await assert.rejects(service.delete(1, { id: 8, isAdmin: false }), {
    statusCode: 403,
  });
  assert.equal(deleted, false);
  await service.delete(1, { id: 7, isAdmin: false });
  assert.equal(deleted, true);
});

test("order repository uses the transaction client for every write and propagates failures", async (t) => {
  const { PrismaOrderRepository } =
    await import("../dist/Modules/Order/repo/order.js");
  const writes = [];
  let failItem = false;
  let committed = false;
  t.mock.method(db, "transaction", async (callback) => {
    const value = await callback({
      orm: {
        public: {
          Order: {
            create: async (data) => {
              writes.push(["order", data]);
              return { id: 91, ...data };
            },
          },
          OrderItem: {
            create: async (data) => {
              writes.push(["item", data]);
              if (failItem) throw new Error("item failed");
            },
          },
        },
      },
    });
    committed = true;
    return value;
  });
  const input = {
    order: { userId: 2 },
    items: [{ productId: 1, quantity: 2, price: "10.00" }],
  };
  const repository = new PrismaOrderRepository();
  assert.deepEqual(await repository.createWithItems(input), {
    id: 91,
    userId: 2,
  });
  assert.equal(writes[1][1].orderId, 91);
  assert.equal(committed, true);
  committed = false;
  failItem = true;
  await assert.rejects(repository.createWithItems(input), {
    message: "item failed",
  });
  assert.equal(committed, false);
});

test("order-item updates validate changed relations and retain provided quantity and price", async () => {
  let saved;
  const repo = {
    findById: async () => ({ id: 1 }),
    findProductById: async () => null,
    findOrderById: async () => ({ id: 3 }),
    update: async (id, data) => {
      saved = data;
      return data;
    },
  };
  const service = new OrderItemService(repo);
  await assert.rejects(service.update(1, { productId: 8 }), {
    message: "the provided product was not found",
  });
  assert.equal(saved, undefined);
  await service.update(1, { orderId: 3, quantity: 2, price: 9.5 });
  assert.deepEqual(saved, { orderId: 3, quantity: 2, price: 9.5 });
});

test("payments convert totals to cents and persist the existing paid status transition", async () => {
  let intent;
  let saved;
  const repo = {
    findByOrderId: async () => ({ id: 3, totalPrice: "12.34" }),
    update: async (id, data) => {
      saved = { id, ...data };
      return saved;
    },
  };
  const service = new PaymentService(repo, {
    paymentIntents: {
      create: async (data) => {
        intent = data;
        return { client_secret: "secret" };
      },
    },
  });
  assert.deepEqual(await service.createPaymentIntent({ orderId: 3 }), {
    clientSecret: "secret",
  });
  assert.deepEqual(intent, {
    amount: 1234,
    currency: "usd",
    metadata: { orderId: 3 },
  });
  assert.equal(saved, undefined);
  await service.confirmPayment({ orderId: 3 });
  assert.deepEqual(saved, { id: 3, isPaid: true, status: "processing" });
  repo.findByOrderId = async () => null;
  await assert.rejects(service.createPaymentIntent({ orderId: 4 }), {
    statusCode: 404,
  });
});

test("all compiled route modules import and retain their endpoint methods and paths", async () => {
  const routes = [
    [
      "Products/Routes/Products",
      [
        "GET /",
        "POST /",
        "GET /count",
        "GET /categories/:categoryId",
        "GET /:id",
        "PUT /:id",
        "DELETE /:id",
      ],
    ],
    [
      "User/Routes/User",
      [
        "GET /",
        "PUT /",
        "PUT /password/change-password",
        "GET /me",
        "GET /:id",
        "DELETE /:id",
        "POST /photo-upload",
      ],
    ],
    [
      "User/Auth/Routes/Auth",
      ["POST /register", "POST /login", "GET /verify/:token", "GET /logout"],
    ],
    [
      "Order/Routes/Order",
      [
        "GET /",
        "POST /",
        "GET /last-order",
        "GET /user-orders",
        "GET /:id",
        "DELETE /:id",
      ],
    ],
    [
      "Order_Items/Routes/Order_items",
      ["GET /", "POST /", "GET /:id", "PUT /:id", "DELETE /:id"],
    ],
    [
      "Payment/Routes/Payment",
      ["POST /create-payment-intent", "POST /confirm"],
    ],
    [
      "Category/Routes/Category",
      ["GET /", "POST /", "GET /:id", "PUT /:id", "DELETE /:id"],
    ],
  ];
  for (const [file, expected] of routes) {
    const { default: router } = await import(`../dist/Modules/${file}.js`);
    const actual = router.stack.flatMap((layer) =>
      layer.route
        ? layer.route.stack.map(
            (handler) => `${handler.method.toUpperCase()} ${layer.route.path}`,
          )
        : [],
    );
    // Express stores middleware as additional entries for each method.
    assert.deepEqual([...new Set(actual)], expected, file);
  }
});

test("route wiring preserves authorization and upload middleware before bound controllers", async () => {
  const { verifyAdmin, VeriFyToken, verifyTokenAndAuthorization } =
    await import("../dist/middlewares/verifyToken.js");
  const specs = [
    [
      "Products",
      "Products",
      "product",
      "productController",
      [
        ["/", "get", "getAllProducts"],
        ["/", "post", "addProduct", verifyAdmin, "upload"],
        ["/count", "get", "getProductsCount"],
        ["/categories/:categoryId", "get", "getProductsByCategory"],
        ["/:id", "get", "getProductById"],
        ["/:id", "put", "updateProduct", verifyAdmin, "upload"],
        ["/:id", "delete", "deleteProduct", verifyAdmin],
      ],
    ],
    [
      "User",
      "User",
      "user",
      "userController",
      [
        ["/", "get", "getAllUsers", verifyAdmin],
        ["/", "put", "updateUserInfo", VeriFyToken],
        ["/password/change-password", "put", "changePassword", VeriFyToken],
        ["/me", "get", "getMe", VeriFyToken],
        ["/:id", "get", "getUserById", verifyTokenAndAuthorization],
        ["/:id", "delete", "deleteUser", verifyTokenAndAuthorization],
        ["/photo-upload", "post", "addProfileImage", VeriFyToken, "upload"],
      ],
    ],
    [
      "User/Auth",
      "Auth",
      "auth",
      "authController",
      [
        ["/register", "post", "registerUser"],
        ["/login", "post", "loginUser"],
        ["/logout", "get", "logout"],
        ["/verify/:token", "get", "verifyEmail"],
      ],
    ],
    [
      "Order",
      "Order",
      "order",
      "orderController",
      [
        ["/", "get", "getOrders", verifyAdmin],
        ["/", "post", "addOrder", VeriFyToken],
        ["/last-order", "get", "getLastOrder", VeriFyToken],
        ["/user-orders", "get", "getUserOrders", VeriFyToken],
        ["/:id", "get", "getOrderById", VeriFyToken],
        ["/:id", "delete", "deleteOrder", VeriFyToken],
      ],
    ],
    [
      "Order_Items",
      "Order_items",
      "order_items",
      "orderItemController",
      [
        ["/", "get", "getAllOrderItems", verifyAdmin],
        ["/", "post", "addNewOrderItems", VeriFyToken],
        ["/:id", "get", "getOrderItemsById", verifyTokenAndAuthorization],
        ["/:id", "put", "UpdateOrderItems", verifyTokenAndAuthorization],
        ["/:id", "delete", "deleteOrderItem", verifyTokenAndAuthorization],
      ],
    ],
    [
      "Payment",
      "Payment",
      "payment",
      "paymentController",
      [
        ["/create-payment-intent", "post", "createPaymentIntent", VeriFyToken],
        ["/confirm", "post", "confirmPayment", VeriFyToken],
      ],
    ],
  ];
  for (const [module, routeName, stem, instance, endpoints] of specs) {
    const { default: router } = await import(
      `../dist/Modules/${module}/Routes/${routeName}.js`
    );
    const wired = (await import(`../dist/Modules/${module}/${stem}.module.js`))[
      instance
    ];
    for (const [url, method, handler, ...middleware] of endpoints) {
      const route = router.stack.find(
        (layer) => layer.route?.path === url && layer.route.methods[method],
      ).route;
      const handlers = route.stack
        .filter((layer) => layer.method === method)
        .map((layer) => layer.handle);
      assert.equal(
        handlers.at(-1),
        wired[handler],
        `${module} ${method} ${url}`,
      );
      assert.equal(handlers.length, middleware.length + 1);
      middleware.forEach((expected, index) => {
        if (expected === "upload")
          assert.equal(handlers[index].name, "multerMiddleware");
        else assert.equal(handlers[index], expected);
      });
    }
  }
});

test("controllers and services cannot access Prisma, and services cannot depend on Express", async () => {
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((entry) =>
          entry.isDirectory()
            ? walk(path.join(dir, entry.name))
            : path.join(dir, entry.name),
        ),
      )
    ).flat();
  }
  for (const file of await walk("Modules")) {
    if (file.includes(`${path.sep}Category${path.sep}`)) continue;
    if (!/[\\/](Controller|service)[\\/]/.test(file) || !file.endsWith(".ts"))
      continue;
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      /from\s+["'][^"']*(?:prisma\/db|@prisma\/)/,
      file,
    );
    if (file.includes(`${path.sep}service${path.sep}`)) {
      assert.doesNotMatch(
        source,
        /from\s+["']express|\b(?:Request|Response|Express)\b|\bres\.(?:status|json)/,
        file,
      );
    }
  }
});
