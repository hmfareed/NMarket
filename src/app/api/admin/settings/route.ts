import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jwt";

// In-memory / persistent marketplace config defaults
let platformSettings = {
  defaultCommissionRate: 10.0,
  deliveryZones: [
    { zone: "Tamale Central & Commercial Hub", fee: 10.0, estMinutes: 30 },
    { zone: "Lamashegu & Sakasaka", fee: 12.0, estMinutes: 35 },
    { zone: "Nyankpala & UDS Campus", fee: 18.0, estMinutes: 45 },
    { zone: "Savelugu & Outskirts", fee: 25.0, estMinutes: 60 },
  ],
  escrowHoldingHours: 24,
  sellerSelfRegistration: true,
  smsOtpNotifications: true,
  currency: "GHS",
};

export async function GET() {
  return NextResponse.json({ settings: platformSettings });
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    const adminRoles = ["SUPER_ADMIN", "OPERATIONS_ADMIN"];

    if (session && !adminRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    platformSettings = {
      ...platformSettings,
      ...body,
    };

    return NextResponse.json({ success: true, settings: platformSettings });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json({ error: "Failed to update platform settings" }, { status: 500 });
  }
}
