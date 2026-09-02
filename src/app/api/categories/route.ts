import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find({}).sort({ order: 1, name: 1 }).lean();

    // Aggregate product counts per category for published items
    const counts = await Product.aggregate([
      { $match: { status: "PUBLISHED" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    for (const item of counts) {
      countMap[item._id] = item.count;
    }

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat.slug] || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}
