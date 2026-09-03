import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";
import "@/models/Store";
import "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (q && q.trim()) {
      const regex = { $regex: q.trim(), $options: "i" };
      query.$or = [
        { orderNumber: regex },
        { "shippingAddress.recipient": regex },
        { "shippingAddress.phone": regex },
        { "shippingAddress.area": regex },
      ];
    }

    const rawOrders = await Order.find(query)
      .populate("customerId", "customerProfile phone email")
      .populate("assignedRiderId", "riderProfile phone")
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    // Map to normalized structure for Admin UI
    const orders = rawOrders.map((o: any) => ({
      _id: o._id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      subtotal: o.totalProductAmount || o.totalAmount - (o.totalDeliveryFee || 10),
      deliveryFee: o.totalDeliveryFee || 10,
      status: o.status,
      paymentStatus: o.payment?.status || "SUCCESS",
      customerSnapshot: {
        name: o.shippingAddress?.recipient || o.customerId?.customerProfile?.fullName || "Tamale Customer",
        phone: o.shippingAddress?.phone || o.customerId?.phone || "024XXXXXXX",
      },
      deliveryAddress: {
        area: o.shippingAddress?.area || "Tamale Central",
        addressText: o.shippingAddress?.streetAddress || o.shippingAddress?.area || "Tamale",
        landmark: o.shippingAddress?.landmark,
        deliveryInstructions: o.shippingAddress?.deliveryInstructions,
      },
      items: (o.sellerOrders || []).flatMap((so: any) =>
        (so.items || []).map((it: any) => ({
          productId: it.productId,
          name: it.name,
          price: it.unitPrice,
          quantity: it.quantity,
          imageUrl: it.imageUrl,
          storeName: so.storeName,
        }))
      ),
      sellerOrders: (o.sellerOrders || []).map((so: any) => ({
        storeId: so.storeId,
        storeName: so.storeName,
        subtotal: so.subtotal,
      })),
      deliveryOtp: {
        code: o.deliveryOtp,
        isVerified: o.status === "COMPLETED" || o.status === "DELIVERED",
      },
      createdAt: o.createdAt,
    }));

    const counts = {
      total: await Order.countDocuments({}),
      pending: await Order.countDocuments({ status: { $in: ["CREATED", "PAYMENT_PENDING", "PENDING"] } }),
      confirmed: await Order.countDocuments({ status: { $in: ["PAID", "CONFIRMED"] } }),
      preparing: await Order.countDocuments({ status: { $in: ["PROCESSING", "PREPARING"] } }),
      pickedUp: await Order.countDocuments({ status: { $in: ["PARTIALLY_FULFILLED", "PICKED_UP"] } }),
      delivered: await Order.countDocuments({ status: { $in: ["COMPLETED", "DELIVERED"] } }),
      cancelled: await Order.countDocuments({ status: { $in: ["CANCELLED", "REFUNDED"] } }),
    };

    return NextResponse.json({ orders, counts });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
