import React from "react"
import SculptureHero from "@/components/ui/sculpture-hero"
import { HERO_IMAGES } from "@/lib/hero-images"
import TrustStrip from "@/components/landing/TrustStrip"
import FeaturesBento from "@/components/landing/FeaturesBento"
import HowItWorks from "@/components/landing/HowItWorks"
import SecuritySection from "@/components/landing/SecuritySection"
import FaqSection from "@/components/landing/FaqSection"
import FinalCta from "@/components/landing/FinalCta"
import LandingFooter from "@/components/landing/LandingFooter"

export const metadata = {
  title: "Money OS: The operating system for your money",
  description:
    "Net worth, cash flow, goals and forecasts in one calm place. Money OS connects the dots across your accounts and tells you what to do next.",
  openGraph: {
    title: "Money OS: The operating system for your money",
    description:
      "Net worth, cash flow, goals and forecasts in one calm place. Money OS connects the dots across your accounts and tells you what to do next.",
    type: "website",
    images: [
      {
        url: "https://cdn.21st.dev/assets/mirror/ae/ae8c3de9003460e59182e950ccd345f68f27f9d0e4808b64c92c962a4eca7120.webp",
        width: 2400,
        height: 960,
        alt: "Money OS Sculpture Hero",
      },
    ],
  },
}

export default async function Page() {
  return (
    <main className="w-full min-h-screen bg-[#EBE9E5] text-[#151514] flex flex-col font-sans overflow-x-hidden selection:bg-[#151514]/15 selection:text-[#151514]">
      {/* Sculpture Hero */}
      <SculptureHero
        src={HERO_IMAGES.src}
        darkSrc={HERO_IMAGES.darkSrc}
        mobileSrc={HERO_IMAGES.mobileSrc}
        mobileDarkSrc={HERO_IMAGES.mobileDarkSrc}
        imageAlt="Abstract sculpture of interwoven filaments and particles"
        theme="light"
        themeToggle={true}
        background="#EBE9E5"
        darkBackground="#111110"
        textColor="#151514"
        accentColor="#151514"
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

      <TrustStrip />
      <FeaturesBento />
      <HowItWorks />
      <SecuritySection />
      <FaqSection />
      <FinalCta />
      <LandingFooter />
    </main>
  )
}
