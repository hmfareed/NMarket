import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  type:
    | "ORDER_COMPLETED"
    | "ORDER_DELIVERED"
    | "STORE_NAME_CHANGE"
    | "PHONE_NUMBER_CHANGE"
    | "ORDER_CANCELLED"
    | "CART_ITEM_ADDED"
    | "CART_ITEM_REMOVED"
    | "REFUND_REQUESTED"
    | "STORE_VERIFIED"
    | "PRODUCT_PRICE_UPDATED"
    | "ORDER_DELIVERY_ASSIGNED";
  category: "ORDERS" | "STORE" | "CART" | "REFUNDS" | "SYSTEM";
  title: string;
  description: string;
  entityId?: string;
  entityType?: "ORDER" | "STORE" | "USER" | "PRODUCT" | "CART" | "DELIVERY";
  actorName?: string;
  actorRole?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["ORDERS", "STORE", "CART", "REFUNDS", "SYSTEM"],
      default: "ORDERS",
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
    },
    entityType: {
      type: String,
      enum: ["ORDER", "STORE", "USER", "PRODUCT", "CART", "DELIVERY"],
    },
    actorName: {
      type: String,
    },
    actorRole: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
