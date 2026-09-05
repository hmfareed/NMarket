"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Navigation,
  Sparkles,
  Building,
  Home,
  Briefcase,
  Store,
  ChevronRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useLocation, CustomerLocationState } from "@/context/LocationContext";
import { loadGoogleMaps, isGoogleMapsAvailable, NMARKET_MAP_STYLE } from "@/lib/google-maps";
import { TAMALE_AREAS } from "@/lib/constants/tamale-areas";

type ModalStep = "PROMPT" | "TRACKING" | "CONFIRM_SAVE" | "SUCCESS";

export default function LocationTrackingModal() {
  const {
    isPromptOpen,
    closeLocationPrompt,
    currentLocation,
    setCurrentLocation,
    detectExactGpsLocation,
    saveLocationAsAddress,
    setSelectedArea,
    trackingAccuracy,
    isTracking,
    trackingError,
  } = useLocation();

  const [step, setStep] = useState<ModalStep>("PROMPT");
  const [activeLoc, setActiveLoc] = useState<CustomerLocationState | null>(null);

  // Form fields for saving address
  const [addressLabel, setAddressLabel] = useState<string>("Home");
  const [recipient, setRecipient] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>("");
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Google Maps DOM container ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const circleInstance = useRef<any>(null);
  const [mapsSdkLoaded, setMapsSdkLoaded] = useState<boolean>(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isPromptOpen) {
      setStep("PROMPT");
      setSaveError(null);

      // Pre-fill user details if logged in
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            if (data.user.name) setRecipient(data.user.name);
            if (data.user.phone) setPhone(data.user.phone);
          }
        })
        .catch(() => {});

      // Pre-load Google Maps SDK in background
      loadGoogleMaps().then((loaded) => {
        setMapsSdkLoaded(loaded);
      });
    }
  }, [isPromptOpen]);

  // Handle GPS detection trigger
  const handleStartTracking = async () => {
    setStep("TRACKING");
    const loc = await detectExactGpsLocation();
    if (loc) {
      setActiveLoc(loc);
      initOrUpdateMap(loc);
    }
  };

  // Reverse geocode when pin moves
  const reverseGeocodeCoords = useCallback(async (lat: number, lng: number) => {
    setIsResolvingAddress(true);
    try {
      const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setActiveLoc((prev) => ({
          coordinates: [lng, lat],
          accuracyMeters: prev?.accuracyMeters || 5,
          formattedAddress: data.formattedAddress,
          streetAddress: data.streetAddress,
          area: data.area || data.matchedTamaleArea || "Tamale Central",
          city: data.city || "Tamale",
          region: data.region || "Northern Region",
          zoneName: data.zoneName,
          isGpsVerified: true,
        }));
      }
    } catch {
      // fallback
    } finally {
      setIsResolvingAddress(false);
    }
  }, []);

  // Initialize or center Google Map
  const initOrUpdateMap = useCallback(
    (loc: CustomerLocationState) => {
      const [lng, lat] = loc.coordinates;

      if (typeof window !== "undefined" && window.google?.maps && mapContainerRef.current) {
        const center = new window.google.maps.LatLng(lat, lng);

        if (!googleMapInstance.current) {
          // Create Map
          const map = new window.google.maps.Map(mapContainerRef.current, {
            center,
            zoom: 17,
            mapTypeId: "roadmap",
            styles: NMARKET_MAP_STYLE,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          // Draggable Pin Marker
          const marker = new window.google.maps.Marker({
            position: center,
            map,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
            title: "Your exact delivery doorstep",
            icon: {
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
              fillColor: "#059669", // Emerald 600
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: 2,
              anchor: new window.google.maps.Point(12, 22),
            },
          });

          // Accuracy circle
          const accuracyRadius = loc.accuracyMeters || 15;
          const circle = new window.google.maps.Circle({
            map,
            radius: accuracyRadius,
            fillColor: "#10B981",
            fillOpacity: 0.15,
            strokeColor: "#059669",
            strokeOpacity: 0.5,
            strokeWeight: 1,
            center,
          });

          // Listen to marker drag end
          marker.addListener("dragend", () => {
            const pos = marker.getPosition();
            if (pos) {
              const newLat = pos.lat();
              const newLng = pos.lng();
              circle.setCenter(pos);
              reverseGeocodeCoords(newLat, newLng);
            }
          });

          // Click on map to move marker
          map.addListener("click", (e: any) => {
            if (e.latLng) {
              marker.setPosition(e.latLng);
              circle.setCenter(e.latLng);
              reverseGeocodeCoords(e.latLng.lat(), e.latLng.lng());
            }
          });

          googleMapInstance.current = map;
          markerInstance.current = marker;
          circleInstance.current = circle;
        } else {
          // Update existing
          googleMapInstance.current.setCenter(center);
          if (markerInstance.current) markerInstance.current.setPosition(center);
          if (circleInstance.current) {
            circleInstance.current.setCenter(center);
            circleInstance.current.setRadius(loc.accuracyMeters || 15);
          }
        }
      }
    },
    [reverseGeocodeCoords]
  );

  // When step changes to TRACKING and SDK is ready, trigger map
  useEffect(() => {
    if (step === "TRACKING" && activeLoc) {
      setTimeout(() => {
        initOrUpdateMap(activeLoc);
      }, 100);
    }
  }, [step, activeLoc, initOrUpdateMap]);

  // Save address action
  const handleSaveConfirmedAddress = async () => {
    if (!activeLoc) return;
    if (!recipient.trim() || !phone.trim()) {
      setSaveError("Please enter recipient name and phone number.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const res = await saveLocationAsAddress({
      label: addressLabel,
      recipient: recipient.trim(),
      phone: phone.trim(),
      landmark: landmark.trim(),
      deliveryInstructions: deliveryInstructions.trim(),
      isDefault,
      locationOverride: activeLoc,
    });

    setIsSaving(false);

    if (res.success) {
      setStep("SUCCESS");
      setTimeout(() => {
        closeLocationPrompt();
      }, 1600);
    } else {
      setSaveError(res.error || "Could not save address. Please try again.");
    }
  };

  // Quick manual area pick fallback
  const handleSelectAreaManually = (areaName: string) => {
    const matched = TAMALE_AREAS.find((a) => a.name === areaName);
    const coords: [number, number] = matched ? matched.coordinates : [-0.8400, 9.4070];

    const manualLoc: CustomerLocationState = {
      coordinates: coords,
      accuracyMeters: 50,
      area: areaName,
      streetAddress: `${areaName} Main Hub`,
      formattedAddress: `${areaName}, Tamale, Ghana`,
      city: "Tamale",
      region: "Northern Region",
      isGpsVerified: false,
    };

    setCurrentLocation(manualLoc);
    setSelectedArea(areaName);
    setActiveLoc(manualLoc);
    setStep("CONFIRM_SAVE");
  };

  if (!isPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Tamale Delivery GPS</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Google Maps
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">100% Doorstep Pinpoint Accuracy</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeLocationPrompt}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: INITIAL PROMPT (Triggered on login) */}
          {step === "PROMPT" && (
            <div className="space-y-4 text-center py-2">
              <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Crosshair className="h-10 w-10 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-base font-black text-slate-900">
                  Welcome! Allow GPS Location Access
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To ensure rapid 45–90 min delivery across Tamale, NorthMarket uses high-precision GPS to locate your exact building or shop.
                </p>
              </div>

              {/* Accuracy Features Checklist */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real-time GPS satellite lock (accuracy down to ±3 meters)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Interactive Google Map pin fine-tuning for your gate</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Automatic reverse geocoding to your Tamale community</span>
                </div>
              </div>

              {trackingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 text-left">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{trackingError}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartTracking}
                  disabled={isTracking}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {isTracking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Locking onto GPS Satellites...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className="h-4 w-4" />
                      <span>Allow Location & Track Exact GPS</span>
                    </>
                  )}
                </button>

                {/* Manual Dropdown Selector */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Or select your Tamale community manually:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {TAMALE_AREAS.slice(0, 8).map((area) => (
                      <button
                        key={area.slug}
                        type="button"
                        onClick={() => handleSelectAreaManually(area.name)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 text-left text-[11px] font-bold transition truncate"
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeLocationPrompt}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 pt-1"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TRACKING & INTERACTIVE GOOGLE MAP */}
          {step === "TRACKING" && (
            <div className="space-y-3">
              {/* Satellite Accuracy Status Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  {isTracking ? (
                    <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  )}
                  <span>
                    {isTracking
                      ? "Pinging GPS Satellites..."
                      : `GPS Lock Active: ±${trackingAccuracy || 4}m Precision`}
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                  100% Accuracy
                </span>
              </div>

              {/* Map View Canvas */}
              <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                {/* Google Map Target */}
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Fallback Display if Google Maps JS is not yet loaded */}
                {!mapsSdkLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900/90 to-slate-950 text-white text-center">
                    <Crosshair className="h-10 w-10 text-emerald-400 animate-spin mb-2" />
                    <p className="text-xs font-bold text-emerald-400">
                      High-Precision Coordinates Locked
                    </p>
                    <p className="text-[11px] text-slate-300 font-mono mt-1">
                      {activeLoc ? `${activeLoc.coordinates[1].toFixed(5)}° N, ${activeLoc.coordinates[0].toFixed(5)}° W` : "Acquiring..."}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 max-w-xs">
                      GPS Accuracy ±{trackingAccuracy || 4}m • Tamale Metropolis
                    </p>
                  </div>
                )}

                {/* Top Overlay Instruction */}
                <div className="absolute top-2 left-2 right-2 pointer-events-none">
                  <div className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-xl font-medium inline-flex items-center gap-1.5 shadow-md">
                    <Info className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Drag marker to fine-tune your exact door or entrance</span>
                  </div>
                </div>

                {/* Resolving indicator */}
                {isResolvingAddress && (
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                    <span>Resolving street address...</span>
                  </div>
                )}
              </div>

              {/* Detected Address Details Card */}
              {activeLoc && (
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Detected Address
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {activeLoc.area}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {activeLoc.streetAddress || activeLoc.formattedAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeLoc.city}, {activeLoc.region} • GPS: {activeLoc.coordinates[1].toFixed(4)}, {activeLoc.coordinates[0].toFixed(4)}
                  </p>
                </div>
              )}

              {/* Navigation button to Step 3: Ask to save */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("PROMPT")}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep("CONFIRM_SAVE")}
                  disabled={!activeLoc}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition"
                >
                  <span>Confirm Location & Save Address</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: "ASKS IF HE WANTS TO SAVE HIS ADDRESS" */}
          {step === "CONFIRM_SAVE" && activeLoc && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-emerald-950">
                    Would you like to save this as your delivery address?
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Saving ensures NorthMarket riders can route immediately to your exact coordinates every time you order.
                  </p>
                </div>
              </div>

              {/* Address Summary Badge */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-extrabold text-slate-900">{activeLoc.area}</span>
                  <span>— {activeLoc.streetAddress || activeLoc.formattedAddress}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono pl-4.5">
                  {activeLoc.city} • Coordinates: [{activeLoc.coordinates[0].toFixed(4)}, {activeLoc.coordinates[1].toFixed(4)}]
                </p>
              </div>

              {saveError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Form Details */}
              <div className="space-y-3">
                {/* Address Label Buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Address Label
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "Home", icon: Home },
                      { id: "Work", icon: Briefcase },
                      { id: "Shop", icon: Store },
                      { id: "Other", icon: Building },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAddressLabel(item.id)}
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            addressLabel === item.id
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. Mohammed Fareed"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Phone Number (For Rider) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="024 123 4567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nearest Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Central Mosque"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Black gate, call on arrival"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-semibold">Set as my default Tamale delivery address</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveConfirmedAddress}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving to your account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Yes, Save Address to Account</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeLoc) {
                        setCurrentLocation(activeLoc);
                        setSelectedArea(activeLoc.area);
                      }
                      closeLocationPrompt();
                    }}
                    className="text-slate-500 hover:text-slate-800 font-bold underline text-[11px]"
                  >
                    Use for now without saving
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("TRACKING")}
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px]"
                  >
                    Adjust pinpoint on map →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === "SUCCESS" && (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Address Saved Successfully!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your high-accuracy GPS coordinates have been saved. Tamale riders will now deliver directly to your exact doorstep.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
