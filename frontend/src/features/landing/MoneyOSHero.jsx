import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Wallet,
  Layers,
  Lock,
  Activity,
  ChevronDown,
  Users,
  Sliders,
  CheckCircle2,
  Zap,
  RefreshCw,
} from "lucide-react";
import CrowdCanvas from "./CrowdCanvas";

// Register ScrollTrigger plugin with GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MoneyOSHero({ onSignIn, onSignUp }) {
  const containerRef = useRef(null);
  const heroContentRef = useRef(null);
  const quoteCardRef = useRef(null);
  const cockpitRef = useRef(null);
  const statsBarRef = useRef(null);
  const crowdContainerRef = useRef(null);

  // Interactive Crowd state controls
  const [peepDensity, setPeepDensity] = useState(36);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [spotlightActive, setSpotlightActive] = useState(true);
  const [activePocketIndex, setActivePocketIndex] = useState(0);

  // Dynamic speech bubbles simulating crowd thoughts
  const [currentBubbleIndex, setCurrentBubbleIndex] = useState(0);
  const crowdThoughts = [
    { text: "Where did my weekend salary go?", tag: "UNORGANIZED", status: "warn" },
    { text: "14 forgotten subscriptions billing my card...", tag: "UNORGANIZED", status: "warn" },
    { text: "100% of my capital is allocated in MoneyOS Pockets 🛡️", tag: "ORGANIZED", status: "safe" },
    { text: "Emergency Vault fully secured: 6 Months Runway 🚀", tag: "ORGANIZED", status: "safe" },
    { text: "Zero phantom transfer spikes in my ledgers 📊", tag: "ORGANIZED", status: "safe" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBubbleIndex((prev) => (prev + 1) % crowdThoughts.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [crowdThoughts.length]);

  // Pockets interactive preview
  const demoPockets = [
    {
      name: "Emergency Vault",
      type: "Reserve",
      balance: "₹1,50,000",
      status: "100% Target Met",
      growth: "+4.2% yield",
      icon: ShieldCheck,
      color: "text-positive border-positive/30 bg-positive/10",
      note: "Untouchable 6-month living runway isolated from daily card swipes.",
    },
    {
      name: "Core Living & Utilities",
      type: "Operational",
      balance: "₹38,450",
      status: "34% Monthly Burn",
      growth: "On budget",
      icon: Wallet,
      color: "text-primary border-primary/30 bg-primary/10",
      note: "Rent, groceries, and essential subscriptions automatically ring-fenced.",
    },
    {
      name: "High-Yield Growth",
      type: "Investment",
      balance: "₹1,45,200",
      status: "Active SIP",
      growth: "+18.6% YTD",
      icon: TrendingUp,
      color: "text-accentSoft border-accentSoft/30 bg-accentSoft/10",
      note: "Compounding assets tracked with double-entry arithmetic precision.",
    },
    {
      name: "Spontaneous / Freedom",
      type: "Discretionary",
      balance: "₹24,800",
      status: "Guilt-Free",
      growth: "Replenished",
      icon: Zap,
      color: "text-warning border-warning/30 bg-warning/10",
      note: "Spend without guilt. Transfers never corrupt your expense history.",
    },
  ];

  // GSAP Scroll Animation setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // 1. Initial entrance timeline
      const enterTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      enterTl
        .fromTo(
          heroContentRef.current,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 1.1, delay: 0.1 }
        )
        .fromTo(
          quoteCardRef.current,
          { opacity: 0, scale: 0.94, y: 25 },
          { opacity: 1, scale: 1, y: 0, duration: 0.9 },
          "-=0.7"
        )
        .fromTo(
          statsBarRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          crowdContainerRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.4 },
          "-=0.6"
        );

      // 2. ScrollTrigger sequence: Parallax transition between Quote / Crowd and Cockpit
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=120%",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      // As user scrolls: Quote card and intro float up and fade slightly
      scrollTl
        .to(
          heroContentRef.current,
          {
            y: -90,
            opacity: 0.25,
            scale: 0.94,
            duration: 1,
          },
          0
        )
        // Crowd canvas dims and recedes slightly to emphasize the rising cockpit
        .to(
          crowdContainerRef.current,
          {
            scale: 0.92,
            y: 40,
            opacity: 0.45,
            filter: "blur(2px)",
            duration: 1,
          },
          0
        )
        // The MoneyOS Cockpit emerges in 3D perspective from bottom
        .fromTo(
          cockpitRef.current,
          {
            y: 180,
            opacity: 0,
            scale: 0.9,
            rotateX: 12,
          },
          {
            y: -30,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          0.3
        );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/25"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85vw] max-w-6xl h-[420px] bg-gradient-to-b from-primary/15 via-primarySoft/5 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[45%] right-[10%] w-[450px] h-[350px] bg-accentDeep/10 blur-[130px] pointer-events-none -z-10" />

      {/* Top Glass Navigation Bar */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accentDeep p-[1px] shadow-lavender flex items-center justify-center">
            <div className="w-full h-full bg-card rounded-[11px] flex items-center justify-center font-extrabold text-primary text-lg tracking-wider">
              M
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              MoneyOS
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                v2.4 Live
              </span>
            </span>
            <span className="text-[11px] text-mutedText block -mt-1 font-mono">
              Autonomous Financial Operating System
            </span>
          </div>
        </div>

        {/* Center Pill: Status Engine */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-divider bg-card/70 backdrop-blur-md text-xs font-mono text-secondaryText shadow-subtle">
          <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span>Double-Entry Verified</span>
          <span className="text-divider">•</span>
          <span className="text-primary">100% Real Ledger</span>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold text-secondaryText hover:text-white border border-transparent hover:border-divider transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onSignUp}
            className="px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold bg-primary hover:bg-primarySoft text-background transition-all shadow-lavender flex items-center gap-1.5 active:scale-95"
          >
            Open MoneyOS
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-6 md:pt-10 pb-28 flex flex-col items-center">
        {/* Intro Block: Headline & Tag */}
        <div ref={heroContentRef} className="w-full text-center max-w-4xl flex flex-col items-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primarySoft text-xs font-mono uppercase tracking-wider mb-5 shadow-lavender">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-spin-slow" />
            <span>CLARITY OVER CHAOS // CAPITAL GOVERNANCE</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6">
            The crowd drifts in noise. <br />
            <span className="bg-gradient-to-r from-primary via-primarySoft to-white bg-clip-text text-transparent">
              Be Organized. Master Your Flow.
            </span>
          </h1>

          {/* Highlighted Quote Banner */}
          <div
            ref={quoteCardRef}
            className="relative w-full max-w-3xl rounded-2xl border border-divider bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-subtle text-left mb-8 overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3 border-b border-divider/60 pb-3">
              <span className="text-[11px] font-mono tracking-wider uppercase text-primary flex items-center gap-1.5">
                ✦ FIRST PRINCIPLE OF WEALTH
              </span>
              <span className="text-[11px] font-mono text-mutedText">
                RULE 01 // DISCIPLINE
              </span>
            </div>

            <blockquote className="text-base sm:text-lg md:text-xl font-display italic text-foreground leading-relaxed mb-4">
              “Chaos in your money is chaos in your life. Most people let every rupee wander with the unguided crowd. 
              When you are <span className="text-primary not-italic font-sans font-bold underline decoration-primary/40 underline-offset-4">organized</span> with intentional pockets and verified ledgers, financial freedom stops being an accident — it becomes inevitable math.”
            </blockquote>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-secondaryText">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-semibold text-white">MoneyOS Core Manifesto</span>
                <span className="text-mutedText">— Zero Phantom Leakage</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-positive">● Double-Entry Ledger</span>
                <span className="text-transfer">● Smart Pocket Isolation</span>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={onSignUp}
              className="px-7 py-3 rounded-xl bg-primary hover:bg-primarySoft text-background font-bold text-sm md:text-base transition-all shadow-lavender flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="px-6 py-3 rounded-xl border border-divider hover:border-primary/50 bg-secondary/80 text-foreground font-semibold text-sm md:text-base transition-all backdrop-blur-sm"
            >
              Sign In to Your Workspace
            </button>
          </div>

          {/* Micro Stats Bar */}
          <div
            ref={statsBarRef}
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-mutedText font-mono pt-2"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-positive" />
              <span>BigDecimal Precision Math</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-positive" />
              <span>Zero Phantom Transfer Spikes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-positive" />
              <span>Stateless Bank-Grade Security</span>
            </div>
          </div>
        </div>

        {/* Dynamic Speech Bubble: Floating Crowd Voice */}
        <div className="relative z-30 mt-6 md:mt-10 mb-4 transition-all duration-500">
          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border text-xs md:text-sm backdrop-blur-md shadow-subtle transition-all duration-500 ${
              crowdThoughts[currentBubbleIndex].status === "safe"
                ? "border-positive/40 bg-card/90 text-positive"
                : "border-negative/40 bg-card/90 text-secondaryText"
            }`}
          >
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                crowdThoughts[currentBubbleIndex].status === "safe"
                  ? "bg-positive/20 text-positive"
                  : "bg-negative/20 text-negative"
              }`}
            >
              {crowdThoughts[currentBubbleIndex].tag}
            </span>
            <span className="font-medium text-foreground">
              {crowdThoughts[currentBubbleIndex].text}
            </span>
          </div>
        </div>

        {/* Interactive Crowd Controls Bar */}
        <div className="relative z-30 flex flex-wrap items-center gap-3 px-4 py-2 rounded-full border border-divider bg-card/80 backdrop-blur-md text-xs font-mono text-secondaryText mb-8">
          <div className="flex items-center gap-1 text-primary">
            <Users className="w-3.5 h-3.5" />
            <span>Crowd:</span>
          </div>

          {/* Density Toggles */}
          <div className="flex items-center gap-1 bg-surface px-1 py-0.5 rounded-full border border-divider">
            <button
              onClick={() => setPeepDensity(20)}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                peepDensity === 20 ? "bg-primary text-background font-bold" : "hover:text-white"
              }`}
            >
              Calm (20)
            </button>
            <button
              onClick={() => setPeepDensity(36)}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                peepDensity === 36 ? "bg-primary text-background font-bold" : "hover:text-white"
              }`}
            >
              Active (36)
            </button>
            <button
              onClick={() => setPeepDensity(55)}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                peepDensity === 55 ? "bg-primary text-background font-bold" : "hover:text-white"
              }`}
            >
              Rush (55)
            </button>
          </div>

          <span className="text-divider">|</span>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1.5">
            <span>Speed:</span>
            <button
              onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 1.6 : prev === 1.6 ? 0.7 : 1))}
              className="px-2 py-0.5 rounded bg-surface hover:bg-elevated border border-divider text-white text-[11px] font-bold"
            >
              {speedMultiplier}x
            </button>
          </div>

          <span className="text-divider">|</span>

          {/* Interactive Spotlight toggle */}
          <button
            onClick={() => setSpotlightActive((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-all ${
              spotlightActive
                ? "border-primary/40 bg-primary/15 text-primarySoft"
                : "border-divider bg-surface text-mutedText"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Spotlight: {spotlightActive ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Scroll Indicator Prompt */}
        <div className="relative z-20 flex flex-col items-center gap-1 text-[11px] font-mono text-mutedText uppercase tracking-widest animate-bounce mt-2 mb-12">
          <span>Scroll to inspect the MoneyOS Engine</span>
          <ChevronDown className="w-4 h-4 text-primary" />
        </div>

        {/* RISING SCROLL COCKPIT: MoneyOS Command Deck */}
        <div
          ref={cockpitRef}
          className="relative z-30 w-full max-w-5xl rounded-3xl border border-divider/90 bg-card/95 backdrop-blur-2xl p-6 md:p-10 shadow-2xl mt-4"
          style={{ willChange: "transform, opacity" }}
        >
          {/* Header of Cockpit */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-divider gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-positive" />
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Autonomous Wealth Architecture
                </h3>
              </div>
              <p className="text-xs md:text-sm text-secondaryText">
                How an organized system separates everyday impulse from compound freedom.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl border border-divider bg-surface text-right">
                <span className="block text-[10px] font-mono uppercase text-mutedText">
                  Total Allocated Wealth
                </span>
                <span className="text-base md:text-lg font-bold font-mono text-white">
                  ₹3,58,450.00
                </span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl border border-positive/30 bg-positive/10 text-positive text-right">
                <span className="block text-[10px] font-mono uppercase">
                  Cash Flow Velocity
                </span>
                <span className="text-base md:text-lg font-bold font-mono">
                  +₹73,800/mo
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Pocket Grid */}
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Isolated Smart Pockets (Select to Inspect)</span>
              </span>
              <span className="text-xs text-mutedText hidden sm:inline">
                Click any pocket to view isolation logic
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoPockets.map((pocket, index) => {
                const IconComponent = pocket.icon;
                const isSelected = activePocketIndex === index;
                return (
                  <button
                    key={pocket.name}
                    onClick={() => setActivePocketIndex(index)}
                    className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                      isSelected
                        ? "border-primary bg-surface/90 shadow-lavender scale-[1.02]"
                        : "border-divider bg-surface/40 hover:border-divider/80 hover:bg-surface/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl border ${pocket.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase text-mutedText px-2 py-0.5 rounded bg-card border border-divider">
                        {pocket.type}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white mb-1 group-hover:text-primary transition-colors">
                      {pocket.name}
                    </h4>

                    <div className="text-base font-extrabold font-mono text-foreground mb-1">
                      {pocket.balance}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-secondaryText pt-2 border-t border-divider/40">
                      <span>{pocket.status}</span>
                      <span className="text-positive">{pocket.growth}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Pocket Detail Card */}
            <div className="mt-4 p-4 rounded-xl border border-divider bg-elevated/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-secondaryText">
                  <strong className="text-white">
                    {demoPockets[activePocketIndex].name}:
                  </strong>{" "}
                  {demoPockets[activePocketIndex].note}
                </span>
              </div>
              <button
                onClick={onSignUp}
                className="self-end sm:self-auto text-primary hover:text-primarySoft font-bold font-mono text-xs flex items-center gap-1 shrink-0"
              >
                Configure Pocket →
              </button>
            </div>
          </div>

          {/* 3 Pillars of Financial Organization */}
          <div className="pt-6 border-t border-divider grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border border-divider/60 bg-surface/30">
              <div className="text-primary font-mono text-xs mb-1">01 // ASSIGNMENT</div>
              <h5 className="font-bold text-white text-sm mb-1">Every Rupee Has a Home</h5>
              <p className="text-xs text-secondaryText leading-relaxed">
                Money unassigned is money spent on impulse. With MoneyOS, all income is partitioned automatically upon deposit.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-divider/60 bg-surface/30">
              <div className="text-primary font-mono text-xs mb-1">02 // IMMUNITY</div>
              <h5 className="font-bold text-white text-sm mb-1">Zero Phantom Distortion</h5>
              <p className="text-xs text-secondaryText leading-relaxed">
                Moving ₹20,000 to your savings vault is not an expense. Our double-entry engine tracks net wealth truthfully.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-divider/60 bg-surface/30">
              <div className="text-primary font-mono text-xs mb-1">03 // CERTAINTY</div>
              <h5 className="font-bold text-white text-sm mb-1">PostgreSQL Verified</h5>
              <p className="text-xs text-secondaryText leading-relaxed">
                No simulated projections or AI math guessing. Strict relational integrity guarantees balance precision down to the paisa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* HORIZON CROWD CANVAS SECTION */}
      <div
        ref={crowdContainerRef}
        className="absolute bottom-0 left-0 w-full h-[60vh] max-h-[580px] pointer-events-none z-10 overflow-hidden"
      >
        {/* Glowing Horizon line and perspective floor */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20" />
        
        {/* Subtle perspective runway lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(195,171,250,0.15) 1px, transparent 1px), linear-gradient(to top, rgba(195,171,250,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: "perspective(300px) rotateX(45deg)",
            transformOrigin: "bottom center",
          }}
        />

        {/* The Animated Peeps Crowd Canvas */}
        <CrowdCanvas
          src="/images/peeps/all-peeps.png"
          rows={15}
          cols={7}
          maxPeeps={peepDensity}
          speedMultiplier={speedMultiplier}
          interactiveSpotlight={spotlightActive}
          invert={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
