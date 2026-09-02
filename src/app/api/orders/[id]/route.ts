import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Order } from "@/models/Order";

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

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Access check: Customer who placed it, or an admin, or one of the sellers
    const isCustomer = order.customerId.toString() === session.userId;
    const isSeller = order.sellerOrders?.some(
      (so) => so.sellerId.toString() === session.userId
    );
    const isAdmin = [
      "SUPER_ADMIN",
      "OPERATIONS_ADMIN",
      "FINANCE_ADMIN",
      "SUPPORT",
    ].includes(session.role);

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Access denied." }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Fetch single order error:", error);
    return NextResponse.json({ error: "Failed to fetch order details." }, { status: 500 });
  }
}
