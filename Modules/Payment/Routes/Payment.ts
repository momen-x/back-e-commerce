import express from "express";
import { paymentController } from "../payment.module.js";
import { VeriFyToken } from "../../../middlewares/verifyToken.js";

const router = express.Router();

router.post(
  "/create-payment-intent",
  VeriFyToken,
  paymentController.createPaymentIntent,
);
router.post("/confirm", VeriFyToken, paymentController.confirmPayment);

export default router;
