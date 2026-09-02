import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyOtpCode } from "@/lib/otp";
import { signSessionToken, setSessionCookie } from "@/lib/jwt";
import { normalizeGhanaPhone } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { identifier, code, purpose = "SIGNUP" } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { error: "Identifier (phone or email) and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    let cleanIdentifier = identifier.trim();
    if (cleanIdentifier.includes("@")) {
      cleanIdentifier = cleanIdentifier.toLowerCase();
    } else {
      cleanIdentifier = normalizeGhanaPhone(cleanIdentifier);
    }

    // Verify OTP against hashed token
    const verification = await verifyOtpCode(cleanIdentifier, code.trim(), purpose);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    // Find user by phone or email
    const user = await User.findOne({
      $or: [{ phone: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Update verification flags
    user.status = "ACTIVE";
    if (user.phone === cleanIdentifier) {
      user.isPhoneVerified = true;
    }
    if (user.email === cleanIdentifier) {
      user.isEmailVerified = true;
    }
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await user.save();

    // Create session payload and JWT
    const sessionPayload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
      email: user.email,
      name: `${user.customerProfile?.firstName || ""} ${user.customerProfile?.lastName || ""}`.trim(),
    };

    const token = await signSessionToken(sessionPayload);
    await setSessionCookie(token);

    // Determine default redirect based on role
    let redirectTo = "/";
    if (user.role === "SELLER") redirectTo = "/seller";
    else if (user.role === "RIDER") redirectTo = "/rider";
    else if (
      user.role === "SUPER_ADMIN" ||
      user.role === "OPERATIONS_ADMIN" ||
      user.role === "FINANCE_ADMIN"
    ) {
      redirectTo = "/admin";
    }

    return NextResponse.json({
      success: true,
      message: "Account verified successfully.",
      user: sessionPayload,
      redirectTo,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
