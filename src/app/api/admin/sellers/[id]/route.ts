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
    const { id } = await params;
    await connectToDatabase();

    const store = await Store.findById(id)
      .populate("sellerId", "customerProfile phone email role createdAt")
      .lean();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const products = await Product.find({ storeId: id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({ store, products });
  } catch (error) {
    console.error("Admin store get error:", error);
    return NextResponse.json({ error: "Failed to fetch store details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN", "SUPPORT"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      verificationStatus,
      commissionRate,
      adminNotes,
      rejectedReason,
      name,
      phone,
      whatsappPhone,
      address,
    } = body;

    await connectToDatabase();

    const store = await Store.findById(id);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (verificationStatus) {
      store.verificationStatus = verificationStatus;
      if (verificationStatus === "VERIFIED") {
        store.verifiedAt = new Date();
      }
    }

    if (typeof commissionRate === "number") {
      store.commissionRate = Math.min(Math.max(commissionRate, 0), 50);
    }

    if (adminNotes !== undefined) store.adminNotes = adminNotes;
    if (rejectedReason !== undefined) store.rejectedReason = rejectedReason;
    if (name) store.name = name;
    if (phone) store.phone = phone;
    if (whatsappPhone !== undefined) store.whatsappPhone = whatsappPhone;
    if (address) {
      store.address = { ...store.address, ...address };
    }

    await store.save();

    // If store was suspended, unpublish products or update status
    if (verificationStatus === "SUSPENDED") {
      await Product.updateMany({ storeId: id }, { status: "DRAFT" });
    } else if (verificationStatus === "VERIFIED") {
      await Product.updateMany({ storeId: id }, { status: "PUBLISHED" });
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("Admin store patch error:", error);
    return NextResponse.json({ error: "Failed to update store" }, { status: 500 });
  }
}
