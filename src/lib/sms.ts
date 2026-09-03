import { normalizeGhanaPhone } from "./utils";

export interface SendSmsOtpParams {
  phone: string;
  code: string;
}

/**
 * Dispatches an SMS verification OTP to a Ghanaian phone number
 */
export async function sendSmsOtp({
  phone,
  code,
}: SendSmsOtpParams): Promise<{ success: boolean; error?: string }> {
  const normalizedPhone = normalizeGhanaPhone(phone);

  // Validate Ghana phone number pattern (+233 followed by 9 digits)
  const ghanaPhoneRegex = /^\+233[235][0-9]{8}$/;
  if (!ghanaPhoneRegex.test(normalizedPhone)) {
    return {
      success: false,
      error: "Invalid Ghanaian mobile number format. Must be a valid 10-digit number (e.g., 024XXXXXXX).",
    };
  }

  const smsApiKey = process.env.SMS_API_KEY;
  const message = `Your NMarket verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;

  // Development Fallback: If no SMS API key is configured, log code to terminal
  if (!smsApiKey) {
    console.log("\n=======================================================");
    console.log(`📱 [DEV SMS SIMULATOR] To: ${normalizedPhone}`);
    console.log(`🔐 SMS Message: "${message}"`);
    console.log("ℹ️  Configure SMS_API_KEY in .env.local to send live SMS via Hubtel/Arkesel");
    console.log("=======================================================\n");
    return { success: true };
  }

  try {
    // Production integration with Ghana SMS aggregators (e.g. Arkesel or Hubtel)
    // When live credentials are provided in .env.local:
    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": smsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: process.env.SMS_SENDER_ID || "NMarket",
        message,
        recipients: [normalizedPhone],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SMS gateway error:", errorText);
      return { success: false, error: "Failed to dispatch SMS through gateway." };
    }

    return { success: true };
  } catch (err) {
    console.error("SMS delivery exception:", err);
    return { success: false, error: (err as Error).message };
  }
}

export interface SendCustomSmsParams {
  phone: string;
  message: string;
}

/**
 * Dispatches a custom transactional SMS to a Ghanaian mobile number
 */
export async function sendCustomSms({
  phone,
  message,
}: SendCustomSmsParams): Promise<{ success: boolean; error?: string }> {
  const normalizedPhone = normalizeGhanaPhone(phone);
  const smsApiKey = process.env.SMS_API_KEY;

  if (!smsApiKey) {
    console.log("\n=======================================================");
    console.log(`📱 [DEV SMS SIMULATOR] To: ${normalizedPhone}`);
    console.log(`💬 Transactional SMS: "${message}"`);
    console.log("ℹ️  Configure SMS_API_KEY in .env.local to dispatch live SMS");
    console.log("=======================================================\n");
    return { success: true };
  }

  try {
    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": smsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: process.env.SMS_SENDER_ID || "NMarket",
        message,
        recipients: [normalizedPhone],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SMS gateway error:", errorText);
      return { success: false, error: "Failed to dispatch SMS through gateway." };
    }

    return { success: true };
  } catch (err) {
    console.error("SMS delivery exception:", err);
    return { success: false, error: (err as Error).message };
  }
}
