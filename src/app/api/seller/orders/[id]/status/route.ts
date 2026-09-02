import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id: parentOrderId } = await params;
    const body = await req.json();
    const { status, sellerOrderId } = body;

    const validStatuses = [
      "ACCEPTED",
      "PROCESSING",
      "READY_FOR_PICKUP",
      "HANDED_TO_RIDER",
      "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status update." }, { status: 400 });
    }

    await connectToDatabase();
    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const order = await Order.findById(parentOrderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Find the specific sub-order belonging to this store
    const subOrder = order.sellerOrders.find(
      (so) =>
        so.storeId.toString() === store._id.toString() ||
        (sellerOrderId && so.sellerOrderId === sellerOrderId)
    );

    if (!subOrder) {
      return NextResponse.json({ error: "Unauthorized: You do not own this sub-order." }, { status: 403 });
    }

    subOrder.status = status;

    // Check if all sub-orders are ready or completed to advance parent status
    const allReady = order.sellerOrders.every((so) =>
      ["READY_FOR_PICKUP", "HANDED_TO_RIDER", "COMPLETED"].includes(so.status)
    );
    if (allReady && order.status === "PAID") {
      order.status = "PROCESSING";
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}.`,
      subOrder,
    });
  } catch (error) {
    console.error("Seller order status update error:", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
