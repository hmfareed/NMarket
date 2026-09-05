import React from "react";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";
import BottomNav from "@/components/customer/BottomNav";
import LocationTrackingModal from "@/components/customer/LocationTrackingModal";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocationProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col pb-16 sm:pb-0 font-sans">
          {children}
          <BottomNav />
          <LocationTrackingModal />
        </div>
      </CartProvider>
    </LocationProvider>
  );
}
