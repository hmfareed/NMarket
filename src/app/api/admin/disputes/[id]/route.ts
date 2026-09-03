import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Dispute } from "@/models/Dispute";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"].includes(session.role)
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, adminNotes, refundAmount } = body;

    const validStatuses = [
      "UNDER_REVIEW",
      "RESOLVED_REFUND",
      "RESOLVED_REPLACEMENT",
      "RESOLVED_NO_ACTION",
      "REJECTED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid dispute resolution status." }, { status: 400 });
    }

    await connectToDatabase();
    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return NextResponse.json({ error: "Dispute record not found." }, { status: 404 });
    }

    dispute.status = status;
    if (adminNotes) dispute.adminNotes = adminNotes;
    if (refundAmount !== undefined) dispute.refundAmount = Number(refundAmount);
    if (status.startsWith("RESOLVED_") || status === "REJECTED") {
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    return NextResponse.json({
      success: true,
      message: `Dispute updated to ${status}.`,
      dispute,
    });
  } catch (error) {
    console.error("Admin resolve dispute error:", error);
    return NextResponse.json({ error: "Failed to resolve dispute." }, { status: 500 });
  }
}
