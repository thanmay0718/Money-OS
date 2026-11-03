import React from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ theme = 'light', onChange }) {
  const isDark = theme === 'dark'

  return (
    <div
      role="group"
      aria-label="Theme toggle"
      className={`fixed bottom-6 right-6 z-50 inline-flex items-center p-1 rounded-full border backdrop-blur-xl shadow-xl transition-all duration-300 ${
        isDark
          ? 'bg-[#131316]/90 border-[rgba(243,240,232,0.14)] text-[#F3F0E8]'
          : 'bg-[#FFFFFF]/90 border-[rgba(21,21,20,0.12)] text-[#151514]'
      }`}
    >
      {/* Light Button */}
      <button
        type="button"
        onClick={() => onChange('light')}
        aria-pressed={!isDark}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 ${
          !isDark
            ? 'bg-[#151514] text-[#FFFFFF] shadow-sm'
            : 'text-[#8F8B82] hover:text-[#F3F0E8]'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>

      {/* Dark Button */}
      <button
        type="button"
        onClick={() => onChange('dark')}
        aria-pressed={isDark}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 ${
          isDark
            ? 'bg-[#F3F0E8] text-[#09090B] shadow-sm font-semibold'
            : 'text-[#6A6862] hover:text-[#151514]'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
    </div>
  )
}
