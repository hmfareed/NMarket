import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const product = await Product.findOne({ _id: id, storeId: store._id });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Fetch single product error:", error);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const product = await Product.findOne({ _id: id, storeId: store._id });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      brand,
      price,
      compareAtPrice,
      status,
      onHand,
      lowStockThreshold,
      images,
      variants,
    } = body;

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description?.trim();
    if (brand !== undefined) product.brand = brand?.trim();
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : undefined;
    if (status !== undefined) product.status = status;
    if (images !== undefined) product.images = images;
    if (variants !== undefined) product.variants = variants;

    // Two-tier inventory update
    if (onHand !== undefined) {
      const newOnHand = Math.max(0, Number(onHand));
      product.inventory.onHand = newOnHand;
      // Recalculate available stock: onHand - reserved
      product.inventory.available = Math.max(0, newOnHand - (product.inventory.reserved || 0));

      if (product.inventory.available === 0 && product.status === "PUBLISHED") {
        product.status = "DRAFT"; // Or mark out of stock
      }
    }

    if (lowStockThreshold !== undefined) {
      product.inventory.lowStockThreshold = Number(lowStockThreshold);
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const result = await Product.deleteOne({ _id: id, storeId: store._id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
