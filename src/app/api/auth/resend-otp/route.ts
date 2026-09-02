import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { normalizeGhanaPhone } from "@/lib/utils";
import { createAndSaveOtpToken } from "@/lib/otp";
import { sendSmsOtp } from "@/lib/sms";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { identifier, purpose = "SIGNUP" } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: "Phone number or email is required." },
        { status: 400 }
      );
    }

    let cleanIdentifier = identifier.trim();
    let isEmail = cleanIdentifier.includes("@");

    if (isEmail) {
      cleanIdentifier = cleanIdentifier.toLowerCase();
    } else {
      cleanIdentifier = normalizeGhanaPhone(cleanIdentifier);
    }

    const user = await User.findOne({
      $or: [{ phone: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const channel = isEmail ? "EMAIL" : "SMS";
    const otpRes = await createAndSaveOtpToken(cleanIdentifier, channel, purpose);

    if (!otpRes.success) {
      return NextResponse.json(
        { error: otpRes.error, retryAfter: otpRes.retryAfter },
        { status: 429 }
      );
    }

    if (isEmail) {
      await sendVerificationEmail({
        to: cleanIdentifier,
        name: user.customerProfile?.firstName,
        code: otpRes.code!,
      });
    } else {
      await sendSmsOtp({
        phone: cleanIdentifier,
        code: otpRes.code!,
      });
    }

    return NextResponse.json({
      success: true,
      message: `A new verification code has been sent via ${isEmail ? "email" : "SMS"}.`,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend code. Please try again." },
      { status: 500 }
    );
  }
}
