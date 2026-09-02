import crypto from "node:crypto";
import { VerificationToken } from "@/models/VerificationToken";

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes a SHA-256 hash of the plain OTP code
 */
export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export interface CreateOtpResult {
  code: string;
  expiresAt: Date;
}

/**
 * Creates and stores a hashed verification token in MongoDB with rate-limiting checks
 */
export async function createAndSaveOtpToken(
  identifier: string,
  channel: "SMS" | "EMAIL",
  purpose: "SIGNUP" | "LOGIN" | "PASSWORD_RESET" = "SIGNUP"
): Promise<{ success: boolean; code?: string; error?: string; retryAfter?: number }> {
  // Check rate limit: if existing token was created within the last 60 seconds
  const existing = await VerificationToken.findOne({
    identifier,
    purpose,
  }).sort({ createdAt: -1 });

  if (existing) {
    const elapsedSeconds = (Date.now() - existing.createdAt.getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
      return {
        success: false,
        error: `Please wait ${waitTime} seconds before requesting another code.`,
        retryAfter: waitTime,
      };
    }
  }

  // Generate code and hash
  const code = generateOtpCode();
  const tokenHash = hashOtpCode(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Remove any older tokens for this identifier and purpose
  await VerificationToken.deleteMany({ identifier, purpose });

  // Save new hashed token
  await VerificationToken.create({
    identifier,
    tokenHash,
    channel,
    purpose,
    attempts: 0,
    maxAttempts: 3,
    expiresAt,
  });

  return { success: true, code };
}

/**
 * Verifies a submitted OTP code against the hashed token in MongoDB
 */
export async function verifyOtpCode(
  identifier: string,
  submittedCode: string,
  purpose: "SIGNUP" | "LOGIN" | "PASSWORD_RESET" = "SIGNUP"
): Promise<{ success: boolean; error?: string }> {
  const tokenDoc = await VerificationToken.findOne({
    identifier,
    purpose,
  });

  if (!tokenDoc) {
    return {
      success: false,
      error: "Verification code expired or not found. Please request a new code.",
    };
  }

  if (tokenDoc.attempts >= tokenDoc.maxAttempts) {
    await VerificationToken.deleteOne({ _id: tokenDoc._id });
    return {
      success: false,
      error: "Too many failed attempts. Code has been invalidated. Please request a new one.",
    };
  }

  const incomingHash = hashOtpCode(submittedCode);

  if (incomingHash !== tokenDoc.tokenHash) {
    tokenDoc.attempts += 1;
    await tokenDoc.save();
    const remaining = tokenDoc.maxAttempts - tokenDoc.attempts;
    return {
      success: false,
      error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  // Successfully verified: Delete token so it cannot be replayed
  await VerificationToken.deleteOne({ _id: tokenDoc._id });
  return { success: true };
}
