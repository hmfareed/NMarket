import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (!session || !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      query.verificationStatus = status;
    }

    const stores = await Store.find(query)
      .populate("sellerId", "customerProfile phone email role createdAt")
      .sort({ createdAt: -1 });

    const counts = {
      pending: await Store.countDocuments({ verificationStatus: "PENDING" }),
      underReview: await Store.countDocuments({ verificationStatus: "UNDER_REVIEW" }),
      verified: await Store.countDocuments({ verificationStatus: "VERIFIED" }),
      rejected: await Store.countDocuments({ verificationStatus: "REJECTED" }),
      total: await Store.countDocuments({}),
    };

    return NextResponse.json({ stores, counts });
  } catch (error) {
    console.error("Admin sellers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch sellers list." }, { status: 500 });
  }
}
