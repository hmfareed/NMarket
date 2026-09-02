import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole =
  | "CUSTOMER"
  | "SELLER"
  | "RIDER"
  | "SUPER_ADMIN"
  | "OPERATIONS_ADMIN"
  | "FINANCE_ADMIN"
  | "SUPPORT";

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: string; // e.g. "Home", "Work", "Shop"
  recipient: string;
  phone: string;
  region: string;
  city: string;
  area: string;
  landmark?: string;
  deliveryInstructions?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  isDefault: boolean;
}

export interface IUser extends Document {
  email?: string;
  phone: string;
  passwordHash?: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  customerProfile?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, default: "Home" },
    recipient: { type: String, required: true },
    phone: { type: String, required: true },
    region: { type: String, required: true, default: "Northern Region" },
    city: { type: String, required: true, default: "Tamale" },
    area: { type: String, required: true },
    landmark: { type: String },
    deliveryInstructions: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: [
        "CUSTOMER",
        "SELLER",
        "RIDER",
        "SUPER_ADMIN",
        "OPERATIONS_ADMIN",
        "FINANCE_ADMIN",
        "SUPPORT",
      ],
      default: "CUSTOMER",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"],
      default: "ACTIVE",
    },
    customerProfile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      avatarUrl: { type: String },
    },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
