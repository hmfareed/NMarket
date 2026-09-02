import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";
import { User } from "@/models/User";
import { Delivery } from "@/models/Delivery";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    // 1. Order Aggregations
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

    let totalGmv = 0;
    let totalCommission = 0;
    let totalDeliveryFees = 0;

    const orderStatusCounts = {
      PAID: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const order of orders) {
      totalGmv += order.totalAmount || 0;
      totalDeliveryFees += order.totalDeliveryFee || 0;

      if (order.status in orderStatusCounts) {
        orderStatusCounts[order.status as keyof typeof orderStatusCounts]++;
      }

      for (const so of order.sellerOrders) {
        totalCommission += so.commissionAmount || 0;
      }
    }

    // 2. Store Counts
    const verifiedStoresCount = await Store.countDocuments({ status: "VERIFIED" });
    const pendingStoresCount = await Store.countDocuments({ status: "PENDING" });

    // 3. Rider Fleet Counts
    const totalRiders = await User.countDocuments({ role: "RIDER" });
    const onlineRiders = await User.countDocuments({
      role: "RIDER",
      "riderProfile.isOnline": true,
    });

    // 4. Completed Deliveries
    const completedDeliveries = await Delivery.countDocuments({ status: "DELIVERED" });

    // 5. Recent 5 Orders
    const recentOrders = orders.slice(0, 5).map((o) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      customerName: o.shippingAddress?.recipient,
      area: o.shippingAddress?.area,
      totalAmount: o.totalAmount,
      status: o.status,
      sellerOrderCount: o.sellerOrders?.length || 1,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      metrics: {
        totalGmv,
        totalCommission,
        totalDeliveryFees,
        totalOrders: orders.length,
        orderStatusCounts,
        verifiedStoresCount,
        pendingStoresCount,
        totalRiders,
        onlineRiders,
        completedDeliveries,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Admin metrics fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch admin operations metrics." }, { status: 500 });
  }
}
