import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";
import { User } from "@/models/User";
import { getTamaleAreaByName } from "@/lib/constants/tamale-areas";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: Fetch current user's store
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectToDatabase();
    const store = await Store.findOne({ sellerId: session.userId });

    if (!store) {
      return NextResponse.json({ store: null, hasStore: false });
    }

    return NextResponse.json({ store, hasStore: true });
  } catch (error) {
    console.error("Fetch store error:", error);
    return NextResponse.json({ error: "Failed to fetch store details." }, { status: 500 });
  }
}

// POST: Submit a new store application
export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user already submitted a store
    const existingStore = await Store.findOne({ sellerId: session.userId });
    if (existingStore) {
      return NextResponse.json(
        { error: "You have already submitted a store application.", store: existingStore },
        { status: 409 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      phone,
      whatsappPhone,
      area,
      pickupAddress,
      landmark,
      businessType = "INDIVIDUAL",
      ghanaCardNumber,
      businessRegistrationNumber,
      payoutProvider = "MTN_MOMO",
      payoutAccountNumber,
      payoutAccountName,
      supportsLocalDelivery = true,
      prepTimeMinutes = 30,
    } = body;

    if (!name || !phone || !area || !pickupAddress || !ghanaCardNumber || !payoutAccountNumber || !payoutAccountName) {
      return NextResponse.json(
        { error: "Please complete all required fields including pickup address, Ghana Card, and MoMo payout details." },
        { status: 400 }
      );
    }

    // Validate Ghana Card format: GHA-XXXXXXXXX-X
    const ghanaCardClean = ghanaCardNumber.trim().toUpperCase();
    const cardRegex = /^GHA-[0-9]{9}-[0-9]$/;
    if (!cardRegex.test(ghanaCardClean)) {
      return NextResponse.json(
        { error: "Invalid Ghana Card format. Expected format: GHA-123456789-1" },
        { status: 400 }
      );
    }

    // Resolve geographic coordinates from Tamale area
    const areaInfo = getTamaleAreaByName(area);
    const coordinates: [number, number] = areaInfo ? areaInfo.coordinates : [-0.8400, 9.4070]; // Default Tamale Central

    // Generate unique slug
    let slug = generateSlug(name);
    const slugExists = await Store.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Create Store in PENDING verification status
    const store = await Store.create({
      sellerId: session.userId,
      name: name.trim(),
      slug,
      description: description?.trim(),
      phone: phone.trim(),
      whatsappPhone: whatsappPhone?.trim(),
      verificationStatus: "PENDING",
      businessType,
      ghanaCardNumber: ghanaCardClean,
      businessRegistrationNumber: businessRegistrationNumber?.trim(),
      payoutInfo: {
        provider: payoutProvider,
        accountNumber: payoutAccountNumber.trim(),
        accountName: payoutAccountName.trim(),
      },
      location: {
        type: "Point",
        coordinates,
      },
      address: {
        region: "Northern Region",
        city: "Tamale",
        area,
        pickupAddress: pickupAddress.trim(),
        landmark: landmark?.trim(),
      },
      deliverySettings: {
        supportsLocalDelivery,
        prepTimeMinutes: Number(prepTimeMinutes) || 30,
      },
    });

    // Upgrade user role to SELLER if currently CUSTOMER
    await User.findByIdAndUpdate(session.userId, {
      role: "SELLER",
    });

    return NextResponse.json({
      success: true,
      message: "Your store application has been submitted for verification!",
      store,
    });
  } catch (error) {
    console.error("Store application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit store application. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH: Update store settings
export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectToDatabase();
    const store = await Store.findOne({ sellerId: session.userId });

    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const body = await req.json();
    const {
      description,
      logoUrl,
      bannerUrl,
      whatsappPhone,
      prepTimeMinutes,
      supportsLocalDelivery,
      operatingHours,
    } = body;

    if (description !== undefined) store.description = description;
    if (logoUrl !== undefined) store.logoUrl = logoUrl;
    if (bannerUrl !== undefined) store.bannerUrl = bannerUrl;
    if (whatsappPhone !== undefined) store.whatsappPhone = whatsappPhone;
    if (prepTimeMinutes !== undefined) store.deliverySettings.prepTimeMinutes = Number(prepTimeMinutes);
    if (supportsLocalDelivery !== undefined) store.deliverySettings.supportsLocalDelivery = Boolean(supportsLocalDelivery);
    if (operatingHours !== undefined) store.deliverySettings.operatingHours = operatingHours;

    await store.save();

    return NextResponse.json({ success: true, message: "Store updated successfully.", store });
  } catch (error) {
    console.error("Store update error:", error);
    return NextResponse.json({ error: "Failed to update store settings." }, { status: 500 });
  }
}
