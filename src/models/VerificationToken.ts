import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationToken extends Document {
  identifier: string; // Phone (+233...) or Email
  tokenHash: string; // SHA-256 hash of the 6-digit OTP
  channel: "SMS" | "EMAIL";
  purpose: "SIGNUP" | "LOGIN" | "PASSWORD_RESET";
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>(
  {
    identifier: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    channel: { type: String, enum: ["SMS", "EMAIL"], required: true },
    purpose: {
      type: String,
      enum: ["SIGNUP", "LOGIN", "PASSWORD_RESET"],
      default: "SIGNUP",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB TTL index: automatically deletes document when expiresAt timestamp is reached
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationTokenSchema.index({ identifier: 1, purpose: 1 });

export const VerificationToken: Model<IVerificationToken> =
  mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>(
    "VerificationToken",
    VerificationTokenSchema
  );

export default VerificationToken;
