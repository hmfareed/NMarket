import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from the same user for the same product on the same order
ReviewSchema.index(
  { orderId: 1, productId: 1, customerId: 1 },
  { unique: true }
);
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ storeId: 1 });

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
