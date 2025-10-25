export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "ContraMind.ai";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/2563EB/FFFFFF?text=CM";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// ContraMind.ai Specific Constants

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE_TRIAL: {
    id: "free_trial",
    name: "Free Trial",
    nameAr: "تجربة مجانية",
    duration: "14 days",
    price: 0,
  },
  STARTER: {
    id: "starter",
    name: "Starter",
    nameAr: "المبتدئ",
    priceMonthly: 299,
    priceAnnual: 2990,
    currency: "SAR",
  },
  PROFESSIONAL: {
    id: "professional",
    name: "Professional",
    nameAr: "المحترف",
    priceMonthly: 799,
    priceAnnual: 7990,
    currency: "SAR",
  },
  BUSINESS: {
    id: "business",
    name: "Business",
    nameAr: "الأعمال",
    priceMonthly: 1999,
    priceAnnual: 19990,
    currency: "SAR",
  },
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_MB: 10,
  ACCEPTED_TYPES: [".pdf", ".doc", ".docx"],
  ACCEPTED_MIME_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// Language Configuration
export const LANGUAGES = {
  EN: { code: "en", name: "English", direction: "ltr" as const, flag: "🇬🇧" },
  AR: { code: "ar", name: "العربية", direction: "rtl" as const, flag: "🇸🇦" },
} as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: {
    value: "low",
    label: "Low Risk",
    labelAr: "مخاطر منخفضة",
    color: "text-green-600",
  },
  MEDIUM: {
    value: "medium",
    label: "Medium Risk",
    labelAr: "مخاطر متوسطة",
    color: "text-yellow-600",
  },
  HIGH: {
    value: "high",
    label: "High Risk",
    labelAr: "مخاطر عالية",
    color: "text-red-600",
  },
} as const;

// Compliance Status
export const COMPLIANCE_STATUS = {
  COMPLIANT: {
    value: "compliant",
    label: "Compliant",
    labelAr: "متوافق",
    color: "text-green-600",
  },
  NON_COMPLIANT: {
    value: "non_compliant",
    label: "Non-Compliant",
    labelAr: "غير متوافق",
    color: "text-red-600",
  },
  REQUIRES_REVIEW: {
    value: "requires_review",
    label: "Requires Review",
    labelAr: "يتطلب مراجعة",
    color: "text-yellow-600",
  },
} as const;