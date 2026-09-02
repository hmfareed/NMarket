import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDelivery extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  sellerOrderId: string;
  riderId?: mongoose.Types.ObjectId;
  pickupLocation: {
    storeName: string;
    area: string;
    address: string;
    phone: string;
    coordinates?: [number, number];
  };
  dropoffLocation: {
    recipient: string;
    phone: string;
    area: string;
    address: string;
    landmark?: string;
    deliveryInstructions?: string;
    coordinates?: [number, number];
  };
  status:
    | "PENDING_DISPATCH"
    | "ACCEPTED"
    | "PICKED_UP"
    | "DELIVERED"
    | "FAILED"
    | "CANCELLED";
  deliveryFee: number;
  deliveryOtp: string; // Hashed or 4-digit reference
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    sellerOrderId: { type: String, required: true },
    riderId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    pickupLocation: {
      storeName: { type: String, required: true },
      area: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      coordinates: { type: [Number] },
    },
    dropoffLocation: {
      recipient: { type: String, required: true },
      phone: { type: String, required: true },
      area: { type: String, required: true },
      address: { type: String, required: true },
      landmark: { type: String },
      deliveryInstructions: { type: String },
      coordinates: { type: [Number] },
    },
    status: {
      type: String,
      enum: [
        "PENDING_DISPATCH",
        "ACCEPTED",
        "PICKED_UP",
        "DELIVERED",
        "FAILED",
        "CANCELLED",
      ],
      default: "PENDING_DISPATCH",
      index: true,
    },
    deliveryFee: { type: Number, required: true, default: 10 },
    deliveryOtp: { type: String, required: true },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

DeliverySchema.index({ status: 1, createdAt: -1 });

export const Delivery: Model<IDelivery> =
  mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema);

export default Delivery;
