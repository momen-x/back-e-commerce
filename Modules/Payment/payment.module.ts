import Stripe from "stripe";
import { env } from "../../config/env.js";
import { PrismaPaymentRepository } from "./repo/payment.js";
import { PaymentService } from "./service/payment.js";
import { PaymentController } from "./Controller/Payment.js";
const repository = new PrismaPaymentRepository();
const stripe = new Stripe(env.STRIPE_SECRET_KEY as string);
const service = new PaymentService(repository, stripe);
export const paymentController = new PaymentController(service);
