export type PaymentInput = { orderId: number };
export type PaymentUpdateInput = { isPaid: boolean; status: "processing" };
export interface PaymentGateway {
  paymentIntents: {
    create(input: {
      amount: number;
      currency: string;
      metadata: { orderId: number };
    }): Promise<{ client_secret: string | null }>;
  };
}
