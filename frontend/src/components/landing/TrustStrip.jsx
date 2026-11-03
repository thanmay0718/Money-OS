import React from 'react'
import { ShieldCheck, Lock, EyeOff } from 'lucide-react'

export default function TrustStrip({ isDark = false }) {
  return (
    <section
      className={`relative z-10 w-full border-y transition-colors duration-300 ${
        isDark
          ? 'border-[rgba(243,240,232,0.08)] bg-[#09090B] text-[#8F8B82]'
          : 'border-[rgba(21,21,20,0.08)] bg-[#EBE9E5] text-[#6A6862]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs md:text-sm font-mono tracking-wide">
          <div className="flex items-center gap-2">
            <Lock className={`w-4 h-4 ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`} />
            <span className={`font-medium ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`}>
              Bank-grade 256-bit encryption
            </span>
          </div>
          <span className={isDark ? 'hidden sm:inline text-[rgba(243,240,232,0.2)]' : 'hidden sm:inline text-[rgba(21,21,20,0.2)]'}>
            ·
          </span>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`} />
            <span className={`font-medium ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`}>
              Read-only account connections
            </span>
          </div>
          <span className={isDark ? 'hidden sm:inline text-[rgba(243,240,232,0.2)]' : 'hidden sm:inline text-[rgba(21,21,20,0.2)]'}>
            ·
          </span>
          <div className="flex items-center gap-2">
            <EyeOff className={`w-4 h-4 ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`} />
            <span className={`font-medium ${isDark ? 'text-[#F3F0E8]' : 'text-[#151514]'}`}>
              Your data is never sold
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
