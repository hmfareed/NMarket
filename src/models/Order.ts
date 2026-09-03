import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface ISellerOrder {
  sellerOrderId: string; // e.g. NM-10045-A
  storeId: mongoose.Types.ObjectId;
  storeName: string;
  sellerId: mongoose.Types.ObjectId;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "PROCESSING"
    | "READY_FOR_PICKUP"
    | "HANDED_TO_RIDER"
    | "COMPLETED"
    | "CANCELLED";
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  commissionAmount: number;
  sellerEarning: number;
  prepTimeMinutes?: number;
  deliveryId?: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
  orderNumber: string; // e.g. NM-10045
  customerId: mongoose.Types.ObjectId;
  deliveryOtp: string; // 4-digit code given to rider upon package handoff
  fulfillmentType: "LOCAL_DELIVERY" | "STORE_PICKUP";
  status:
    | "CREATED"
    | "PAYMENT_PENDING"
    | "PAID"
    | "PROCESSING"
    | "PARTIALLY_FULFILLED"
    | "FULFILLED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  payment: {
    provider: string; // "PAYSTACK" | "HUBTEL" | "FLUTTERWAVE"
    providerReference?: string;
    method?: string; // "MOBILE_MONEY" | "CARD"
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
    verifiedAt?: Date;
  };
  shippingAddress: {
    recipient: string;
    phone: string;
    region: string;
    city: string;
    area: string;
    streetAddress?: string;
    landmark?: string;
    deliveryInstructions?: string;
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  sellerOrders: ISellerOrder[];
  totalProductAmount: number;
  totalDeliveryFee: number;
  totalAmount: number;
  deliveredAt?: Date;
  assignedRiderId?: mongoose.Types.ObjectId;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSku: { type: String },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    imageUrl: { type: String },
  },
  { _id: true }
);

const SellerOrderSchema = new Schema<ISellerOrder>(
  {
    sellerOrderId: { type: String, required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    storeName: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "PROCESSING",
        "READY_FOR_PICKUP",
        "HANDED_TO_RIDER",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    commissionAmount: { type: Number, required: true, default: 0 },
    sellerEarning: { type: Number, required: true },
    prepTimeMinutes: { type: Number, default: 30 },
    deliveryId: { type: Schema.Types.ObjectId, ref: "Delivery" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deliveryOtp: { type: String, required: true },
    fulfillmentType: {
      type: String,
      enum: ["LOCAL_DELIVERY", "STORE_PICKUP"],
      default: "LOCAL_DELIVERY",
    },
    status: {
      type: String,
      enum: [
        "CREATED",
        "PAYMENT_PENDING",
        "PAID",
        "PROCESSING",
        "PARTIALLY_FULFILLED",
        "FULFILLED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "CREATED",
    },
    payment: {
      provider: { type: String, default: "PAYSTACK" },
      providerReference: { type: String },
      method: { type: String, default: "MOBILE_MONEY" },
      amount: { type: Number, required: true },
      currency: { type: String, default: "GHS" },
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
        default: "PENDING",
      },
      verifiedAt: { type: Date },
    },
    shippingAddress: {
      recipient: { type: String, required: true },
      phone: { type: String, required: true },
      region: { type: String, required: true, default: "Northern Region" },
      city: { type: String, required: true, default: "Tamale" },
      area: { type: String, required: true },
      streetAddress: { type: String },
      landmark: { type: String },
      deliveryInstructions: { type: String },
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] },
      },
    },
    sellerOrders: [SellerOrderSchema],
    totalProductAmount: { type: Number, required: true },
    totalDeliveryFee: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveredAt: { type: Date },
    assignedRiderId: { type: Schema.Types.ObjectId, ref: "User" },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ "sellerOrders.sellerId": 1, "sellerOrders.status": 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
