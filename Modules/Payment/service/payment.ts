import type { PaymentRepository } from "../repo/payment-type-repo.js";
import type { PaymentGateway, PaymentInput } from "../types/payment.js";
import { AppError } from "../../../utils/AppError.js";
export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly gateway: PaymentGateway,
  ) {}
  async createPaymentIntent({ orderId }: PaymentInput) {
    const order = await this.repository.findByOrderId(orderId);
    if (!order) throw new AppError(404, "Order not found");
    const intent = await this.gateway.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "usd",
      metadata: { orderId },
    });
    return { clientSecret: intent.client_secret };
  }
  async confirmPayment({ orderId }: PaymentInput) {
    const order = await this.repository.findByOrderId(orderId);
    if (!order) throw new AppError(404, "Order not found");
    return this.repository.update(order.id, {
      isPaid: true,
      status: "processing",
    });
  }
}
