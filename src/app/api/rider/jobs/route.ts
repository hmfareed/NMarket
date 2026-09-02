import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Delivery } from "@/models/Delivery";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    // Auto-dispatch check: Find orders that have sellerOrders ready for dispatch
    const readyOrders = await Order.find({
      status: { $in: ["PAID", "PROCESSING"] },
    }).lean();

    for (const order of readyOrders) {
      for (const so of order.sellerOrders) {
        // If suborder is ready for pickup or accepted, ensure a delivery job exists
        const existingDelivery = await Delivery.findOne({
          orderId: order._id,
          sellerOrderId: so.sellerOrderId,
        });

        if (!existingDelivery) {
          const store = await Store.findById(so.storeId);
          await Delivery.create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            sellerOrderId: so.sellerOrderId,
            pickupLocation: {
              storeName: so.storeName,
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
            deliveryOtp: order.deliveryOtp, // The 4-digit OTP
          });
        }
      }
    }

    // Fetch available unassigned jobs
    const availableJobs = await Delivery.find({
      status: "PENDING_DISPATCH",
    }).sort({ createdAt: -1 });

    // Fetch rider's active job (if currently delivering)
    const activeJob = await Delivery.findOne({
      riderId: session.userId,
      status: { $in: ["ACCEPTED", "PICKED_UP"] },
    });

    return NextResponse.json({
      availableJobs,
      activeJob,
      count: availableJobs.length,
    });
  } catch (error) {
    console.error("Rider jobs fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery jobs." }, { status: 500 });
  }
}
