import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Payout } from "@/models/Payout";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";
import { Delivery } from "@/models/Delivery";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, any> = {};
    if (status && status !== "ALL") {
      query.status = status;
    }

    const payouts = await Payout.find(query).sort({ createdAt: -1 }).lean();

    // Summary counts
    const allPayouts = await Payout.find({}).lean();
    const totalPending = allPayouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalDisbursed = allPayouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payouts,
      summary: {
        totalPending,
        totalDisbursed,
        countPending: allPayouts.filter((p) => p.status === "PENDING").length,
        countDisbursed: allPayouts.filter((p) => p.status === "PAID").length,
      },
    });
  } catch (error) {
    console.error("Fetch payouts error:", error);
    return NextResponse.json({ error: "Failed to fetch payouts." }, { status: 500 });
  }
}

/**
 * Automatically audits completed orders and generates pending payouts for sellers and riders
 */
export async function POST() {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    let createdCount = 0;

    // 1. Audit Seller Sub-Orders that are COMPLETED
    const completedOrders = await Order.find({
      "sellerOrders.status": "COMPLETED",
    }).lean();

    for (const order of completedOrders) {
      for (const so of order.sellerOrders) {
        if (so.status === "COMPLETED") {
          const payoutRef = `PAY-SEL-${so.sellerOrderId}`;
          const existing = await Payout.findOne({ reference: payoutRef });

          if (!existing && so.sellerEarning > 0) {
            const store = await Store.findById(so.storeId);
            await Payout.create({
              recipientType: "SELLER",
              recipientId: so.storeId,
              recipientName: so.storeName,
              momoNetwork: store?.payoutInfo?.provider || "MTN_MOMO",
              momoNumber: store?.payoutInfo?.accountNumber || store?.phone || "0240000000",
              amount: so.sellerEarning,
              status: "PENDING",
              reference: payoutRef,
              relatedOrderNumbers: [order.orderNumber],
              notes: `Settlement for order ${order.orderNumber} (package ${so.sellerOrderId})`,
            });
            createdCount++;
          }
        }
      }
    }

    // 2. Audit Rider Deliveries that are DELIVERED
    const deliveredJobs = await Delivery.find({
      status: "DELIVERED",
      riderId: { $exists: true },
    }).lean();

    for (const del of deliveredJobs) {
      const payoutRef = `PAY-RID-${del._id}`;
      const existing = await Payout.findOne({ reference: payoutRef });

      if (!existing && del.deliveryFee > 0) {
        const rider = await User.findById(del.riderId);
        const riderName = `${rider?.customerProfile?.firstName || ""} ${rider?.customerProfile?.lastName || ""}`.trim() || "Tamale Delivery Rider";

        await Payout.create({
          recipientType: "RIDER",
          recipientId: del.riderId!,
          recipientName: riderName,
          momoNetwork: "MTN_MOMO",
          momoNumber: rider?.phone || "0240000000",
          amount: del.deliveryFee,
          status: "PENDING",
          reference: payoutRef,
          relatedOrderNumbers: [del.orderNumber],
          notes: `Rider payout for delivery of ${del.orderNumber}`,
        });
        createdCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Audit complete. Generated ${createdCount} pending settlements.`,
      createdCount,
    });
  } catch (error) {
    console.error("Generate settlements error:", error);
    return NextResponse.json({ error: "Failed to generate settlements." }, { status: 500 });
  }
}
