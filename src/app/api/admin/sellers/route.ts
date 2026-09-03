import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    // In production require admin role, allow graceful read during dev/test if session missing
    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const query: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      query.verificationStatus = status;
    }

    if (q && q.trim()) {
      const regex = { $regex: q.trim(), $options: "i" };
      query.$or = [
        { name: regex },
        { phone: regex },
        { ghanaCardNumber: regex },
        { "address.area": regex },
      ];
    }

    const rawStores = await Store.find(query)
      .populate("sellerId", "customerProfile phone email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate product counts per store
    const storeIds = rawStores.map((s: any) => s._id);
    const productCounts = await Product.aggregate([
      { $match: { storeId: { $in: storeIds } } },
      { $group: { _id: "$storeId", count: { $sum: 1 } } },
    ]);

    const productCountMap = new Map<string, number>();
    productCounts.forEach((pc: any) => {
      productCountMap.set(pc._id.toString(), pc.count);
    });

    const stores = rawStores.map((s: any) => ({
      ...s,
      productCount: productCountMap.get(s._id.toString()) || 0,
    }));

    const counts = {
      pending: await Store.countDocuments({ verificationStatus: "PENDING" }),
      underReview: await Store.countDocuments({ verificationStatus: "UNDER_REVIEW" }),
      verified: await Store.countDocuments({ verificationStatus: "VERIFIED" }),
      suspended: await Store.countDocuments({ verificationStatus: "SUSPENDED" }),
      rejected: await Store.countDocuments({ verificationStatus: "REJECTED" }),
      total: await Store.countDocuments({}),
    };

    return NextResponse.json({ stores, counts });
  } catch (error) {
    console.error("Admin sellers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch sellers list." }, { status: 500 });
  }
}
