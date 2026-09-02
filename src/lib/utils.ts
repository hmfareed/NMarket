import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value as Ghana Cedis (GH₵)
 */
export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace("GHS", "₵");
}

/**
 * Normalizes phone numbers to standard Ghanaian international format (+233)
 */
export function normalizeGhanaPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("0")) {
    return `+233${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("233")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("+233")) {
    return cleaned;
  }
  return cleaned;
}
