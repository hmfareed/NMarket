import { getTamaleAreaByName, TAMALE_AREAS } from "./constants/tamale-areas";

export interface DeliveryCalculationParams {
  destinationArea: string;
  uniqueSellerCount: number;
}

export interface DeliveryCalculationResult {
  zoneSlug: "tamale-central" | "tamale-outer";
  zoneName: string;
  baseFee: number;
  multiSellerSurcharge: number;
  totalDeliveryFee: number;
  estimatedMinutes: number;
}

/**
 * Calculates delivery fee for Tamale metropolis based on delivery zone and seller stop count
 */
export function calculateTamaleDeliveryFee({
  destinationArea,
  uniqueSellerCount = 1,
}: DeliveryCalculationParams): DeliveryCalculationResult {
  const areaInfo = getTamaleAreaByName(destinationArea) || TAMALE_AREAS[0];

  const isZone1 = areaInfo.zoneSlug === "tamale-central";

  // Base fee per Tamale delivery zone rules
  const baseFee = isZone1 ? 10 : 18;
  const estimatedMinutes = isZone1 ? 45 : 75;

  // Multi-seller routing fee: ₵5 for each extra merchant pickup stop
  const extraStops = Math.max(0, uniqueSellerCount - 1);
  const multiSellerSurcharge = extraStops * 5;

  const totalDeliveryFee = baseFee + multiSellerSurcharge;

  return {
    zoneSlug: areaInfo.zoneSlug,
    zoneName: areaInfo.zoneName,
    baseFee,
    multiSellerSurcharge,
    totalDeliveryFee,
    estimatedMinutes,
  };
}
