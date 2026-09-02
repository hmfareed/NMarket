import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { User } from "@/models/User";
import { Delivery } from "@/models/Delivery";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if rider has an active delivery in progress
    const activeDelivery = await Delivery.findOne({
      riderId: user._id,
      status: { $in: ["ACCEPTED", "PICKED_UP"] },
    });

    return NextResponse.json({
      riderProfile: user.riderProfile || {
        vehicleType: "MOTORCYCLE",
        isOnline: false,
        currentEarnings: 0,
        totalCompletedDeliveries: 0,
        rating: 5.0,
      },
      name: `${user.customerProfile?.firstName || ""} ${user.customerProfile?.lastName || ""}`.trim(),
      phone: user.phone,
      activeDelivery,
    });
  } catch (error) {
    console.error("Rider profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch rider profile." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = await req.json();
    const {
      vehicleType,
      licensePlate,
      ghanaCardNumber,
      operatingZone,
      isOnline,
    } = body;

    if (!user.riderProfile) {
      user.riderProfile = {
        vehicleType: vehicleType || "MOTORCYCLE",
        licensePlate: licensePlate || "",
        ghanaCardNumber: ghanaCardNumber || "",
        operatingZone: operatingZone || "Tamale Central (Zone 1)",
        isOnline: Boolean(isOnline),
        currentEarnings: 0,
        totalCompletedDeliveries: 0,
        rating: 5.0,
      };
    } else {
      if (vehicleType !== undefined) user.riderProfile.vehicleType = vehicleType;
      if (licensePlate !== undefined) user.riderProfile.licensePlate = licensePlate;
      if (ghanaCardNumber !== undefined) user.riderProfile.ghanaCardNumber = ghanaCardNumber;
      if (operatingZone !== undefined) user.riderProfile.operatingZone = operatingZone;
      if (isOnline !== undefined) user.riderProfile.isOnline = Boolean(isOnline);
    }

    if (user.role === "CUSTOMER") {
      user.role = "RIDER";
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Rider profile updated successfully.",
      riderProfile: user.riderProfile,
    });
  } catch (error) {
    console.error("Rider profile update error:", error);
    return NextResponse.json({ error: "Failed to update rider profile." }, { status: 500 });
  }
}
