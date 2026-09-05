/**
 * Google Maps Dynamic Loader and Utilities for NMarket
 */

declare global {
  interface Window {
    google?: any;
    initNMarketGoogleMaps?: () => void;
  }
}

let loadPromise: Promise<boolean> | null = null;

export function isGoogleMapsAvailable(): boolean {
  return typeof window !== "undefined" && !!window.google?.maps;
}

export function loadGoogleMaps(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  if (isGoogleMapsAvailable()) {
    return Promise.resolve(true);
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    console.info("Google Maps API key not configured. Using high-precision GPS canvas fallback.");
    return Promise.resolve(false);
  }

  loadPromise = new Promise<boolean>((resolve) => {
    // Check if script element already exists
    const existingScript = document.getElementById("google-maps-sdk");
    if (existingScript) {
      if (window.google?.maps) return resolve(true);
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = (err) => {
      console.warn("Failed to load Google Maps script:", err);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Modern custom map styling for clean e-commerce delivery pinpointing
 */
export const NMARKET_MAP_STYLE = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ lightness: 20 }],
  },
];
