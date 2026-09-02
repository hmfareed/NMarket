import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NMarket — Local Fast Marketplace in Tamale & Northern Ghana",
  description:
    "Shop from trusted local sellers in Tamale with fast 1–3 hour delivery. Mobile Money supported.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased flex flex-col">{children}</body>
    </html>
  );
}
