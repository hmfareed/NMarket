import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Review } from "@/models/Review";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Store } from "@/models/Store";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to leave a review." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, productId, rating, comment } = body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Please provide a valid rating between 1 and 5 stars." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 3) {
      return NextResponse.json({ error: "Please provide a review comment of at least 3 characters." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Verified Purchase Check: Must be the customer's completed/paid order containing this product
    const order = await Order.findOne({
      _id: orderId,
      customerId: session.userId,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or you do not have permission to review this purchase." },
        { status: 404 }
      );
    }

    // Find the product in the order's sellerOrders
    let foundStoreId: any = null;
    let foundProduct = false;

    for (const so of order.sellerOrders) {
      const match = so.items.find((item) => item.productId.toString() === productId);
      if (match) {
        foundProduct = true;
        foundStoreId = so.storeId;
        break;
      }
    }

    if (!foundProduct) {
      return NextResponse.json(
        { error: "This product was not part of the specified order." },
        { status: 400 }
      );
    }

    // 2. Prevent Duplicate Reviews for the same product in the same order
    const existing = await Review.findOne({
      orderId,
      productId,
      customerId: session.userId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a review for this product on this order." },
        { status: 400 }
      );
    }

    // 3. Get customer display name
    const user = await User.findById(session.userId);
    const customerName =
      `${user?.customerProfile?.firstName || ""} ${user?.customerProfile?.lastName || ""}`.trim() ||
      user?.phone ||
      "Verified Buyer";

    // 4. Create Review
    const review = await Review.create({
      orderId,
      productId,
      storeId: foundStoreId,
      customerId: session.userId,
      customerName,
      rating: numRating,
      comment: comment.trim(),
      isVerifiedPurchase: true,
    });

    // 5. Recalculate Product Rating Aggregations
    const productReviews = await Review.find({ productId });
    const productAvg =
      productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: {
        average: Math.round(productAvg * 10) / 10,
        count: productReviews.length,
      },
    });

    // 6. Recalculate Store Performance Rating
    if (foundStoreId) {
      const storeReviews = await Review.find({ storeId: foundStoreId });
      const storeAvg =
        storeReviews.reduce((sum, r) => sum + r.rating, 0) / storeReviews.length;

      await Store.findByIdAndUpdate(foundStoreId, {
        "performance.rating": Math.round(storeAvg * 10) / 10,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your verified review has been published.",
      review,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
