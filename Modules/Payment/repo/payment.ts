import { db } from "../../../src/prisma/db.js";
import { PaymentRepository } from "./payment-type-repo.js";
import type { PaymentUpdateInput } from "../types/payment.js";
export class PrismaPaymentRepository extends PaymentRepository {
  async findByOrderId(orderId: number) {
    return db.orm.public.Order.where({ id: orderId }).first();
  }
  async update(orderId: number, data: PaymentUpdateInput) {
    return db.orm.public.Order.where({ id: orderId }).update(data);
  }
}
