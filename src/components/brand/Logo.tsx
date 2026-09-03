import React from "react";
import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark" | "pill";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({
  variant = "light",
  size = "md",
  showTagline = false,
  href = "/",
  className = "",
}: LogoProps) {
  // Generous height classes so the logo is prominent and crisp
  const heightClasses = {
    sm: "h-8",
    md: "h-11 sm:h-12",
    lg: "h-14 sm:h-16",
  };

  const content = (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Official NorthMarket Logo - Tightly cropped for maximum prominence */}
      <div
        className={`relative flex items-center transition-transform hover:scale-105 duration-200 ${
          variant === "dark"
            ? "bg-white p-1 rounded-xl shadow-xs"
            : ""
        }`}
      >
        <img
          src="/logo.png"
          alt="NorthMarket"
          className={`${heightClasses[size]} w-auto object-contain`}
        />
      </div>

      {showTagline && (
        <span
          className={`text-[11px] font-semibold tracking-wide hidden sm:block ${
            variant === "dark" ? "text-amber-400" : "text-slate-500"
          }`}
        >
          Shop local. Get it faster.
        </span>
      )}
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
