import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeliveryZone extends Document {
  name: string;
  slug: string;
  region: string;
  city: string;
  baseFee: number;
  estimatedTimeMinutes: number;
  estimatedTimeText: string;
  boundary: {
    type: "Polygon";
    coordinates: number[][][]; // GeoJSON Polygon
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryZoneSchema = new Schema<IDeliveryZone>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    region: { type: String, required: true, default: "Northern Region" },
    city: { type: String, required: true, default: "Tamale" },
    baseFee: { type: Number, required: true, default: 20.0 },
    estimatedTimeMinutes: { type: Number, required: true, default: 120 },
    estimatedTimeText: { type: String, required: true, default: "1-3 hours" },
    boundary: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon",
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2dsphere index for spatial boundary queries ($geoIntersects, $geoWithin)
DeliveryZoneSchema.index({ boundary: "2dsphere" });

export const DeliveryZone: Model<IDeliveryZone> =
  mongoose.models.DeliveryZone ||
  mongoose.model<IDeliveryZone>("DeliveryZone", DeliveryZoneSchema);

export default DeliveryZone;
