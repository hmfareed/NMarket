import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
    const { channel, identifier, password, firstName, lastName, role = "CUSTOMER" } = body;

    if (!channel || (channel !== "PHONE" && channel !== "EMAIL")) {
      return NextResponse.json(
        { error: "Invalid registration channel. Must be 'PHONE' or 'EMAIL'." },
        { status: 400 }
      );
    }

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Phone number or email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let normalizedIdentifier = identifier.trim();

    if (channel === "PHONE") {
      normalizedIdentifier = normalizeGhanaPhone(normalizedIdentifier);
      const ghanaPhoneRegex = /^\+233[235][0-9]{8}$/;
      if (!ghanaPhoneRegex.test(normalizedIdentifier)) {
        return NextResponse.json(
          { error: "Please provide a valid 10-digit Ghanaian mobile number (e.g. 024XXXXXXX)." },
          { status: 400 }
        );
      }

      // Check if phone is already registered and verified
      const existingUser = await User.findOne({ phone: normalizedIdentifier });
      if (existingUser && existingUser.isPhoneVerified) {
        return NextResponse.json(
          { error: "An account with this phone number already exists. Please log in." },
          { status: 409 }
        );
      }

      // If pending user exists, update password and details
      let user = existingUser;
      if (!user) {
        user = await User.create({
          phone: normalizedIdentifier,
          passwordHash,
          role,
          status: "PENDING_VERIFICATION",
          isPhoneVerified: false,
          isEmailVerified: false,
          customerProfile: { firstName, lastName },
        });
      } else {
        user.passwordHash = passwordHash;
        user.role = role;
        user.customerProfile = { firstName, lastName };
        await user.save();
      }

      // Generate and save hashed OTP
      const otpRes = await createAndSaveOtpToken(normalizedIdentifier, "SMS", "SIGNUP");
      if (!otpRes.success) {
        return NextResponse.json(
          { error: otpRes.error, retryAfter: otpRes.retryAfter },
          { status: 429 }
        );
      }

      // Dispatch SMS
      const smsRes = await sendSmsOtp({
        phone: normalizedIdentifier,
        code: otpRes.code!,
      });

      if (!smsRes.success) {
        return NextResponse.json(
          { error: smsRes.error || "Failed to dispatch verification SMS." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification OTP sent successfully via SMS.",
        channel: "PHONE",
        identifier: normalizedIdentifier,
      });
    } else {
      // EMAIL CHANNEL
      normalizedIdentifier = normalizedIdentifier.toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedIdentifier)) {
        return NextResponse.json(
          { error: "Please provide a valid email address." },
          { status: 400 }
        );
      }

      // Check if email already registered and verified
      const existingUser = await User.findOne({ email: normalizedIdentifier });
      if (existingUser && existingUser.isEmailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      let user = existingUser;
      if (!user) {
        user = await User.create({
          email: normalizedIdentifier,
          passwordHash,
          role,
          status: "PENDING_VERIFICATION",
          isPhoneVerified: false,
          isEmailVerified: false,
          customerProfile: { firstName, lastName },
        });
      } else {
        user.passwordHash = passwordHash;
        user.role = role;
        user.customerProfile = { firstName, lastName };
        await user.save();
      }

      // Generate and save hashed OTP
      const otpRes = await createAndSaveOtpToken(normalizedIdentifier, "EMAIL", "SIGNUP");
      if (!otpRes.success) {
        return NextResponse.json(
          { error: otpRes.error, retryAfter: otpRes.retryAfter },
          { status: 429 }
        );
      }

      // Dispatch Email via Resend
      const emailRes = await sendVerificationEmail({
        to: normalizedIdentifier,
        name: firstName,
        code: otpRes.code!,
      });

      if (!emailRes.success) {
        return NextResponse.json(
          { error: emailRes.error || "Failed to send verification email via Resend." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent to your email.",
        channel: "EMAIL",
        identifier: normalizedIdentifier,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
