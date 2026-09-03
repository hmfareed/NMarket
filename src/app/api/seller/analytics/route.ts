import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();

    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    // 1. Fetch all orders containing packages for this store
    const orders = await Order.find({
      "sellerOrders.storeId": store._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    let totalRevenue = 0;
    let netEarnings = 0;
    let platformFees = 0;
    let totalOrdersCount = 0;
    let completedOrdersCount = 0;
    let todaySales = 0;
    let todayOrdersCount = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Prepare 7-day revenue trend map
    const sevenDayMap = new Map<string, { revenue: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      sevenDayMap.set(dateKey, { revenue: 0, orders: 0 });
    }

    // Map to track top-selling products
    const productStatsMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    for (const order of orders) {
      for (const so of order.sellerOrders) {
        if (so.storeId.toString() === store._id.toString()) {
          totalOrdersCount++;

          if (so.status !== "CANCELLED") {
            totalRevenue += so.subtotal || 0;
            netEarnings += so.sellerEarning || 0;
            platformFees += so.commissionAmount || 0;

            if (so.status === "COMPLETED") {
              completedOrdersCount++;
            }

            // Check today
            const orderDate = new Date(order.createdAt);
            if (orderDate >= startOfToday) {
              todaySales += so.subtotal || 0;
              todayOrdersCount++;
            }

            // 7-day history aggregation
            const dateKey = orderDate.toISOString().slice(0, 10);
            if (sevenDayMap.has(dateKey)) {
              const current = sevenDayMap.get(dateKey)!;
              current.revenue += so.subtotal || 0;
              current.orders += 1;
            }

            // Product statistics aggregation
            for (const item of so.items) {
              const pid = item.productId.toString();
              const existing = productStatsMap.get(pid) || {
                name: item.name,
                quantity: 0,
                revenue: 0,
              };
              existing.quantity += item.quantity;
              existing.revenue += item.totalPrice;
              productStatsMap.set(pid, existing);
            }
          }
        }
      }
    }

    const fulfillmentRate =
      totalOrdersCount > 0
        ? Math.round((completedOrdersCount / totalOrdersCount) * 100)
        : 100;

    const sevenDayHistory = Array.from(sevenDayMap.entries()).map(
      ([date, data]) => ({
        date,
        dayName: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        revenue: data.revenue,
        orders: data.orders,
      })
    );

    const topProducts = Array.from(productStatsMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 2. Fetch Low-Stock Products for this store
    const allProducts = await Product.find({ storeId: store._id }).lean();
    const lowStockProducts = allProducts
      .filter((p) => {
        const threshold = p.inventory?.lowStockThreshold ?? 2;
        return (p.inventory?.available ?? 0) <= threshold;
      })
      .map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        available: p.inventory.available,
        onHand: p.inventory.onHand,
        reserved: p.inventory.reserved,
        lowStockThreshold: p.inventory.lowStockThreshold || 2,
      }));

    return NextResponse.json({
      summary: {
        totalRevenue,
        netEarnings,
        platformFees,
        totalOrdersCount,
        completedOrdersCount,
        fulfillmentRate,
        todaySales,
        todayOrdersCount,
        storeRating: store.performance?.rating || 5.0,
      },
      sevenDayHistory,
      topProducts,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Seller analytics error:", error);
    return NextResponse.json(
      { error: "Failed to load seller analytics." },
      { status: 500 }
    );
  }
}
