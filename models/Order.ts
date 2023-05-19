import { Schema, model, Model } from "mongoose";

export interface IOrder {
  tax: number;
  shippingFee: number;
  subtotal: number;
  total: number;
  orderItems: [ISingleOrderItem];
  status: string;
  user: Schema.Types.ObjectId;
  clientSecret: string;
  paymentIntentId: string;
}

export interface ISingleOrderItem {
  name: string;
  image: string;
  price: number;
  amount: number;
  product: Schema.Types.ObjectId;
}

export const SingleCartItemSchema = new Schema<ISingleOrderItem>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
});

export const OrderSchema = new Schema<IOrder>(
  {
    tax: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    orderItems: [SingleCartItemSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: { type: String, required: true },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
