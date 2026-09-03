import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";
import { Order } from "@/models/Order";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    await connectToDatabase();

    const transaction = await Transaction.findOne({ providerReference: reference });
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({
        status: "SUCCESS",
        isPaid: true,
        orderId: transaction.orderId,
      });
    }

    // Verify with gateway if still pending
    const verifyRes = await verifyPaystackTransaction(reference);
    if (verifyRes.success && verifyRes.data?.status === "success") {
      transaction.status = "SUCCESS";
      transaction.verifiedAt = new Date();
      transaction.gatewayResponse = verifyRes.data;
      await transaction.save();

      const order = await Order.findById(transaction.orderId);
      if (order && order.status !== "PAID" && order.status !== "COMPLETED") {
        order.status = "PAID";
        order.payment.status = "SUCCESS";
        await order.save();
      }

      return NextResponse.json({
        status: "SUCCESS",
        isPaid: true,
        orderId: transaction.orderId,
      });
    }

    return NextResponse.json({
      status: transaction.status,
      isPaid: false,
      orderId: transaction.orderId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Failed to verify payment." }, { status: 500 });
  }
}
