import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";
import "@/models/Store";
import "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("customerId", "customerProfile phone email")
      .populate("assignedRiderId", "riderProfile phone")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin order get error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, assignedRiderId, cancelReason } = body;

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status) {
      order.status = status as any;
      if (status === "DELIVERED" || status === "COMPLETED") {
        order.deliveredAt = new Date();
      }
    }

    if (assignedRiderId) {
      order.assignedRiderId = assignedRiderId;
    }

    if (cancelReason) {
      order.cancelReason = cancelReason;
    }

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Admin order patch error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
