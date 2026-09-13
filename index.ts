import "temporal-polyfill/full/global";

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoute from "./Modules/User/Routes/User";
import authRoute from "./Modules/User/Auth/Routes/Auth";
import categoryRoute from "./Modules/Category/Routes/Category";
import ProductsRoute from "./Modules/Products/Routes/Products";
import OrderItemRoute from "./Modules/Order_Items/Routes/Order_items";
import OrderRoute from "./Modules/Order/Routes/Order";
import paymentRoute from "./Modules/Payment/Routes/Payment";

import { errorHandler, notFound } from "./middlewares/err";
import { db } from "./src/prisma/db";

dotenv.config();

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

const PORT = process.env.PORT || 5000;

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
