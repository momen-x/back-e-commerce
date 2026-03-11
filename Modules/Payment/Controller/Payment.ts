import Stripe from "stripe";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Order } from "../../Order/Models/Order";
import dotenv from "dotenv"

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * @method POST
 * @route /api/payment/create-payment-intent
 * @description create a payment intent
 * @access private logged in user
 */
export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ message: "orderId is required" });
    return;
  }

  // Get the order from DB
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  // Create payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // ← Stripe uses cents!
    currency: "usd",
    metadata: {
      orderId: orderId, // ← save orderId to use in webhook later
    },
  });

  res.status(200).json({
    clientSecret: paymentIntent.client_secret, // ← send this to frontend
  });
});

/**
 * @method POST
 * @route /api/payment/confirm
 * @description mark order as paid after successful payment
 * @access private logged in user
 */
export const confirmPayment = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  order.isPaid = true;
  order.status = "processing";
  await order.save();

  res.status(200).json({ message: "Payment confirmed", order });
});