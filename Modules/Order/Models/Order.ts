import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItemsId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      minlength: 10,
    },
    address: {
      type: String,
      trim: true,
      required: true,
      minlength: 3,
    },
    customerEmail: {
      type: String,
      trim: true,
      required: true,
      minlength: 7,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);
orderSchema.virtual("totalItems").get(function () {
  return this.orderItemsId.reduce((total: number, item: any) => {
    return total + item.quantity;
  }, 0);

})

export const Order = mongoose.model("Order", orderSchema);