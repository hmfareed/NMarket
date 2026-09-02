import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Delivery } from "@/models/Delivery";
import { Order } from "@/models/Order";

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

    const delivery = await Delivery.findOne({
      _id: id,
      riderId: session.userId,
      status: "ACCEPTED",
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found or not in accepted state." },
        { status: 404 }
      );
    }

    delivery.status = "PICKED_UP";
    delivery.pickedUpAt = new Date();
    await delivery.save();

    // Update parent order suborder status to HANDED_TO_RIDER
    const order = await Order.findById(delivery.orderId);
    if (order) {
      const subOrder = order.sellerOrders.find(
        (so) => so.sellerOrderId === delivery.sellerOrderId
      );
      if (subOrder) {
        subOrder.status = "HANDED_TO_RIDER";
        await order.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Package marked as picked up from store. Head to customer destination.",
      delivery,
    });
  } catch (error) {
    console.error("Pickup delivery error:", error);
    return NextResponse.json({ error: "Failed to confirm pickup." }, { status: 500 });
  }
}
