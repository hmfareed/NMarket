import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { coordinates } = body; // Expected: [longitude, latitude]

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates format. Expected [longitude, latitude]." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user || user.role !== "RIDER") {
      return NextResponse.json(
        { error: "Forbidden. Only registered riders can broadcast coordinates." },
        { status: 403 }
      );
    }

    if (!user.riderProfile) {
      user.riderProfile = {
        vehicleType: "MOTORCYCLE",
        operatingZone: "Tamale Central (Zone 1)",
        isOnline: true,
        currentEarnings: 0,
        totalCompletedDeliveries: 0,
        rating: 5.0,
      };
    }

    user.riderProfile.currentLocation = {
      type: "Point",
      coordinates: [coordinates[0], coordinates[1]],
      updatedAt: new Date(),
    };

    await user.save();

    return NextResponse.json({
      success: true,
      coordinates: user.riderProfile.currentLocation.coordinates,
      updatedAt: user.riderProfile.currentLocation.updatedAt,
    });
  } catch (error) {
    console.error("Rider location update error:", error);
    return NextResponse.json(
      { error: "Failed to update rider location." },
      { status: 500 }
    );
  }
}
