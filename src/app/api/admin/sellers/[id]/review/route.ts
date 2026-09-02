import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/jwt";
import { Store } from "@/models/Store";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (!session || !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNotes, rejectedReason } = body;

    if (!action || !["APPROVE", "REJECT", "REQUEST_CHANGES"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'APPROVE', 'REJECT', or 'REQUEST_CHANGES'." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const store = await Store.findById(id);

    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      store.verificationStatus = "VERIFIED";
      store.verifiedAt = new Date();
      store.rejectedReason = undefined;
      store.adminNotes = adminNotes?.trim() || `Approved by ${session.name || session.userId}`;
    } else if (action === "REJECT") {
      store.verificationStatus = "REJECTED";
      store.rejectedReason = rejectedReason?.trim() || "Application does not meet marketplace standards.";
      store.adminNotes = adminNotes?.trim() || `Rejected by ${session.name || session.userId}`;
    } else if (action === "REQUEST_CHANGES") {
      store.verificationStatus = "UNDER_REVIEW";
      store.adminNotes = adminNotes?.trim() || "Additional information requested.";
    }

    await store.save();

    return NextResponse.json({
      success: true,
      message: `Store ${action === "APPROVE" ? "approved and verified" : action === "REJECT" ? "rejected" : "marked under review"} successfully.`,
      store,
    });
  } catch (error) {
    console.error("Admin review store error:", error);
    return NextResponse.json({ error: "Failed to process store review." }, { status: 500 });
  }
}
