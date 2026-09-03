import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, momoPhone, momoNetwork = "MTN_MOMO" } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({
      _id: orderId,
      customerId: session.userId,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const customer = await User.findById(session.userId);
    const customerEmail = customer?.email || `${customer?.phone || "customer"}@nmarket.gh`;
    const customerPhone = momoPhone || customer?.phone || order.shippingAddress.phone;

    const reference = `NM-PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = `${appUrl}/orders/${order._id}`;

    // 1. Create PENDING Transaction Record in MongoDB
    const transaction = await Transaction.create({
      transactionNumber: `TRX-${Date.now().toString().slice(-6)}`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerId: session.userId,
      amount: order.totalAmount,
      currency: "GHS",
      provider: process.env.PAYSTACK_SECRET_KEY ? "PAYSTACK" : "MOMO_SIMULATOR",
      providerReference: reference,
      paymentMethod: momoNetwork,
      momoNumber: customerPhone,
      status: "PENDING",
    });

    // 2. Initialize Paystack Gateway Intent
    const paymentInit = await initializePaystackTransaction({
      email: customerEmail,
      amount: order.totalAmount,
      reference,
      callbackUrl,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        momoPhone: customerPhone,
        momoNetwork,
        customerId: session.userId,
      },
    });

    if (!paymentInit.success) {
      transaction.status = "FAILED";
      await transaction.save();
      return NextResponse.json(
        { error: paymentInit.error || "Payment initialization failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl: paymentInit.authorizationUrl,
      isSimulated: paymentInit.isSimulated,
      message: paymentInit.isSimulated
        ? "Simulated pilot payment ready for testing."
        : `USSD push prompt sent to ${customerPhone} (${momoNetwork}). Please enter your PIN on your phone.`,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: "Failed to initialize payment." }, { status: 500 });
  }
}
