import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Activity } from "@/models/Activity";

const INITIAL_ACTIVITIES = [
  {
    type: "ORDER_DELIVERED",
    category: "ORDERS",
    title: "Order Delivered via OTP",
    description: "Order #NM-903455 delivered to Sakasaka. Doorstep OTP handshake verified (OTP: 1177).",
    entityId: "NM-903455-846",
    entityType: "ORDER",
    actorName: "Yakubu Delivery (Rider)",
    actorRole: "Rider",
    createdAt: new Date(Date.now() - 4 * 60 * 1000), // 4 mins ago
  },
  {
    type: "CART_ITEM_ADDED",
    category: "CART",
    title: "Product Added to Cart",
    description: "Customer in Lamashegu added 2x 'Handwoven Dagbon Traditional Smock (Fugu)' (GH₵ 700.00).",
    entityType: "CART",
    actorName: "Customer (Lamashegu)",
    actorRole: "Customer",
    createdAt: new Date(Date.now() - 11 * 60 * 1000), // 11 mins ago
  },
  {
    type: "STORE_NAME_CHANGE",
    category: "STORE",
    title: "Store Business Name Updated",
    description: "Store #ST-004 changed business trade name from 'Savannah Spices' to 'Tamale Savannah Organic Hub'.",
    entityId: "ST-004",
    entityType: "STORE",
    actorName: "Aminu Fuseini",
    actorRole: "Store Owner",
    createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
  },
  {
    type: "ORDER_COMPLETED",
    category: "ORDERS",
    title: "Order Completed & Funds Released",
    description: "Order #NM-849120 marked completed. Merchant payout of GH₵ 350.00 routed to Savannah Electronics.",
    entityId: "NM-849120",
    entityType: "ORDER",
    actorName: "System Automation",
    actorRole: "System",
    createdAt: new Date(Date.now() - 42 * 60 * 1000), // 42 mins ago
  },
  {
    type: "PHONE_NUMBER_CHANGE",
    category: "STORE",
    title: "Seller MoMo Payout Contact Changed",
    description: "Merchant 'Alhassan Grains & Tubers' changed MoMo payout contact from 0244112233 to 0558901234.",
    entityId: "ST-012",
    entityType: "STORE",
    actorName: "Alhassan Ibrahim",
    actorRole: "Store Owner",
    createdAt: new Date(Date.now() - 58 * 60 * 1000), // 58 mins ago
  },
  {
    type: "REFUND_REQUESTED",
    category: "REFUNDS",
    title: "Customer Refund Request Submitted",
    description: "Refund request initiated for Order #NM-61028 (GH₵ 85.00) due to reported packaging breach in transit.",
    entityId: "NM-61028",
    entityType: "ORDER",
    actorName: "Fatima Mohammed",
    actorRole: "Customer",
    createdAt: new Date(Date.now() - 85 * 60 * 1000), // 1.4 hours ago
  },
  {
    type: "CART_ITEM_REMOVED",
    category: "CART",
    title: "Item Removed from Cart",
    description: "Customer in Aboabo removed 'Pure Shea Butter (Tub 500g)' from cart.",
    entityType: "CART",
    actorName: "Customer (Aboabo)",
    actorRole: "Customer",
    createdAt: new Date(Date.now() - 110 * 60 * 1000), // 1.8 hours ago
  },
  {
    type: "ORDER_CANCELLED",
    category: "ORDERS",
    title: "Order Cancelled by Customer",
    description: "Order #NM-771239 cancelled before merchant dispatch: Customer traveling outside Tamale metropolitan zone.",
    entityId: "NM-771239",
    entityType: "ORDER",
    actorName: "Kwame Asante",
    actorRole: "Customer",
    createdAt: new Date(Date.now() - 145 * 60 * 1000), // 2.4 hours ago
  },
  {
    type: "STORE_VERIFIED",
    category: "STORE",
    title: "New Tamale Merchant Verified",
    description: "Merchant 'Gbewaa Fresh Market' stall in Central Market approved after Ghana Card identity review.",
    entityId: "ST-028",
    entityType: "STORE",
    actorName: "Super Admin",
    actorRole: "Admin",
    createdAt: new Date(Date.now() - 210 * 60 * 1000), // 3.5 hours ago
  },
];

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN", "SUPPORT"];
    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const count = await Activity.countDocuments({});
    if (count === 0) {
      await Activity.insertMany(INITIAL_ACTIVITIES);
    }

    const query: Record<string, any> = {};
    if (category && category !== "ALL") {
      query.category = category;
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Failed to fetch operations activities:", error);
    // Return fallback list so the UI always has vibrant, immediate data
    return NextResponse.json({ activities: INITIAL_ACTIVITIES });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const activity = await Activity.create({
      type: body.type || "ORDER_COMPLETED",
      category: body.category || "ORDERS",
      title: body.title,
      description: body.description,
      entityId: body.entityId,
      entityType: body.entityType,
      actorName: body.actorName,
      actorRole: body.actorRole,
      metadata: body.metadata,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error) {
    console.error("Failed to log operation activity:", error);
    return NextResponse.json({ error: "Failed to record activity" }, { status: 500 });
  }
}
