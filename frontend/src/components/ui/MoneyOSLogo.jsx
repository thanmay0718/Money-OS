// src/components/ui/MoneyOSLogo.jsx — Fintrack brand mark
import React from "react";

/**
 * Fintrack Logo — a dark-blue rounded square with a mint growth path.
 *
 * @param {number} size - Width and height in px (default 32)
 * @param {string} className - Additional CSS classes
 */
export default function MoneyOSLogo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="12" y="12" width="96" height="96" rx="28" fill="#0F2F52" />

      <path
        d="M26 78C35 78 38 73 43 66L52 54L64 41L77 48L92 32"
        stroke="#64E2C9"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="26" cy="78" r="6" fill="#F5F7F9" />
    </svg>
  );
}
