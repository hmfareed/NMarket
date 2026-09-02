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
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  customerProfile?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  riderProfile?: {
    vehicleType: "MOTORCYCLE" | "TRICYCLE" | "BICYCLE";
    licensePlate?: string;
    ghanaCardNumber?: string;
    operatingZone: string;
    isOnline: boolean;
    currentEarnings: number;
    totalCompletedDeliveries: number;
    rating: number;
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
    phone: { type: String, unique: true, sparse: true, trim: true },
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
      default: "PENDING_VERIFICATION",
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    customerProfile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      avatarUrl: { type: String },
    },
    riderProfile: {
      vehicleType: {
        type: String,
        enum: ["MOTORCYCLE", "TRICYCLE", "BICYCLE"],
        default: "MOTORCYCLE",
      },
      licensePlate: { type: String },
      ghanaCardNumber: { type: String },
      operatingZone: { type: String, default: "Tamale Central (Zone 1)" },
      isOnline: { type: Boolean, default: false },
      currentEarnings: { type: Number, default: 0 },
      totalCompletedDeliveries: { type: Number, default: 0 },
      rating: { type: Number, default: 5.0 },
    },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
