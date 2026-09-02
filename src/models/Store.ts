import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStore extends Document {
  sellerId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phone: string;
  whatsappPhone?: string;
  verificationStatus:
    | "PENDING"
    | "UNDER_REVIEW"
    | "VERIFIED"
    | "REJECTED"
    | "SUSPENDED";
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: {
    region: string;
    city: string;
    area: string;
    pickupAddress: string;
    landmark?: string;
  };
  deliverySettings: {
    supportsLocalDelivery: boolean;
    prepTimeMinutes: number;
    operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  };
  performance: {
    rating: number;
    reviewCount: number;
    totalOrders: number;
    acceptanceRate: number;
    score: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    phone: { type: String, required: true },
    whatsappPhone: { type: String },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      region: { type: String, required: true, default: "Northern Region" },
      city: { type: String, required: true, default: "Tamale" },
      area: { type: String, required: true },
      pickupAddress: { type: String, required: true },
      landmark: { type: String },
    },
    deliverySettings: {
      supportsLocalDelivery: { type: Boolean, default: true },
      prepTimeMinutes: { type: Number, default: 30 },
      operatingHours: { type: Schema.Types.Mixed },
    },
    performance: {
      rating: { type: Number, default: 5.0 },
      reviewCount: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 1.0 },
      score: { type: Number, default: 100 },
    },
  },
  { timestamps: true }
);

StoreSchema.index({ location: "2dsphere" });
StoreSchema.index({ verificationStatus: 1 });

export const Store: Model<IStore> =
  mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);

export default Store;
