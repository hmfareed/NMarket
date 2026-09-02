import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Query orders containing this store
    const orders = await Order.find({ "sellerOrders.storeId": store._id })
      .sort({ createdAt: -1 })
      .lean();

    // Map to flatten merchant's specific sub-order view
    const sellerOrdersList = orders.map((order) => {
      const mySubOrder = order.sellerOrders.find(
        (so) => so.storeId.toString() === store._id.toString()
      );

      return {
        parentOrderId: order._id,
        orderNumber: order.orderNumber,
        sellerOrderId: mySubOrder?.sellerOrderId,
        status: mySubOrder?.status,
        items: mySubOrder?.items || [],
        subtotal: mySubOrder?.subtotal || 0,
        sellerEarning: mySubOrder?.sellerEarning || 0,
        prepTimeMinutes: mySubOrder?.prepTimeMinutes || 30,
        customerName: order.shippingAddress.recipient,
        customerPhone: order.shippingAddress.phone,
        destinationArea: order.shippingAddress.area,
        deliveryInstructions: order.shippingAddress.deliveryInstructions,
        orderPlacedAt: order.createdAt,
      };
    });

    const filtered = status && status !== "ALL"
      ? sellerOrdersList.filter((so) => so.status === status)
      : sellerOrdersList;

    const counts = {
      all: sellerOrdersList.length,
      pending: sellerOrdersList.filter((so) => so.status === "PENDING").length,
      processing: sellerOrdersList.filter((so) => so.status === "PROCESSING" || so.status === "ACCEPTED").length,
      ready: sellerOrdersList.filter((so) => so.status === "READY_FOR_PICKUP").length,
      completed: sellerOrdersList.filter((so) => so.status === "COMPLETED" || so.status === "HANDED_TO_RIDER").length,
    };

    return NextResponse.json({ orders: filtered, counts });
  } catch (error) {
    console.error("Seller orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch seller orders." }, { status: 500 });
  }
}
