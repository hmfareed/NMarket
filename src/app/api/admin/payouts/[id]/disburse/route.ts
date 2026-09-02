import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Payout } from "@/models/Payout";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const payout = await Payout.findById(id);
    if (!payout) {
      return NextResponse.json({ error: "Payout record not found." }, { status: 404 });
    }

    if (payout.status === "PAID") {
      return NextResponse.json({ error: "Payout is already marked as paid." }, { status: 400 });
    }

    payout.status = "PAID";
    payout.disbursedAt = new Date();
    await payout.save();

    return NextResponse.json({
      success: true,
      message: `Disbursement of ₵${payout.amount.toFixed(2)} to ${payout.recipientName} (${payout.momoNetwork} - ${payout.momoNumber}) confirmed!`,
      payout,
    });
  } catch (error) {
    console.error("Disburse payout error:", error);
    return NextResponse.json({ error: "Failed to disburse payout." }, { status: 500 });
  }
}
