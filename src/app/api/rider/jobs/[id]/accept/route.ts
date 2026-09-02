import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Delivery } from "@/models/Delivery";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    // Check if rider already has an active delivery
    const existingActive = await Delivery.findOne({
      riderId: session.userId,
      status: { $in: ["ACCEPTED", "PICKED_UP"] },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: "You already have an active delivery in progress. Complete it first before accepting another." },
        { status: 400 }
      );
    }

    const delivery = await Delivery.findOneAndUpdate(
      { _id: id, status: "PENDING_DISPATCH" },
      {
        riderId: session.userId,
        status: "ACCEPTED",
        assignedAt: new Date(),
      },
      { new: true }
    );

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery job is no longer available or was claimed by another rider." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery job accepted successfully!",
      delivery,
    });
  } catch (error) {
    console.error("Accept delivery job error:", error);
    return NextResponse.json({ error: "Failed to accept delivery job." }, { status: 500 });
  }
}
