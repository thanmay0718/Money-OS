"use client"

import React, { useState, useEffect } from "react"
import SculptureHero from "@/components/ui/sculpture-hero"
import { HERO_IMAGES } from "@/lib/hero-images"
import TrustStrip from "@/components/landing/TrustStrip"
import FeaturesBento from "@/components/landing/FeaturesBento"
import HowItWorks from "@/components/landing/HowItWorks"
import SecuritySection from "@/components/landing/SecuritySection"
import FaqSection from "@/components/landing/FaqSection"
import FinalCta from "@/components/landing/FinalCta"
import LandingFooter from "@/components/landing/LandingFooter"
import ThemeToggle from "@/components/landing/ThemeToggle"

export default function Page() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const isDark = theme === "dark"

  useEffect(() => {
    const handleHeroThemeClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const btn = target.closest(".sh-theme")
      if (btn) {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"))
      }
    }
    document.addEventListener("click", handleHeroThemeClick)
    return () => document.removeEventListener("click", handleHeroThemeClick)
  }, [])

  return (
    <main
      className={`w-full min-h-screen flex flex-col font-sans transition-colors duration-500 overflow-x-hidden ${
        isDark
          ? "bg-[#09090B] text-[#F3F0E8] selection:bg-[#F3F0E8]/20 selection:text-[#F3F0E8]"
          : "bg-[#EBE9E5] text-[#151514] selection:bg-[#151514]/15 selection:text-[#151514]"
      }`}
    >
      {/* Sculpture Hero */}
      <SculptureHero
        src={HERO_IMAGES.src}
        darkSrc={HERO_IMAGES.darkSrc}
        mobileSrc={HERO_IMAGES.mobileSrc}
        mobileDarkSrc={HERO_IMAGES.mobileDarkSrc}
        imageAlt="Abstract sculpture of interwoven filaments and particles"
        theme={theme}
        themeToggle={true}
        background="#EBE9E5"
        darkBackground="#09090B"
        textColor={isDark ? "#F3F0E8" : "#151514"}
        accentColor={isDark ? "#F3F0E8" : "#151514"}
        brand="Money OS"
        navLinks={[
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
          { label: "Security", href: "#security" },
          { label: "FAQ", href: "#faq" },
        ]}
        navCta={{ label: "Sign in", href: "/login" }}
        eyebrow="The operating system for your money"
        headline={"Money that\nmoves with you."}
        headlineAccent="moves with you."
        body="Net worth, cash flow, and goals in one calm place. Money OS connects the dots across your accounts and tells you what to do next."
        primaryCta={{ label: "Get started free", href: "/signup" }}
        secondaryCta={{ label: "See how it works", href: "#how-it-works" }}
        hint="Move across the form"
        hintTouch="Touch the form"
        backdropText="money"
        strength={1}
        radius={220}
        particleDensity={1}
        particleSpread={1}
        dotSize={1}
        turbulence={1}
        liquid={1}
        streaks={true}
        restStyle="image"
        returnSpeed={1}
        ambient={false}
        ambientIntensity={1}
        speed={1}
        intro={false}
        height="100svh"
      />

      {/* Floating Theme Toggle Pill with both Light & Dark buttons */}
      <ThemeToggle theme={theme} onChange={(t) => setTheme(t)} />

      <TrustStrip isDark={isDark} />
      <FeaturesBento isDark={isDark} />
      <HowItWorks isDark={isDark} />
      <SecuritySection isDark={isDark} />
      <FaqSection isDark={isDark} />
      <FinalCta isDark={isDark} />
      <LandingFooter isDark={isDark} />
    </main>
  )
}
