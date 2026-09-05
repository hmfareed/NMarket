"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CustomerLocationState {
  coordinates: [number, number]; // [longitude, latitude]
  accuracyMeters?: number;
  formattedAddress?: string;
  streetAddress?: string;
  area: string;
  city: string;
  region: string;
  zoneName?: string;
  isGpsVerified: boolean;
}

export interface SavedAddressItem {
  _id?: string;
  label: string;
  recipient: string;
  phone: string;
  region: string;
  city: string;
  area: string;
  streetAddress?: string;
  formattedAddress?: string;
  landmark?: string;
  deliveryInstructions?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  accuracyMeters?: number;
  isDefault: boolean;
}

interface LocationContextType {
  currentLocation: CustomerLocationState | null;
  setCurrentLocation: (loc: CustomerLocationState | null) => void;
  selectedArea: string;
  setSelectedArea: (area: string) => void;
  isPromptOpen: boolean;
  openLocationPrompt: () => void;
  closeLocationPrompt: () => void;
  isTracking: boolean;
  trackingAccuracy: number | null;
  trackingError: string | null;
  savedAddresses: SavedAddressItem[];
  refreshSavedAddresses: () => Promise<void>;
  detectExactGpsLocation: () => Promise<CustomerLocationState | null>;
  saveLocationAsAddress: (params: {
    label: string;
    recipient: string;
    phone: string;
    landmark?: string;
    deliveryInstructions?: string;
    isDefault?: boolean;
    locationOverride?: CustomerLocationState;
  }) => Promise<{ success: boolean; error?: string }>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "nmarket_customer_location_v1";

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocationState] = useState<CustomerLocationState | null>(null);
  const [selectedArea, setSelectedAreaState] = useState<string>("Tamale Central");
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [trackingAccuracy, setTrackingAccuracy] = useState<number | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);

  // Wrap state updater to persist in localStorage
  const setCurrentLocation = useCallback((loc: CustomerLocationState | null) => {
    setCurrentLocationState(loc);
    if (typeof window !== "undefined") {
      if (loc) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loc));
        if (loc.area) setSelectedAreaState(loc.area);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  const setSelectedArea = useCallback((area: string) => {
    setSelectedAreaState(area);
  }, []);

  const openLocationPrompt = useCallback(() => {
    setTrackingError(null);
    setIsPromptOpen(true);
  }, []);

  const closeLocationPrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  // Refresh saved addresses from backend
  const refreshSavedAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/addresses");
      if (res.ok) {
        const data = await res.json();
        const list = data.addresses || [];
        setSavedAddresses(list);

        const defaultAddr = list.find((a: SavedAddressItem) => a.isDefault) || list[0];
        if (defaultAddr) {
          if (defaultAddr.area) setSelectedAreaState(defaultAddr.area);
          if (defaultAddr.location?.coordinates) {
            setCurrentLocationState({
              coordinates: defaultAddr.location.coordinates,
              accuracyMeters: defaultAddr.accuracyMeters,
              formattedAddress: defaultAddr.formattedAddress || defaultAddr.streetAddress,
              streetAddress: defaultAddr.streetAddress,
              area: defaultAddr.area,
              city: defaultAddr.city || "Tamale",
              region: defaultAddr.region || "Northern Region",
              isGpsVerified: true,
            });
          }
        }
      }
    } catch {}
  }, []);

  // Perform High-Accuracy GPS satellite detection
  const detectExactGpsLocation = useCallback(async (): Promise<CustomerLocationState | null> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setTrackingError("GPS Geolocation is not supported by your browser/device.");
      return null;
    }

    setIsTracking(true);
    setTrackingError(null);

    return new Promise((resolve) => {
      // High-accuracy GPS tracking options
      const geoOptions: PositionOptions = {
        enableHighAccuracy: true, // Uses hardware GPS satellites over coarse network
        timeout: 20000,
        maximumAge: 0, // Force fresh satellite reading, no cached coords
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          setTrackingAccuracy(accuracy);

          try {
            // Reverse geocode via Google Maps / server route
            const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
            if (res.ok) {
              const geoData = await res.json();

              const locState: CustomerLocationState = {
                coordinates: [lng, lat],
                accuracyMeters: accuracy,
                formattedAddress: geoData.formattedAddress,
                streetAddress: geoData.streetAddress,
                area: geoData.area || geoData.matchedTamaleArea || "Tamale Central",
                city: geoData.city || "Tamale",
                region: geoData.region || "Northern Region",
                zoneName: geoData.zoneName,
                isGpsVerified: true,
              };

              setCurrentLocation(locState);
              setIsTracking(false);
              resolve(locState);
              return;
            }
          } catch (err) {
            console.warn("Reverse geocode request failed:", err);
          }

          // Fallback state if geocode network call fails
          const fallbackLoc: CustomerLocationState = {
            coordinates: [lng, lat],
            accuracyMeters: accuracy,
            formattedAddress: `Tamale Metropolis (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            streetAddress: `GPS Pinpoint (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            area: "Tamale Central",
            city: "Tamale",
            region: "Northern Region",
            isGpsVerified: true,
          };

          setCurrentLocation(fallbackLoc);
          setIsTracking(false);
          resolve(fallbackLoc);
        },
        (err) => {
          setIsTracking(false);
          let msg = "Could not acquire GPS location.";
          if (err.code === err.PERMISSION_DENIED) {
            msg = "Location permission denied. Please allow GPS access in your browser settings to track your exact location.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = "GPS satellites signal unavailable. Please ensure your device location is enabled.";
          } else if (err.code === err.TIMEOUT) {
            msg = "GPS location request timed out. Please try again.";
          }
          setTrackingError(msg);
          resolve(null);
        },
        geoOptions
      );
    });
  }, [setCurrentLocation]);

  // Save current detected location to user's MongoDB address book
  const saveLocationAsAddress = useCallback(
    async (params: {
      label: string;
      recipient: string;
      phone: string;
      landmark?: string;
      deliveryInstructions?: string;
      isDefault?: boolean;
      locationOverride?: CustomerLocationState;
    }) => {
      const targetLoc = params.locationOverride || currentLocation;
      if (!targetLoc) {
        return { success: false, error: "No location coordinates detected to save." };
      }

      try {
        const payload = {
          label: params.label || "Home",
          recipient: params.recipient,
          phone: params.phone,
          region: targetLoc.region || "Northern Region",
          city: targetLoc.city || "Tamale",
          area: targetLoc.area || "Tamale Central",
          streetAddress: targetLoc.streetAddress || targetLoc.formattedAddress,
          formattedAddress: targetLoc.formattedAddress,
          landmark: params.landmark,
          deliveryInstructions: params.deliveryInstructions,
          location: {
            type: "Point",
            coordinates: targetLoc.coordinates,
          },
          accuracyMeters: targetLoc.accuracyMeters,
          isDefault: params.isDefault ?? true,
        };

        const res = await fetch("/api/customer/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save address to account.");
        }

        await refreshSavedAddresses();
        setCurrentLocation(targetLoc);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to save address." };
      }
    },
    [currentLocation, refreshSavedAddresses, setCurrentLocation]
  );

  // Check login intent & load stored location on mount
  useEffect(() => {
    // 1. Restore cached location from localStorage
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setCurrentLocationState(parsed);
          if (parsed.area) setSelectedAreaState(parsed.area);
        }
      } catch {}
    }

    // 2. Fetch saved addresses
    refreshSavedAddresses();

    // 3. Check if user just logged in or if ?loginPromptLocation=1 is present
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const hasLoginParam = urlParams.get("loginPromptLocation") === "1";
      const hasSessionFlag = sessionStorage.getItem("nmarket_just_logged_in") === "true";

      if (hasLoginParam || hasSessionFlag) {
        // Clear flags
        sessionStorage.removeItem("nmarket_just_logged_in");
        if (hasLoginParam) {
          urlParams.delete("loginPromptLocation");
          const cleanUrl =
            window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "");
          window.history.replaceState({}, "", cleanUrl);
        }

        // Open location prompt modal immediately!
        setTimeout(() => {
          setIsPromptOpen(true);
        }, 400);
      }
    }
  }, [refreshSavedAddresses]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        selectedArea,
        setSelectedArea,
        isPromptOpen,
        openLocationPrompt,
        closeLocationPrompt,
        isTracking,
        trackingAccuracy,
        trackingError,
        savedAddresses,
        refreshSavedAddresses,
        detectExactGpsLocation,
        saveLocationAsAddress,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

const defaultLocationContext: LocationContextType = {
  currentLocation: null,
  setCurrentLocation: () => {},
  selectedArea: "Tamale Central",
  setSelectedArea: () => {},
  isPromptOpen: false,
  openLocationPrompt: () => {},
  closeLocationPrompt: () => {},
  isTracking: false,
  trackingAccuracy: null,
  trackingError: null,
  savedAddresses: [],
  refreshSavedAddresses: async () => {},
  detectExactGpsLocation: async () => null,
  saveLocationAsAddress: async () => ({ success: false, error: "Location provider not mounted" }),
};

export function useLocation() {
  const ctx = useContext(LocationContext);
  return ctx || defaultLocationContext;
}
