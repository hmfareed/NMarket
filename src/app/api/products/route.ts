import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import "@/models/Store"; // Ensure Store schema is registered for population

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const sort = searchParams.get("sort") || "newest";
    const limit = Math.min(Number(searchParams.get("limit")) || 24, 50);

    const query: Record<string, unknown> = {
      status: "PUBLISHED",
      "inventory.available": { $gt: 0 },
    };

    if (category && category !== "all") {
      const cleanCat = category.trim();
      // Handle slug or compound names like phones-tablets or Health & Beauty
      const tokens = cleanCat.split(/[\s&-]+/).filter((t) => t.length > 2);
      if (tokens.length > 0) {
        query.category = { $regex: tokens.join("|"), $options: "i" };
      } else {
        query.category = { $regex: cleanCat, $options: "i" };
      }
    }

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { brand: { $regex: q.trim(), $options: "i" } },
        { category: { $regex: q.trim(), $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    // Proximity search using MongoDB 2dsphere $near
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: 35000, // 35km covering Tamale metropolis and surrounding districts
        },
      };
    }

    let productQuery = Product.find(query)
      .populate("storeId", "name slug address phone performance")
      .limit(limit);

    // If not using $near, apply explicit sorts
    if (!query.location) {
      if (sort === "price_asc") {
        productQuery = productQuery.sort({ price: 1 });
      } else if (sort === "price_desc") {
        productQuery = productQuery.sort({ price: -1 });
      } else {
        productQuery = productQuery.sort({ createdAt: -1 });
      }
    }

    const products = await productQuery.lean();

    return NextResponse.json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Public products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch marketplace products." }, { status: 500 });
  }
}
