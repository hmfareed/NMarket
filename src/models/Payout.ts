import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayout extends Document {
  recipientType: "SELLER" | "RIDER";
  recipientId: mongoose.Types.ObjectId;
  recipientName: string;
  momoNetwork: "MTN_MOMO" | "TELECEL_CASH" | "AIRTELTIGO_MONEY";
  momoNumber: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  reference: string;
  relatedOrderNumbers: string[];
  disbursedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    recipientType: {
      type: String,
      enum: ["SELLER", "RIDER"],
      required: true,
    },
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientName: { type: String, required: true },
    momoNetwork: {
      type: String,
      enum: ["MTN_MOMO", "TELECEL_CASH", "AIRTELTIGO_MONEY"],
      default: "MTN_MOMO",
    },
    momoNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },
    reference: { type: String, required: true, unique: true },
    relatedOrderNumbers: [{ type: String }],
    disbursedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

PayoutSchema.index({ recipientType: 1, status: 1 });

export const Payout: Model<IPayout> =
  mongoose.models.Payout || mongoose.model<IPayout>("Payout", PayoutSchema);

export default Payout;
