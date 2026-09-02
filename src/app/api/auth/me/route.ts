import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findById(session.userId).select("-passwordHash");

  if (!user || user.status === "SUSPENDED") {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
      email: user.email,
      name: `${user.customerProfile?.firstName || ""} ${user.customerProfile?.lastName || ""}`.trim(),
      status: user.status,
    },
  });
}
