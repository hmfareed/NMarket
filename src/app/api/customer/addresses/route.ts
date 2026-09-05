import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ addresses: user.addresses || [] });
  } catch (error) {
    console.error("Fetch customer addresses error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      label = "Home",
      recipient,
      phone,
      area,
      pickupAddress,
      streetAddress,
      formattedAddress,
      landmark,
      deliveryInstructions,
      location,
      coordinates,
      accuracyMeters,
      region = "Northern Region",
      city = "Tamale",
      isDefault = false,
    } = body;

    const resolvedStreetAddress = streetAddress || pickupAddress || formattedAddress;

    if (!recipient || !phone || !area || !resolvedStreetAddress) {
      return NextResponse.json(
        { error: "Recipient name, phone, area, and street address are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Build location object if coordinates provided
    let locationObj: { type: "Point"; coordinates: [number, number] } | undefined = undefined;
    if (location?.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
      locationObj = {
        type: "Point",
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
      };
    } else if (Array.isArray(coordinates) && coordinates.length === 2) {
      locationObj = {
        type: "Point",
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      };
    }

    const newAddress = {
      label,
      recipient: recipient.trim(),
      phone: phone.trim(),
      region: region || "Northern Region",
      city: city || "Tamale",
      area: area.trim(),
      streetAddress: resolvedStreetAddress.trim(),
      formattedAddress: formattedAddress ? formattedAddress.trim() : resolvedStreetAddress.trim(),
      landmark: landmark?.trim(),
      deliveryInstructions: deliveryInstructions?.trim(),
      location: locationObj,
      accuracyMeters: typeof accuracyMeters === "number" ? accuracyMeters : undefined,
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    const savedAddr = user.addresses[user.addresses.length - 1];

    return NextResponse.json({
      success: true,
      message: "Address saved successfully!",
      address: savedAddr,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Save customer address error:", error);
    return NextResponse.json({ error: "Failed to save address." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id?.toString() !== addressId
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address removed.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Delete customer address error:", error);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}
