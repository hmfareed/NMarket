import { NextResponse } from "next/server";
import { TAMALE_AREAS, TamaleAreaInfo } from "@/lib/constants/tamale-areas";

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Finds the closest predefined Tamale area for accurate dispatch and zone pricing
 */
function findClosestTamaleArea(lat: number, lng: number): { area: TamaleAreaInfo; distanceKm: number } {
  let closest = TAMALE_AREAS[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.coordinates[1], closest.coordinates[0]);

  for (let i = 1; i < TAMALE_AREAS.length; i++) {
    const item = TAMALE_AREAS[i];
    const dist = calculateDistanceKm(lat, lng, item.coordinates[1], item.coordinates[0]);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }

  return { area: closest, distanceKm: minDistance };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: "Query parameters 'lat' and 'lng' are required." },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid coordinates provided." },
        { status: 400 }
      );
    }

    const { area: closestTamale, distanceKm } = findClosestTamaleArea(lat, lng);

    const googleMapsApiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. Try Google Maps Geocoding API if key is available
    if (googleMapsApiKey && googleMapsApiKey !== "your_google_maps_api_key_here") {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;
        const gRes = await fetch(googleUrl, { next: { revalidate: 3600 } });
        const gData = await gRes.json();

        if (gData.status === "OK" && gData.results && gData.results.length > 0) {
          const firstResult = gData.results[0];
          const addressComponents = firstResult.address_components || [];

          let streetNumber = "";
          let route = "";
          let neighborhood = "";
          let sublocality = "";
          let locality = "";
          let adminArea = "";
          let country = "Ghana";

          for (const comp of addressComponents) {
            const types = comp.types || [];
            if (types.includes("street_number")) streetNumber = comp.long_name;
            if (types.includes("route")) route = comp.long_name;
            if (types.includes("neighborhood")) neighborhood = comp.long_name;
            if (types.includes("sublocality") || types.includes("sublocality_level_1")) sublocality = comp.long_name;
            if (types.includes("locality")) locality = comp.long_name;
            if (types.includes("administrative_area_level_1")) adminArea = comp.long_name;
            if (types.includes("country")) country = comp.long_name;
          }

          const street = [streetNumber, route].filter(Boolean).join(" ") ||
            neighborhood ||
            sublocality ||
            firstResult.formatted_address.split(",")[0];

          const detectedArea = neighborhood || sublocality || closestTamale.name;

          return NextResponse.json({
            success: true,
            provider: "google",
            coordinates: [lng, lat],
            formattedAddress: firstResult.formatted_address,
            streetAddress: street || `Near ${closestTamale.name}`,
            area: detectedArea,
            city: locality || "Tamale",
            region: adminArea || "Northern Region",
            country,
            placeId: firstResult.place_id,
            matchedTamaleArea: closestTamale.name,
            zoneSlug: closestTamale.zoneSlug,
            zoneName: closestTamale.zoneName,
            distanceToTamaleAreaKm: distanceKm,
            plusCode: gData.plus_code?.global_code || firstResult.plus_code?.global_code,
          });
        }
      } catch (err) {
        console.warn("Google Maps reverse geocoding warning:", err);
      }
    }

    // 2. Fallback: OpenStreetMap Nominatim
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const osmRes = await fetch(osmUrl, {
        headers: { "User-Agent": "NMarket-Tamale-Delivery/1.0" },
      });

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (osmData && osmData.address) {
          const addr = osmData.address;
          const street =
            addr.road ||
            addr.pedestrian ||
            addr.suburb ||
            addr.neighbourhood ||
            `Near ${closestTamale.name}`;

          const area =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            closestTamale.name;

          return NextResponse.json({
            success: true,
            provider: "nominatim",
            coordinates: [lng, lat],
            formattedAddress: osmData.display_name,
            streetAddress: street,
            area,
            city: addr.city || addr.town || "Tamale",
            region: addr.state || "Northern Region",
            country: addr.country || "Ghana",
            matchedTamaleArea: closestTamale.name,
            zoneSlug: closestTamale.zoneSlug,
            zoneName: closestTamale.zoneName,
            distanceToTamaleAreaKm: distanceKm,
          });
        }
      }
    } catch {
      // Nominatim failed, fall through to spatial matching
    }

    // 3. Fallback: Tamale Spatial Boundary Matching
    return NextResponse.json({
      success: true,
      provider: "tamale-spatial",
      coordinates: [lng, lat],
      formattedAddress: `${closestTamale.name}, Tamale, Northern Region, Ghana`,
      streetAddress: `Near ${closestTamale.commonLandmarks[0] || closestTamale.name}`,
      area: closestTamale.name,
      city: "Tamale",
      region: "Northern Region",
      country: "Ghana",
      matchedTamaleArea: closestTamale.name,
      zoneSlug: closestTamale.zoneSlug,
      zoneName: closestTamale.zoneName,
      distanceToTamaleAreaKm: distanceKm,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to reverse geocode location." },
      { status: 500 }
    );
  }
}
