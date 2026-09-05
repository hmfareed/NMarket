import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Delivery } from "@/models/Delivery";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];
    if (!session || !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const statusFilter = searchParams.get("status") || "ALL";

    // Step 1: Auto-sync deliveries from paid/processing orders
    const pendingOrders = await Order.find({
      status: { $in: ["PAID", "PROCESSING", "PARTIALLY_FULFILLED"] },
    }).lean();

    for (const order of pendingOrders) {
      if (!order.sellerOrders || order.sellerOrders.length === 0) continue;

      for (const so of order.sellerOrders) {
        const existing = await Delivery.findOne({
          orderId: order._id,
          sellerOrderId: so.sellerOrderId,
        });

        if (!existing) {
          const store = await Store.findById(so.storeId).lean();
          await Delivery.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            sellerOrderId: so.sellerOrderId,
            pickupLocation: {
              storeName: so.storeName || store?.name || "Merchant Store",
              area: store?.address?.area || "Tamale Central",
              address: store?.address?.pickupAddress || "Central Market",
              phone: store?.phone || "0241234567",
              coordinates: store?.location?.coordinates,
            },
            dropoffLocation: {
              recipient: order.shippingAddress.recipient,
              phone: order.shippingAddress.phone,
              area: order.shippingAddress.area,
              address: order.shippingAddress.streetAddress || order.shippingAddress.area,
              landmark: order.shippingAddress.landmark,
              deliveryInstructions: order.shippingAddress.deliveryInstructions,
              coordinates: order.shippingAddress.location?.coordinates,
            },
            status: "PENDING_DISPATCH",
            deliveryFee: so.deliveryFee || 10,
            deliveryOtp: order.deliveryOtp || "1234",
          });
        }
      }
    }

    // Step 2: Query All Deliveries with Populated Rider and Order
    const deliveriesQuery = Delivery.find()
      .populate("riderId", "customerProfile riderProfile phone email")
      .populate("orderId", "orderNumber status payment totalAmount")
      .sort({ createdAt: -1 });

    const allDeliveries = await deliveriesQuery.lean();

    // Step 3: Calculate Aggregate Statistics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const stats = {
      activeDeliveries: allDeliveries.filter((d) => ["ACCEPTED", "PICKED_UP"].includes(d.status)).length,
      pendingPickups: allDeliveries.filter((d) => d.status === "PENDING_DISPATCH").length,
      deliveredToday: allDeliveries.filter((d) => {
        if (d.status !== "DELIVERED") return false;
        const finishTime = d.deliveredAt ? new Date(d.deliveredAt) : new Date(d.updatedAt);
        return finishTime >= startOfToday;
      }).length,
      cancelledCount: allDeliveries.filter((d) => ["FAILED", "CANCELLED"].includes(d.status)).length,
      totalDeliveries: allDeliveries.length,
    };

    // Step 4: Query Registered Fleet Riders
    const riderUsers = await User.find({ role: "RIDER" })
      .select("customerProfile riderProfile phone email status createdAt")
      .lean();

    // Map riders with active job status
    const riders = riderUsers.map((rider) => {
      const activeJob = allDeliveries.find(
        (d) =>
          d.riderId &&
          (d.riderId as any)._id?.toString() === rider._id.toString() &&
          ["ACCEPTED", "PICKED_UP"].includes(d.status)
      );

      const name = `${rider.customerProfile?.firstName || ""} ${rider.customerProfile?.lastName || ""}`.trim() || "Rider Partner";

      return {
        _id: rider._id.toString(),
        name,
        phone: rider.phone,
        email: rider.email,
        isOnline: rider.riderProfile?.isOnline ?? false,
        vehicleType: rider.riderProfile?.vehicleType || "MOTORCYCLE",
        licensePlate: rider.riderProfile?.licensePlate || "Pending",
        operatingZone: rider.riderProfile?.operatingZone || "Tamale Central (Zone 1)",
        rating: rider.riderProfile?.rating || 5.0,
        totalCompletedDeliveries: rider.riderProfile?.totalCompletedDeliveries || 0,
        currentEarnings: rider.riderProfile?.currentEarnings || 0,
        activeJobId: activeJob?._id?.toString() || null,
        activeOrderNumber: activeJob?.orderNumber || null,
      };
    });

    const fleetStats = {
      ...stats,
      onlineRidersCount: riders.filter((r) => r.isOnline).length,
      totalRidersCount: riders.length,
    };

    // Step 5: Filter Deliveries for the Table
    let filteredDeliveries = allDeliveries;

    if (statusFilter !== "ALL") {
      filteredDeliveries = filteredDeliveries.filter((d) => d.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      filteredDeliveries = filteredDeliveries.filter((d) => {
        const orderNumMatch = d.orderNumber?.toLowerCase().includes(q);
        const recipientMatch = d.dropoffLocation?.recipient?.toLowerCase().includes(q);
        const areaMatch = d.dropoffLocation?.area?.toLowerCase().includes(q);
        const storeMatch = d.pickupLocation?.storeName?.toLowerCase().includes(q);
        const riderNameMatch =
          d.riderId &&
          `${(d.riderId as any).customerProfile?.firstName || ""} ${(d.riderId as any).customerProfile?.lastName || ""}`
            .toLowerCase()
            .includes(q);
        return orderNumMatch || recipientMatch || areaMatch || storeMatch || riderNameMatch;
      });
    }

    return NextResponse.json({
      deliveries: filteredDeliveries,
      riders,
      stats: fleetStats,
    });
  } catch (error) {
    console.error("Admin delivery API error:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries." }, { status: 500 });
  }
}
