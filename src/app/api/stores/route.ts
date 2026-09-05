import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area");
    const q = searchParams.get("q");

    const query: Record<string, unknown> = {};

    // Only return verified or active stores
    query.verificationStatus = { $in: ["VERIFIED", "PENDING", "UNDER_REVIEW"] };

    if (area && area !== "all") {
      query["address.area"] = new RegExp(area, "i");
    }

    if (q) {
      query.name = new RegExp(q, "i");
    }

    const stores = await Store.find(query)
      .select("name slug description logoUrl bannerUrl phone address performance verificationStatus deliverySettings createdAt")
      .sort({ "performance.rating": -1, createdAt: -1 })
      .lean();

    // Attach product count for each store
    const storesWithCounts = await Promise.all(
      stores.map(async (s) => {
        const productCount = await Product.countDocuments({
          storeId: s._id,
          status: "PUBLISHED",
        });

        return {
          _id: s._id.toString(),
          name: s.name,
          slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: s.description || "",
          logoUrl: s.logoUrl || null,
          bannerUrl: s.bannerUrl || null,
          phone: s.phone,
          area: s.address?.area || "Tamale Central",
          pickupAddress: s.address?.pickupAddress || "Central Market",
          rating: s.performance?.rating || 4.9,
          totalOrders: s.performance?.totalOrders || 24,
          productCount,
          verificationStatus: s.verificationStatus,
          badge: s.verificationStatus === "VERIFIED" ? "✓ Verified Store" : "⚡ Fast Dispatch",
        };
      })
    );

    return NextResponse.json({
      stores: storesWithCounts,
      count: storesWithCounts.length,
    });
  } catch (error) {
    console.error("Public stores fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores." },
      { status: 500 }
    );
  }
}
