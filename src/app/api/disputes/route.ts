import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Dispute } from "@/models/Dispute";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to submit a dispute." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, sellerOrderId, reason, description } = body;

    const validReasons = ["WRONG_ITEM", "DAMAGED", "MISSING_ITEM", "LATE_DELIVERY", "OTHER"];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json({ error: "Please select a valid dispute reason." }, { status: 400 });
    }

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return NextResponse.json({ error: "Please provide a description of the issue (at least 5 characters)." }, { status: 400 });
    }

    await connectToDatabase();

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
      _id: orderId,
      customerId: session.userId,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Determine the relevant storeId
    let storeId = order.sellerOrders[0]?.storeId;
    if (sellerOrderId) {
      const match = order.sellerOrders.find((so) => so.sellerOrderId === sellerOrderId);
      if (match) storeId = match.storeId;
    }

    const user = await User.findById(session.userId);
    const customerName =
      `${user?.customerProfile?.firstName || ""} ${user?.customerProfile?.lastName || ""}`.trim() ||
      user?.phone ||
      "Customer";

    const disputeNumber = `DSP-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;

    const dispute = await Dispute.create({
      disputeNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      sellerOrderId,
      storeId,
      customerId: session.userId,
      customerName,
      customerPhone: user?.phone || order.shippingAddress.phone,
      reason,
      description: description.trim(),
      status: "OPEN",
    });

    return NextResponse.json({
      success: true,
      message: "Dispute submitted successfully. Our operations team will investigate.",
      dispute,
    });
  } catch (error) {
    console.error("Submit dispute error:", error);
    return NextResponse.json({ error: "Failed to submit dispute." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const disputes = await Dispute.find({ customerId: session.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("Customer disputes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch disputes." }, { status: 500 });
  }
}
