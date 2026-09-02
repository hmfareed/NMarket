import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "NMarket <onboarding@resend.dev>";

export interface SendVerificationEmailParams {
  to: string;
  name?: string;
  code: string;
}

/**
 * Sends a branded OTP verification email via Resend
 */
export async function sendVerificationEmail({
  to,
  name,
  code,
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? `Hello ${name},` : "Hello,";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #16a34a; padding: 28px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 28px; color: #1e293b; }
          .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #15803d; font-family: monospace; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NMarket</h1>
            <p>Northern Ghana's Fast Local Marketplace</p>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-top: 0;">${greeting}</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Thank you for registering with NMarket! Use the verification code below to verify your email address and activate your account:
            </p>
            <div class="otp-box">
              <span class="otp-code">${code}</span>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              This code will expire in <strong>10 minutes</strong>. If you did not create an NMarket account, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} NMarket. Tamale, Northern Region, Ghana.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Development Fallback: If no API key is provided, log to console
  if (!resend) {
    console.log("\n=======================================================");
    console.log(`📧 [DEV EMAIL SIMULATOR] To: ${to}`);
    console.log(`🔐 Verification Code: ${code}`);
    console.log("ℹ️  Configure RESEND_API_KEY in .env.local to send live emails");
    console.log("=======================================================\n");
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your NMarket Verification Code: ${code}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send verification email via Resend:", err);
    return { success: false, error: (err as Error).message };
  }
}
