import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant {
  sku: string;
  name: string; // e.g. "128GB - Black"
  price: number;
  compareAtPrice?: number;
  inventory: {
    onHand: number;
    reserved: number;
    available: number;
  };
}

export interface IProductImage {
  url: string;
  isPrimary: boolean;
  thumbnailUrl?: string;
}

export interface IProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  category: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "REJECTED";
  price: number;
  compareAtPrice?: number;
  images: IProductImage[];
  variants: IProductVariant[];
  inventory: {
    onHand: number;
    reserved: number;
    available: number;
    lowStockThreshold: number;
  };
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude] denormalized for proximity search
  };
  rating?: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    inventory: {
      onHand: { type: Number, required: true, default: 0 },
      reserved: { type: Number, required: true, default: 0 },
      available: { type: Number, required: true, default: 0 },
    },
  },
  { _id: true }
);

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    thumbnailUrl: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    category: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    brand: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "REJECTED"],
      default: "DRAFT",
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: [ProductImageSchema],
    variants: [ProductVariantSchema],
    inventory: {
      onHand: { type: Number, required: true, default: 0 },
      reserved: { type: Number, required: true, default: 0 },
      available: { type: Number, required: true, default: 0 },
      lowStockThreshold: { type: Number, default: 2 },
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
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// 2dsphere index for proximity ranking
ProductSchema.index({ location: "2dsphere" });
ProductSchema.index({ storeId: 1, status: 1 });
ProductSchema.index({ status: 1, category: 1, price: 1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
