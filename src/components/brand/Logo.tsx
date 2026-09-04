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
  // Height classes for crisp display across viewports
  const heightClasses = {
    sm: "h-7",
    md: "h-9 sm:h-10",
    lg: "h-12 sm:h-14",
  };

  // Dedicated transparent dark-mode logo (white text & cart + gold ribbon) vs transparent light-mode logo
  const logoSrc = variant === "dark" ? "/logo-dark.png" : "/logo-transparent.png";

  const content = (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Official NorthMarket Logo - Seamlessly integrated without white background */}
      <div className="relative flex items-center transition-transform hover:scale-105 duration-200">
        <img
          src={logoSrc}
          alt="NorthMarket"
          className={`${heightClasses[size]} w-auto object-contain drop-shadow-xs`}
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
