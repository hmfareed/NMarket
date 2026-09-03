import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  transactionNumber: string;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  provider: "PAYSTACK" | "HUBTEL" | "MOMO_SIMULATOR";
  providerReference: string;
  paymentMethod: "MTN_MOMO" | "TELECEL_CASH" | "AIRTELTIGO_MONEY";
  momoNumber: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  verifiedAt?: Date;
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "GHS" },
    provider: {
      type: String,
      enum: ["PAYSTACK", "HUBTEL", "MOMO_SIMULATOR"],
      default: "MOMO_SIMULATOR",
    },
    providerReference: { type: String, required: true, unique: true },
    paymentMethod: {
      type: String,
      enum: ["MTN_MOMO", "TELECEL_CASH", "AIRTELTIGO_MONEY"],
      default: "MTN_MOMO",
    },
    momoNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    verifiedAt: { type: Date },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

TransactionSchema.index({ customerId: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
