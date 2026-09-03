import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { MEGA_CATEGORIES } from "@/components/customer/MegaCategoryNav";

export async function GET() {
  try {
    await connectToDatabase();

    const dbCategories = await Category.find().lean();
    const productCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    productCounts.forEach((pc: any) => {
      if (pc._id) countMap.set(pc._id.toLowerCase(), pc.count);
    });

    // Merge DB categories with MEGA_CATEGORIES template
    const categories = MEGA_CATEGORIES.map((mc) => {
      const matchCount = countMap.get(mc.name.toLowerCase()) || 0;
      return {
        id: mc.id,
        name: mc.name,
        badge: mc.badge,
        groups: mc.groups,
        productCount: matchCount,
      };
    });

    return NextResponse.json({ categories, totalCount: categories.length });
  } catch (error) {
    console.error("Admin categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newCategory = await Category.create({
      name,
      slug,
      description,
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error("Admin category create error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
