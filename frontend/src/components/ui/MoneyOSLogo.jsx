// src/components/ui/MoneyOSLogo.jsx — MoneyOS brand mark
import React from 'react'

/**
 * MoneyOS Logo — A stylized "M" with ascending chart bars forming
 * a financial growth motif inside a rounded square.
 *
 * @param {number} size - Width and height in px (default 32)
 * @param {string} className - Additional CSS classes
 */
export default function MoneyOSLogo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background rounded square with gradient */}
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C3ABFA" />
          <stop offset="100%" stopColor="#8E6BE8" />
        </linearGradient>
        <linearGradient id="barGlow" x1="0" y1="32" x2="0" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="12" fill="url(#logoBg)" />

      {/* Inner highlight */}
      <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />

      {/* Stylized M as ascending chart bars */}
      <g fill="#18151F">
        {/* Left bar of M */}
        <rect x="8" y="10" width="4.5" height="20" rx="2" />
        {/* Left-center descending bar */}
        <rect x="14.5" y="18" width="4.5" height="12" rx="2" />
        {/* Right-center ascending bar */}
        <rect x="21" y="14" width="4.5" height="16" rx="2" />
        {/* Right bar of M — tallest, showing growth */}
        <rect x="27.5" y="8" width="4.5" height="22" rx="2" />
      </g>

      {/* Subtle shine overlay */}
      <rect x="8" y="10" width="4.5" height="20" rx="2" fill="url(#barGlow)" opacity="0.5" />
      <rect x="14.5" y="18" width="4.5" height="12" rx="2" fill="url(#barGlow)" opacity="0.4" />
      <rect x="21" y="14" width="4.5" height="16" rx="2" fill="url(#barGlow)" opacity="0.4" />
      <rect x="27.5" y="8" width="4.5" height="22" rx="2" fill="url(#barGlow)" opacity="0.5" />
    </svg>
  )
}
