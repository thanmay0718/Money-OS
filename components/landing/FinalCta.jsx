import React from 'react'
import { ArrowRight } from 'lucide-react'

export default function FinalCta({ isDark = false, onSignUp, onSignIn }) {
  return (
    <section
      className={`relative z-10 w-full py-24 md:py-32 border-t transition-colors duration-300 ${
        isDark
          ? 'bg-[#09090B] border-[rgba(243,240,232,0.08)] text-[#F3F0E8]'
          : 'bg-[#EBE9E5] border-[rgba(21,21,20,0.08)] text-[#151514]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight mb-5 leading-tight">
          A calmer relationship with <br />
          <span className="italic">your money.</span>
        </h2>
        <p className={`text-base max-w-lg mx-auto mb-10 leading-relaxed font-sans ${isDark ? 'text-[#8F8B82]' : 'text-[#6A6862]'}`}>
          No complicated math or spreadsheets. Just complete clarity over your net worth and what you can safely spend today.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/signup"
            onClick={(e) => {
              if (onSignUp) {
                e.preventDefault()
                onSignUp()
              }
            }}
            className={`inline-flex items-center gap-2 h-12 px-8 rounded-full font-medium text-sm transition-all shadow-sm active:scale-95 ${
              isDark
                ? 'bg-[#F3F0E8] text-[#09090B] hover:opacity-90'
                : 'bg-[#151514] text-[#FFFFFF] hover:opacity-90'
            }`}
          >
            <span>Get started free</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/login"
            onClick={(e) => {
              if (onSignIn) {
                e.preventDefault()
                onSignIn()
              }
            }}
            className={`inline-flex items-center h-12 px-7 rounded-full border font-medium text-sm transition-all ${
              isDark
                ? 'border-[rgba(243,240,232,0.18)] bg-[#131316] text-[#F3F0E8] hover:bg-[#1B1B20]'
                : 'border-[rgba(21,21,20,0.18)] bg-[#FFFFFF] text-[#151514] hover:bg-[#F6F5F2]'
            }`}
          >
            Sign in
          </a>
        </div>
      </div>
    </section>
  )
}
