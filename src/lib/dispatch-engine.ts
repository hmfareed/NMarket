import { User, IUser } from "@/models/User";
import { Delivery, IDelivery } from "@/models/Delivery";
import { sendCustomSms } from "@/lib/sms";

// Tamale Area Geocoordinates Lookup (latitude, longitude)
export const TAMALE_COORDINATES: Record<string, [number, number]> = {
  "Central Market": [9.4008, -0.8393],
  "Tamale Central": [9.4008, -0.8393],
  "Lamashegu": [9.3872, -0.8456],
  "Sakasaka": [9.4167, -0.8333],
  "Vittin": [9.3750, -0.8250],
  "Sagnarigu": [9.4333, -0.8500],
  "Aboabo": [9.4050, -0.8360],
  "Choggu": [9.4280, -0.8420],
  "Kukuo": [9.3850, -0.8510],
  "Nyohini": [9.3920, -0.8490],
};

/**
 * Calculates geodesic distance between two GPS coordinates using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Rounded to 2 decimals
}

export interface RankedRider {
  riderId: string;
  name: string;
  phone: string;
  vehicleType: string;
  distanceKm: number;
}

/**
 * Finds and ranks active online riders in Tamale closest to the pickup store
 */
export async function findClosestOnlineRiders(params: {
  storeCoordinates?: [number, number]; // [lng, lat]
  storeArea: string;
}): Promise<RankedRider[]> {
  // 1. Resolve store coordinates: from param or known Tamale landmarks
  let storeLat = 9.4008;
  let storeLng = -0.8393;

  if (params.storeCoordinates && params.storeCoordinates.length === 2) {
    storeLng = params.storeCoordinates[0];
    storeLat = params.storeCoordinates[1];
  } else if (TAMALE_COORDINATES[params.storeArea]) {
    [storeLat, storeLng] = TAMALE_COORDINATES[params.storeArea];
  }

  // 2. Query all active online riders
  const onlineRiders = await User.find({
    role: "RIDER",
    status: "ACTIVE",
    "riderProfile.isOnline": true,
  }).lean();

  if (onlineRiders.length === 0) {
    return [];
  }

  // 3. Compute distances and rank
  const ranked: RankedRider[] = onlineRiders.map((rider) => {
    const coords = rider.riderProfile?.currentLocation?.coordinates || [-0.8393, 9.4008];
    const riderLng = coords[0];
    const riderLat = coords[1];

    const distanceKm = calculateHaversineDistanceKm(
      storeLat,
      storeLng,
      riderLat,
      riderLng
    );

    const firstName = rider.customerProfile?.firstName || "";
    const lastName = rider.customerProfile?.lastName || "";
    const name = `${firstName} ${lastName}`.trim() || rider.phone || "Tamale Rider";

    return {
      riderId: rider._id.toString(),
      name,
      phone: rider.phone || "",
      vehicleType: rider.riderProfile?.vehicleType || "MOTORCYCLE",
      distanceKm,
    };
  });

  // Sort ascending by distance (closest first)
  ranked.sort((a, b) => a.distanceKm - b.distanceKm);
  return ranked;
}

/**
 * Automatically dispatches delivery job to the closest available rider
 */
export async function autoDispatchDelivery(
  deliveryId: string
): Promise<{ success: boolean; dispatchedTo?: RankedRider; message: string }> {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return { success: false, message: "Delivery not found." };
  }

  const closestRiders = await findClosestOnlineRiders({
    storeCoordinates: delivery.pickupLocation.coordinates,
    storeArea: delivery.pickupLocation.area,
  });

  if (closestRiders.length === 0) {
    return {
      success: false,
      message: "No online riders currently active in Tamale metropolis.",
    };
  }

  const primaryRider = closestRiders[0];

  // Dispatch alert to closest rider
  if (primaryRider.phone) {
    await sendCustomSms({
      phone: primaryRider.phone,
      message: `🏍️ NMarket Dispatch: Package ${delivery.orderNumber} ready for pickup at ${delivery.pickupLocation.storeName} (${delivery.pickupLocation.area}). You are ${primaryRider.distanceKm}km away. Earn: ₵${delivery.deliveryFee}. Open app: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/rider`,
    });
  }

  delivery.notes = `Auto-dispatched to nearest rider ${primaryRider.name} (${primaryRider.distanceKm}km away).`;
  await delivery.save();

  return {
    success: true,
    dispatchedTo: primaryRider,
    message: `Dispatched to ${primaryRider.name} (${primaryRider.distanceKm}km away).`,
  };
}
