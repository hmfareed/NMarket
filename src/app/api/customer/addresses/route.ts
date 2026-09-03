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
      landmark,
      deliveryInstructions,
      isDefault = false,
    } = body;

    if (!recipient || !phone || !area || !pickupAddress) {
      return NextResponse.json(
        { error: "Recipient name, phone, area, and delivery address are required." },
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

    user.addresses.push({
      label,
      recipient: recipient.trim(),
      phone: phone.trim(),
      region: "Northern Region",
      city: "Tamale",
      area: area.trim(),
      landmark: landmark?.trim(),
      deliveryInstructions: deliveryInstructions?.trim(),
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address saved successfully!",
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
