import express from "express";
import { createPaymentIntent, confirmPayment } from "../Controller/Payment";
import { VeriFyToken } from "../../../middlewares/verifyToken";

const router = express.Router();

router.post("/create-payment-intent", VeriFyToken, createPaymentIntent);
router.post("/confirm", VeriFyToken, confirmPayment);

export default router;