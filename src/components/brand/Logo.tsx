import React from "react";
import Link from "next/link";
import Image from "next/image";

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
  const heightClasses = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-12 sm:h-14",
  };

  const content = (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Official NorthMarket Logo from @/UI/logo */}
      <div
        className={`relative ${heightClasses[size]} flex items-center transition-transform hover:scale-105 duration-200 ${
          variant === "dark"
            ? "bg-white/10 p-1 rounded-xl backdrop-blur-xs"
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
          className={`text-[10px] font-medium tracking-wide hidden sm:block ${
            variant === "dark" ? "text-amber-400/90" : "text-slate-500"
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
