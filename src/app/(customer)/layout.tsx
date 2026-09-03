import React from "react";
import { CartProvider } from "@/context/CartContext";
import BottomNav from "@/components/customer/BottomNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col pb-16 sm:pb-0 font-sans">
        {children}
        <BottomNav />
      </div>
    </CartProvider>
  );
}
