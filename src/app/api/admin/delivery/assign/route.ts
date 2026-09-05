import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Delivery } from "@/models/Delivery";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Activity } from "@/models/Activity";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];
    if (!session || !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { deliveryId, riderId, notes } = body;

    if (!deliveryId || !riderId) {
      return NextResponse.json(
        { error: "Delivery ID and Rider ID are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return NextResponse.json({ error: "Delivery job not found." }, { status: 404 });
    }

    const rider = await User.findOne({ _id: riderId, role: "RIDER" });
    if (!rider) {
      return NextResponse.json({ error: "Selected rider partner not found." }, { status: 404 });
    }

    const riderName =
      `${rider.customerProfile?.firstName || ""} ${rider.customerProfile?.lastName || ""}`.trim() ||
      "Rider";

    // Update delivery
    delivery.riderId = rider._id;
    if (delivery.status === "PENDING_DISPATCH") {
      delivery.status = "ACCEPTED";
    }
    delivery.assignedAt = new Date();
    if (notes) {
      delivery.notes = notes;
    }
    await delivery.save();

    // Update associated Order
    const order = await Order.findById(delivery.orderId);
    if (order) {
      order.assignedRiderId = rider._id;
      const subOrder = order.sellerOrders?.find(
        (so) => so.sellerOrderId === delivery.sellerOrderId
      );
      if (subOrder && subOrder.status === "PENDING") {
        subOrder.status = "PROCESSING";
      }
      await order.save();
    }

    // Log Activity in Operations Feed
    try {
      await Activity.create({
        type: "ORDER_DELIVERY_ASSIGNED",
        category: "ORDERS",
        title: `Rider Assigned: ${delivery.orderNumber}`,
        description: `Dispatched rider ${riderName} (${rider.phone}) to deliver order ${delivery.orderNumber} to ${delivery.dropoffLocation.area}.`,
        entityId: delivery._id.toString(),
        entityType: "DELIVERY",
        actorName: session.email,
        actorRole: session.role,
        metadata: {
          orderNumber: delivery.orderNumber,
          riderName,
          riderPhone: rider.phone,
          dropoffArea: delivery.dropoffLocation.area,
        },
      });
    } catch (actErr) {
      console.error("Non-blocking activity log error:", actErr);
    }

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate("riderId", "customerProfile riderProfile phone email")
      .populate("orderId", "orderNumber status payment totalAmount")
      .lean();

    return NextResponse.json({
      success: true,
      message: `Delivery successfully dispatched to ${riderName}.`,
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error("Admin assign delivery error:", error);
    return NextResponse.json(
      { error: "Failed to assign rider to delivery." },
      { status: 500 }
    );
  }
}
