import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";
import { Product } from "@/models/Product";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: List all products belonging to current seller
export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { storeId: store._id };
    if (status && status !== "ALL") {
      filter.status = status;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    const counts = {
      total: await Product.countDocuments({ storeId: store._id }),
      published: await Product.countDocuments({ storeId: store._id, status: "PUBLISHED" }),
      draft: await Product.countDocuments({ storeId: store._id, status: "DRAFT" }),
      lowStock: await Product.countDocuments({
        storeId: store._id,
        "inventory.available": { $lte: 2 },
      }),
    };

    return NextResponse.json({ products, counts, storeName: store.name });
  } catch (error) {
    console.error("Seller products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

// POST: Create a new product with denormalized store location
export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectToDatabase();
    const store = await Store.findOne({ sellerId: session.userId });
    if (!store) {
      return NextResponse.json(
        { error: "Please register your merchant store before adding products." },
        { status: 404 }
      );
    }

    if (store.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        {
          error: `Your store is currently ${store.verificationStatus.toLowerCase().replace("_", " ")}. Products can only be published once verified by an admin.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      category,
      description,
      brand,
      price,
      compareAtPrice,
      onHand = 1,
      lowStockThreshold = 2,
      images = [],
      variants = [],
      status = "PUBLISHED",
    } = body;

    if (!name || !category || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Product name, category, and price are required." },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    const numericOnHand = Math.max(0, Number(onHand) || 0);

    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ error: "Invalid product price." }, { status: 400 });
    }

    // Generate unique slug
    let slug = generateSlug(name);
    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Format images array
    const formattedImages = Array.isArray(images) && images.length > 0
      ? images.map((img: string | { url: string; isPrimary?: boolean }, index: number) => {
          if (typeof img === "string") {
            return { url: img, isPrimary: index === 0 };
          }
          return { url: img.url, isPrimary: img.isPrimary ?? index === 0 };
        })
      : [
          {
            url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60",
            isPrimary: true,
          },
        ];

    // Create product with store's GeoJSON location copied for proximity queries
    const product = await Product.create({
      storeId: store._id,
      category,
      name: name.trim(),
      slug,
      description: description?.trim(),
      brand: brand?.trim(),
      status,
      price: numericPrice,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      images: formattedImages,
      variants: variants || [],
      inventory: {
        onHand: numericOnHand,
        reserved: 0,
        available: numericOnHand,
        lowStockThreshold: Number(lowStockThreshold) || 2,
      },
      location: {
        type: "Point",
        coordinates: store.location.coordinates, // [longitude, latitude]
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product. Please try again." },
      { status: 500 }
    );
  }
}
