import "temporal-polyfill/full/global";

import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoute from "./Modules/User/Routes/User.js";
import authRoute from "./Modules/User/Auth/Routes/Auth.js";
import categoryRoute from "./Modules/Category/Routes/Category.js";
import ProductsRoute from "./Modules/Products/Routes/Products.js";
import OrderItemRoute from "./Modules/Order_Items/Routes/Order_items.js";
import OrderRoute from "./Modules/Order/Routes/Order.js";
import paymentRoute from "./Modules/Payment/Routes/Payment.js";

import { errorHandler, notFound } from "./middlewares/err.js";
import { db } from "./src/prisma/db.js";
import { env } from "./config/env.js";


const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://front-e-commarce.vercel.app",
        "http://localhost:5173",
      ];

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(cookieParser());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.use("/api/users", userRoute);

app.use("/api/users/auth", authRoute);

app.use("/api/categories", categoryRoute);

app.use("/api/order-items", OrderItemRoute);

app.use("/api/products", ProductsRoute);

app.use("/api/orders", OrderRoute);

app.use("/api/payment", paymentRoute);

// Error handling middleware
app.use(notFound);

app.use(errorHandler);

const PORT = env.PORT;

async function startServer() {
  try {
    await db.connect();

    console.log("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);

    process.exit(1);
  }
}

startServer();
