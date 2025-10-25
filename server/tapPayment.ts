/**
 * Tap Payment Integration
 * Documentation: https://developers.tap.company/reference/api-endpoint
 */

const TAP_SECRET_KEY = process.env.TAP_PAYMENT_SECRET_KEY || "";
const TAP_PUBLIC_KEY = process.env.TAP_PAYMENT_PUBLIC_KEY || "";
const TAP_API_URL = "https://api.tap.company/v2";

export interface CreateChargeRequest {
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
  };
  source: {
    id: string; // Token from Tap Card SDK
  };
  redirect: {
    url: string; // Redirect URL after payment
  };
  metadata?: {
    userId?: number;
    subscriptionTier?: string;
    [key: string]: any;
  };
}

export interface TapCharge {
  id: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    id: string;
    email: string;
    name: string;
  };
  source: {
    type: string;
    payment_method: string;
  };
  redirect: {
    url: string;
  };
  transaction: {
    timezone: string;
    created: string;
  };
  metadata?: Record<string, any>;
}

export interface CreateChargeResponse {
  success: boolean;
  charge?: TapCharge;
  error?: string;
}

/**
 * Create a charge using Tap Payment API
 * https://developers.tap.company/reference/create-a-charge
 */
export async function createCharge(request: CreateChargeRequest): Promise<CreateChargeResponse> {
  if (!TAP_SECRET_KEY) {
    console.error("[Tap Payment] Secret key not configured");
    return {
      success: false,
      error: "Payment system not configured. Please contact support.",
    };
  }

  try {
    const response = await fetch(`${TAP_API_URL}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAP_SECRET_KEY}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Tap Payment] Charge creation failed:", data);
      return {
        success: false,
        error: data.message || "Failed to create charge",
      };
    }

    return {
      success: true,
      charge: data,
    };
  } catch (error) {
    console.error("[Tap Payment] Error creating charge:", error);
    return {
      success: false,
      error: "Payment system error. Please try again later.",
    };
  }
}

/**
 * Retrieve a charge by ID
 * https://developers.tap.company/reference/retrieve-a-charge
 */
export async function retrieveCharge(chargeId: string): Promise<TapCharge | null> {
  if (!TAP_SECRET_KEY) {
    console.error("[Tap Payment] Secret key not configured");
    return null;
  }

  try {
    const response = await fetch(`${TAP_API_URL}/charges/${chargeId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TAP_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      console.error("[Tap Payment] Failed to retrieve charge:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("[Tap Payment] Error retrieving charge:", error);
    return null;
  }
}

/**
 * Get Tap Public Key for frontend Card SDK
 */
export function getTapPublicKey(): string {
  return TAP_PUBLIC_KEY;
}

/**
 * Verify webhook signature
 * https://developers.tap.company/docs/webhooks
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // Implement webhook signature verification
  // This is a placeholder - implement according to Tap's webhook documentation
  return true;
}

