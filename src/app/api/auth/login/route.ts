import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { normalizeGhanaPhone } from "@/lib/utils";
import { signSessionToken, setSessionCookie } from "@/lib/jwt";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone/Email and password are required." },
        { status: 400 }
      );
    }

    let cleanIdentifier = identifier.trim();
    if (cleanIdentifier.includes("@")) {
      cleanIdentifier = cleanIdentifier.toLowerCase();
    } else {
      cleanIdentifier = normalizeGhanaPhone(cleanIdentifier);
    }

    // Find user by phone or email
    const user = await User.findOne({
      $or: [{ phone: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your details and try again." },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Account temporarily locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await user.save();

      return NextResponse.json(
        { error: "Invalid credentials. Please check your details and try again." },
        { status: 401 }
      );
    }

    // Check verification status
    const isVerified =
      (user.phone && user.isPhoneVerified) ||
      (user.email && user.isEmailVerified);

    if (!isVerified) {
      return NextResponse.json(
        {
          error: "Your account is not yet verified. Please verify your phone/email to continue.",
          requiresVerification: true,
          identifier: cleanIdentifier,
          channel: cleanIdentifier.includes("@") ? "EMAIL" : "PHONE",
        },
        { status: 403 }
      );
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await user.save();

    // Create session token & cookie
    const sessionPayload = {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
      email: user.email,
      name: `${user.customerProfile?.firstName || ""} ${user.customerProfile?.lastName || ""}`.trim(),
    };

    const token = await signSessionToken(sessionPayload);
    await setSessionCookie(token);

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
      message: "Login successful.",
      user: sessionPayload,
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
