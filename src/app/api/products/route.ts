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

    const andClauses: any[] = [];

    if (category && category !== "all") {
      const cleanCat = category.trim().toLowerCase();

      // Mapping aliases and category groups to capture both slug and display names
      const categoryMap: Record<string, string[]> = {
        phones: ["phones-tech", "phone", "smartphone", "charger", "gadget", "audio", "electronics"],
        electronics: ["phones-tech", "electronic", "appliance", "gadget", "audio", "solar", "tv", "phone"],
        tech: ["phones-tech", "computer", "laptop", "phone"],
        computing: ["phones-tech", "computing", "laptop", "computer", "flash drive", "keyboard"],
        fashion: ["fashion-smocks", "fashion", "smock", "fugu", "textile", "fabric", "cloth", "shoe", "sandal", "slipper"],
        smocks: ["fashion-smocks", "smock", "fugu", "traditional"],
        groceries: ["fresh-groceries", "provisions-essentials", "grocery", "yam", "rice", "food", "grain", "produce", "dawadawa", "honey"],
        food: ["fresh-groceries", "provisions-essentials", "food", "produce", "yam", "rice"],
        beauty: ["shea-beauty", "shea", "beauty", "cosmetic", "skincare", "soap", "oil", "lotion"],
        health: ["shea-beauty", "health", "beauty", "organic", "wellness"],
        shea: ["shea-beauty", "shea", "butter"],
        home: ["home-solar", "home", "solar", "appliance", "fan", "hardware", "living"],
        solar: ["home-solar", "solar", "inverter", "fan", "battery"],
        appliances: ["home-solar", "appliance", "fan", "blender", "kettle", "hardware", "electronics"],
        provisions: ["provisions-essentials", "fresh-groceries", "provision", "oil", "milk", "canned"],
        crafts: ["local-crafts", "fashion-smocks", "craft", "heritage", "drum", "leather", "shea-beauty"],
        sports: ["sports", "sport", "football", "gym", "fitness", "jersey"],
        baby: ["baby-products", "baby", "kids", "diaper", "toy"],
        gaming: ["gaming", "phones-tech", "game", "console", "playstation"],
        accessories: ["fashion-smocks", "phones-tech", "accessory", "accessories", "bag", "leather", "watch", "belt", "case", "charger"],
        shoes: ["fashion-smocks", "shoe", "shoes", "sandal", "slipper", "footwear", "leather"],
      };

      const relatedKeywords = new Set<string>();
      relatedKeywords.add(cleanCat);

      for (const [key, aliases] of Object.entries(categoryMap)) {
        if (cleanCat.includes(key) || aliases.some((a) => cleanCat.includes(a))) {
          aliases.forEach((a) => relatedKeywords.add(a));
          relatedKeywords.add(key);
        }
      }

      const tokens = Array.from(relatedKeywords)
        .concat(cleanCat.split(/[\s&,-]+/).filter((t) => t.length > 2))
        .filter(Boolean);

      const regexPattern = tokens.join("|");

      andClauses.push({
        $or: [
          { category: { $regex: regexPattern, $options: "i" } },
          { name: { $regex: regexPattern, $options: "i" } },
          { description: { $regex: regexPattern, $options: "i" } },
        ],
      });
    }

    if (q && q.trim()) {
      andClauses.push({
        $or: [
          { name: { $regex: q.trim(), $options: "i" } },
          { description: { $regex: q.trim(), $options: "i" } },
          { brand: { $regex: q.trim(), $options: "i" } },
          { category: { $regex: q.trim(), $options: "i" } },
        ],
      });
    }

    if (andClauses.length > 0) {
      query.$and = andClauses;
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
