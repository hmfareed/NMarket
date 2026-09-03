import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Dispute } from "@/models/Dispute";
import { Store } from "@/models/Store";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"].includes(session.role)
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

    const disputes = await Dispute.find(query).sort({ createdAt: -1 }).lean();

    // Populate store names
    const storeIds = disputes.map((d) => d.storeId);
    const stores = await Store.find({ _id: { $in: storeIds } }).lean();
    const storeMap = new Map(stores.map((s) => [s._id.toString(), s.name]));

    const enrichedDisputes = disputes.map((d) => ({
      ...d,
      storeName: storeMap.get(d.storeId?.toString()) || "Tamale Merchant",
    }));

    const counts = {
      all: await Dispute.countDocuments({}),
      open: await Dispute.countDocuments({ status: "OPEN" }),
      underReview: await Dispute.countDocuments({ status: "UNDER_REVIEW" }),
      resolved: await Dispute.countDocuments({
        status: { $in: ["RESOLVED_REFUND", "RESOLVED_REPLACEMENT", "RESOLVED_NO_ACTION"] },
      }),
      rejected: await Dispute.countDocuments({ status: "REJECTED" }),
    };

    return NextResponse.json({ disputes: enrichedDisputes, counts });
  } catch (error) {
    console.error("Admin disputes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch disputes." }, { status: 500 });
  }
}
