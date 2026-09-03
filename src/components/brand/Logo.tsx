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
  const iconSizes = {
    sm: "h-7 w-7 text-xs rounded-lg",
    md: "h-9 w-9 text-sm rounded-xl",
    lg: "h-12 w-12 text-base rounded-2xl",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon: Shopping Bag with N' */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center font-black tracking-tighter shadow-xs transition-transform hover:scale-105 ${
          variant === "dark"
            ? "bg-amber-500 text-dark-900"
            : "bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        }`}
      >
        {/* Subtle bag handle curve */}
        <div className="absolute -top-1 w-3.5 h-2 border-2 border-amber-400 rounded-t-full pointer-events-none opacity-80" />
        <span className="font-extrabold tracking-tight">N&apos;</span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span
            className={`font-black tracking-tight ${textSizes[size]} ${
              variant === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            North<span className="text-amber-500">Market</span>
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[10px] font-medium tracking-wide -mt-1 ${
              variant === "dark" ? "text-amber-400/90" : "text-slate-500"
            }`}
          >
            Shop local. Get it faster.
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
