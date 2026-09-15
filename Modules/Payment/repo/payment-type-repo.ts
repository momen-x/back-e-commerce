import type { Order } from "../../Order/entities/order.js";
import type { PaymentUpdateInput } from "../types/payment.js";
/** Payment state is stored on Order; there is no separate payment model. */
export abstract class PaymentRepository {
  abstract findByOrderId(orderId: number): Promise<Order | null>;
  abstract update(
    orderId: number,
    data: PaymentUpdateInput,
  ): Promise<Order | null>;
}
