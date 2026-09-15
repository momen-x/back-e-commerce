import asyncHandler from "express-async-handler";
import type { PaymentService } from "../service/payment.js";
export class PaymentController {
  constructor(private readonly service: PaymentService) {}
  createPaymentIntent = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ message: "orderId is required" });
      return;
    }
    res.status(200).json(await this.service.createPaymentIntent({ orderId }));
  });
  confirmPayment = asyncHandler(async (req, res) => {
    const order = await this.service.confirmPayment({
      orderId: req.body.orderId,
    });
    res.status(200).json({ message: "Payment confirmed", order });
  });
}
