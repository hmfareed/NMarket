import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";
import { Order } from "@/models/Order";
import { Store } from "@/models/Store";
import { User } from "@/models/User";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import {
  sendCustomerOrderNotification,
  sendMerchantNewOrderAlert,
} from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // 1. Cryptographic HMAC Signature Validation
    const isValid = verifyPaystackWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Invalid Paystack webhook signature rejected.");
      return NextResponse.json({ error: "Invalid cryptographic signature." }, { status: 401 });
    }

    const eventData = JSON.parse(rawBody);
    const { event, data } = eventData;

    await connectToDatabase();

    // 2. Handle Successful Mobile Money Charge
    if (event === "charge.success" || data?.status === "success") {
      const reference = data?.reference;
      if (!reference) {
        return NextResponse.json({ error: "Missing reference." }, { status: 400 });
      }

      const transaction = await Transaction.findOne({ providerReference: reference });
      if (!transaction) {
        console.warn(`Transaction not found for reference: ${reference}`);
        return NextResponse.json({ message: "Transaction reference not found." }, { status: 200 });
      }

      if (transaction.status === "SUCCESS") {
        // Already reconciled
        return NextResponse.json({ message: "Already processed." }, { status: 200 });
      }

      // Mark Transaction Successful
      transaction.status = "SUCCESS";
      transaction.verifiedAt = new Date();
      transaction.gatewayResponse = data;
      await transaction.save();

      // Advance Order to PAID
      const order = await Order.findById(transaction.orderId);
      if (order && order.status !== "PAID" && order.status !== "COMPLETED") {
        order.status = "PAID";
        order.payment.status = "SUCCESS";
        await order.save();

        // Dispatch Customer & Merchant Notifications
        try {
          const customer = await User.findById(order.customerId);
          const allItems = order.sellerOrders.flatMap((so) => so.items);

          await sendCustomerOrderNotification({
            phone: order.shippingAddress.phone || customer?.phone || "",
            email: customer?.email,
            customerName: order.shippingAddress.recipient,
            orderNumber: order.orderNumber,
            deliveryOtp: order.deliveryOtp,
            totalAmount: order.totalAmount,
            area: order.shippingAddress.area,
            items: allItems.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              totalPrice: i.totalPrice,
            })),
          });

          for (const so of order.sellerOrders) {
            const store = await Store.findById(so.storeId);
            if (store?.phone) {
              await sendMerchantNewOrderAlert({
                storeName: so.storeName,
                storePhone: store.phone,
                orderNumber: order.orderNumber,
                itemCount: so.items.length,
                subtotal: so.subtotal,
              });
            }
          }
        } catch (notifErr) {
          console.error("Webhook notification error:", notifErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
