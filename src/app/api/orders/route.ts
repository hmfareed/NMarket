import { NextResponse } from "next/server";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order, ISellerOrder, IOrderItem } from "@/models/Order";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";
import { reserveCartStock } from "@/lib/inventory-reservation";
import { calculateTamaleDeliveryFee } from "@/lib/delivery-fee";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to complete checkout." }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const {
      items,
      shippingAddress,
      paymentMethod = "MOBILE_MONEY",
      momoPhone,
      momoNetwork = "MTN_MOMO",
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.recipient || !shippingAddress.phone || !shippingAddress.area) {
      return NextResponse.json({ error: "Please provide complete recipient details and delivery area in Tamale." }, { status: 400 });
    }

    // Step 1: Pre-fetch and validate products from database
    const productIds = items.map((i: { productId: string }) => i.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products in your cart are no longer available." }, { status: 400 });
    }

    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    // Step 2: Atomic Concurrency-Safe Stock Reservation
    const reservationItems = items.map((i: { productId: string; quantity: number }) => ({
      productId: i.productId,
      quantity: Math.max(1, Number(i.quantity) || 1),
    }));

    const reservationResult = await reserveCartStock(reservationItems);
    if (!reservationResult.success) {
      return NextResponse.json({ error: reservationResult.error }, { status: 409 });
    }

    // Step 3: Multi-Seller Grouping & Splitting
    // Group line items by storeId
    const storeItemMap = new Map<string, { items: IOrderItem[]; storeId: mongoose.Types.ObjectId; subtotal: number }>();

    for (const item of items) {
      const dbProd = productMap.get(item.productId)!;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = dbProd.price * qty;
      const storeKey = dbProd.storeId.toString();

      if (!storeItemMap.has(storeKey)) {
        storeItemMap.set(storeKey, {
          items: [],
          storeId: dbProd.storeId,
          subtotal: 0,
        });
      }

      const entry = storeItemMap.get(storeKey)!;
      entry.items.push({
        productId: dbProd._id,
        name: dbProd.name,
        unitPrice: dbProd.price,
        quantity: qty,
        totalPrice: lineTotal,
        imageUrl: dbProd.images?.[0]?.url,
      });
      entry.subtotal += lineTotal;
    }

    // Step 4: Fetch store details for the seller orders
    const storeIds = Array.from(storeItemMap.keys());
    const stores = await Store.find({ _id: { $in: storeIds } });
    const storeDetailMap = new Map(stores.map((s) => [s._id.toString(), s]));

    // Step 5: Delivery Fee Calculation for Tamale
    const deliveryCalc = calculateTamaleDeliveryFee({
      destinationArea: shippingAddress.area,
      uniqueSellerCount: storeIds.length,
    });

    // Step 6: Construct Split Seller Orders
    let totalProductAmount = 0;
    const sellerOrders: ISellerOrder[] = [];
    const baseDeliveryPerStore = Math.round((deliveryCalc.totalDeliveryFee / storeIds.length) * 100) / 100;

    let index = 0;
    for (const [storeIdStr, data] of storeItemMap.entries()) {
      const store = storeDetailMap.get(storeIdStr)!;
      totalProductAmount += data.subtotal;

      const orderSuffix = String.fromCharCode(65 + index); // A, B, C...
      index++;

      // Platform commission: e.g. 5% for local pilot
      const commissionAmount = Math.round(data.subtotal * 0.05 * 100) / 100;
      const sellerEarning = data.subtotal - commissionAmount;

      sellerOrders.push({
        sellerOrderId: `NM-${Date.now().toString().slice(-5)}-${orderSuffix}`,
        storeId: store._id,
        storeName: store.name,
        sellerId: store.sellerId,
        status: "PENDING",
        items: data.items,
        subtotal: data.subtotal,
        deliveryFee: baseDeliveryPerStore,
        commissionAmount,
        sellerEarning,
        prepTimeMinutes: store.deliverySettings?.prepTimeMinutes || 30,
      });
    }

    const totalAmount = totalProductAmount + deliveryCalc.totalDeliveryFee;

    // Step 7: Generate 4-digit Delivery OTP Guard
    const deliveryOtp = crypto.randomInt(1000, 10000).toString();

    // Step 8: Order Number Generation
    const orderNumber = `NM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Step 9: Save Parent Order
    const order = await Order.create({
      orderNumber,
      customerId: session.userId,
      deliveryOtp,
      fulfillmentType: "LOCAL_DELIVERY",
      status: "PAID",
      payment: {
        provider: momoNetwork,
        providerReference: `MOMO-REF-${Date.now()}`,
        method: paymentMethod,
        amount: totalAmount,
        currency: "GHS",
        status: "SUCCESS",
        verifiedAt: new Date(),
      },
      shippingAddress: {
        recipient: shippingAddress.recipient.trim(),
        phone: shippingAddress.phone.trim(),
        region: "Northern Region",
        city: "Tamale",
        area: shippingAddress.area,
        streetAddress: (shippingAddress.pickupAddress || shippingAddress.streetAddress)?.trim(),
        landmark: shippingAddress.landmark?.trim(),
        deliveryInstructions: shippingAddress.deliveryInstructions?.trim(),
      },
      sellerOrders,
      totalProductAmount,
      totalDeliveryFee: deliveryCalc.totalDeliveryFee,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderId: order._id,
      orderNumber: order.orderNumber,
      deliveryOtp: order.deliveryOtp,
      totalAmount: order.totalAmount,
      sellerOrderCount: sellerOrders.length,
    });
  } catch (error) {
    console.error("Order checkout error:", error);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({ customerId: session.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Customer orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
