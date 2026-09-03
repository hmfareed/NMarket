import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDispute extends Document {
  disputeNumber: string;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  sellerOrderId?: string;
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  reason: "WRONG_ITEM" | "DAMAGED" | "MISSING_ITEM" | "LATE_DELIVERY" | "OTHER";
  description: string;
  status:
    | "OPEN"
    | "UNDER_REVIEW"
    | "RESOLVED_REFUND"
    | "RESOLVED_REPLACEMENT"
    | "REJECTED";
  adminNotes?: string;
  refundAmount?: number;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    disputeNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    sellerOrderId: { type: String },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    reason: {
      type: String,
      enum: ["WRONG_ITEM", "DAMAGED", "MISSING_ITEM", "LATE_DELIVERY", "OTHER"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        "OPEN",
        "UNDER_REVIEW",
        "RESOLVED_REFUND",
        "RESOLVED_REPLACEMENT",
        "REJECTED",
      ],
      default: "OPEN",
      index: true,
    },
    adminNotes: { type: String },
    refundAmount: { type: Number },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

DisputeSchema.index({ customerId: 1, createdAt: -1 });

export const Dispute: Model<IDispute> =
  mongoose.models.Dispute || mongoose.model<IDispute>("Dispute", DisputeSchema);

export default Dispute;
