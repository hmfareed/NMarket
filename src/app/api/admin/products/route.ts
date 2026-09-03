import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Product } from "@/models/Product";
import "@/models/Store";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const stockStatus = searchParams.get("stock");

    const query: Record<string, unknown> = {};

    if (category && category !== "ALL") {
      query.category = { $regex: category.trim(), $options: "i" };
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (stockStatus === "OUT_OF_STOCK") {
      query["inventory.available"] = { $lte: 0 };
    } else if (stockStatus === "LOW_STOCK") {
      query["inventory.available"] = { $gt: 0, $lte: 5 };
    } else if (stockStatus === "IN_STOCK") {
      query["inventory.available"] = { $gt: 5 };
    }

    if (q && q.trim()) {
      const regex = { $regex: q.trim(), $options: "i" };
      query.$or = [{ name: regex }, { description: regex }, { brand: regex }];
    }

    const products = await Product.find(query)
      .populate("storeId", "name slug address phone performance")
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    const counts = {
      total: await Product.countDocuments({}),
      published: await Product.countDocuments({ status: "PUBLISHED" }),
      draft: await Product.countDocuments({ status: "DRAFT" }),
      outOfStock: await Product.countDocuments({ "inventory.available": { $lte: 0 } }),
    };

    return NextResponse.json({ products, counts });
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { productId, status, price, compareAtPrice, stockAvailable } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (status) product.status = status;
    if (typeof price === "number") product.price = price;
    if (typeof compareAtPrice === "number") product.compareAtPrice = compareAtPrice;
    if (typeof stockAvailable === "number") {
      product.inventory.available = stockAvailable;
    }

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Admin product patch error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
