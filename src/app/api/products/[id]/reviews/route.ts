import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Review } from "@/models/Review";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    await connectToDatabase();

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .lean();

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10
          ) / 10
        : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalCount,
    });
  } catch (error) {
    console.error("Fetch product reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}
