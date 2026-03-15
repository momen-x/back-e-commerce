import express, { Request, Response } from "express";
import { connectDB } from "./Config/DBConnect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoute from "./Modules/User/Routes/User";
import authRoute from "./Modules/User/Auth/Routes/Auth";
import categoryRoute from "./Modules/Category/Routes/Category";
import ProductsRoute from "./Modules/Products/Routes/Products";
import OrderItemRoute from "./Modules/Order_Items/Routes/Order_items";
import OrderRoute from "./Modules/Order/Routes/Order";
import paymentRoute from "./Modules/Payment/Routes/Payment";
import { errorHandler, notFound } from "./middlewares/err";
import cors from "cors";
dotenv.config();

connectDB();
const app = express();
app.use(
  cors({
    origin: "https://front-e-commarce.vercel.app/products",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

//error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
