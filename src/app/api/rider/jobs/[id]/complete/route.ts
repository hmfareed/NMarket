import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Delivery } from "@/models/Delivery";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { commitReservedStock } from "@/lib/inventory-reservation";
import { sendCustomerDeliveredAlert } from "@/lib/notifications";

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
    const body = await req.json();
    const { otp } = body;

    if (!otp || typeof otp !== "string" || otp.trim().length !== 4) {
      return NextResponse.json(
        { error: "Please enter the 4-digit Delivery OTP provided by the customer." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const delivery = await Delivery.findOne({
      _id: id,
      riderId: session.userId,
      status: { $in: ["ACCEPTED", "PICKED_UP"] },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Active delivery not found for this rider." },
        { status: 404 }
      );
    }

    // Step 1: Secure OTP Verification Handshake
    if (delivery.deliveryOtp.trim() !== otp.trim()) {
      return NextResponse.json(
        { error: "Invalid Delivery OTP. Do not release package without customer's correct 4-digit code." },
        { status: 400 }
      );
    }

    // Step 2: Mark Delivery as Complete
    delivery.status = "DELIVERED";
    delivery.deliveredAt = new Date();
    await delivery.save();

    // Step 3: Credit Rider Wallet & Increment Completed Trips
    const riderUser = await User.findById(session.userId);
    if (riderUser) {
      if (!riderUser.riderProfile) {
        riderUser.riderProfile = {
          vehicleType: "MOTORCYCLE",
          operatingZone: "Tamale Central (Zone 1)",
          isOnline: true,
          currentEarnings: 0,
          totalCompletedDeliveries: 0,
          rating: 5.0,
        };
      }
      riderUser.riderProfile.currentEarnings =
        (riderUser.riderProfile.currentEarnings || 0) + delivery.deliveryFee;
      riderUser.riderProfile.totalCompletedDeliveries =
        (riderUser.riderProfile.totalCompletedDeliveries || 0) + 1;
      await riderUser.save();
    }

    // Step 4: Advance Order & Commit Reserved Stock
    const order = await Order.findById(delivery.orderId);
    if (order) {
      const subOrder = order.sellerOrders.find(
        (so) => so.sellerOrderId === delivery.sellerOrderId
      );

      if (subOrder) {
        subOrder.status = "COMPLETED";

        // Commit stock reservation permanently
        const stockItems = subOrder.items.map((i) => ({
          productId: i.productId.toString(),
          quantity: i.quantity,
        }));
        await commitReservedStock(stockItems);
      }

      // If all suborders are completed, complete parent order
      const allDone = order.sellerOrders.every((so) => so.status === "COMPLETED");
      if (allDone) {
        order.status = "COMPLETED";
      }

      await order.save();

      // Notify customer of successful delivery
      try {
        const customer = await User.findById(order.customerId);
        await sendCustomerDeliveredAlert({
          phone: order.shippingAddress.phone || customer?.phone || "",
          orderNumber: order.orderNumber,
        });
      } catch (custErr) {
        console.error("Non-blocking customer delivery notification error:", custErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Delivery completed successfully! ₵${delivery.deliveryFee.toFixed(2)} has been credited to your rider wallet.`,
      earningsAdded: delivery.deliveryFee,
      delivery,
    });
  } catch (error) {
    console.error("Complete delivery OTP error:", error);
    return NextResponse.json({ error: "Failed to complete delivery." }, { status: 500 });
  }
}
