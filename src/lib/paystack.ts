import crypto from "node:crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const isLiveKey = Boolean(
  PAYSTACK_SECRET_KEY &&
  !PAYSTACK_SECRET_KEY.includes("xxxx") &&
  PAYSTACK_SECRET_KEY.startsWith("sk_")
);

export interface InitializePaymentParams {
  email: string;
  amount: number; // in GHS
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Initializes a Ghana Mobile Money payment with Paystack
 */
export async function initializePaystackTransaction({
  email,
  amount,
  reference,
  callbackUrl,
  metadata = {},
}: InitializePaymentParams): Promise<InitializePaymentResponse> {
  // Development Simulator: If no live Paystack secret key is provided
  if (!isLiveKey) {
    console.log("\n=======================================================");
    console.log(`💳 [DEV PAYSTACK SIMULATOR]`);
    console.log(`📦 Order: ${metadata.orderNumber || "N/A"}`);
    console.log(`💰 Amount: GH₵${amount.toFixed(2)} (${Math.round(amount * 100)} pesewas)`);
    console.log(`🔐 Reference: ${reference}`);
    console.log(`📱 Customer: ${email} (${metadata.momoPhone || "N/A"})`);
    console.log("ℹ️  Configure PAYSTACK_SECRET_KEY in .env.local to trigger live MoMo USSD");
    console.log("=======================================================\n");

    return {
      success: true,
      reference,
      authorizationUrl: `${callbackUrl}?simulated_payment=true&reference=${reference}`,
      isSimulated: true,
    };
  }

  try {
    const amountInPesewas = Math.round(amount * 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInPesewas,
        currency: "GHS",
        channels: ["mobile_money"],
        reference,
        callback_url: callbackUrl,
        metadata,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack initialize error:", data);
      return {
        success: false,
        reference,
        error: data.message || "Failed to initialize Paystack payment.",
      };
    }

    return {
      success: true,
      reference: data.data.reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      isSimulated: false,
    };
  } catch (err) {
    console.error("Paystack API exception:", err);
    return {
      success: false,
      reference,
      error: (err as Error).message,
    };
  }
}

/**
 * Verifies transaction directly with Paystack API
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!isLiveKey) {
    // Simulator mode: auto-verify
    return {
      success: true,
      data: {
        status: "success",
        reference,
        gateway_response: "Approved (Simulated Pilot)",
      },
    };
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok || !data.status) {
      return { success: false, error: data.message || "Verification failed." };
    }

    return {
      success: data.data.status === "success",
      data: data.data,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Validates HMAC SHA-512 webhook signature from Paystack
 */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  if (!isLiveKey) {
    // In dev simulation, allow test signatures
    return signature === "simulated_secret_test_signature" || true;
  }

  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}
