// src/features/overview/components/AchievementGallery.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  PiggyBank,
  Flame,
  ShieldCheck,
  Trophy,
  Shield,
  Target,
  Award,
  Lock,
  CheckCircle2,
  Coins,
  AlertCircle,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react'

// Icon resolver for achievement badges
const ICON_MAP = {
  Sparkles: Sparkles,
  PiggyBank: PiggyBank,
  Flame: Flame,
  ShieldCheck: ShieldCheck,
  Trophy: Trophy,
  Shield: Shield,
  Target: Target,
  Award: Award,
}

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// Rarity tiers based on coin reward
const getRarity = (coinReward) => {
  if (coinReward >= 250) return 'legendary'
  if (coinReward >= 150) return 'epic'
  if (coinReward >= 75) return 'rare'
  return 'common'
}

const RARITY_CONFIG = {
  legendary: {
    label: 'Legendary',
    iconBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    chipBorder: 'border-amber-400/30',
    chipGlow: 'shadow-[0_4px_24px_rgba(251,191,36,0.18)]',
    pillBg: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  },
  epic: {
    label: 'Epic',
    iconBg: 'bg-violet-400/20 text-violet-300 border-violet-400/40',
    chipBorder: 'border-violet-400/30',
    chipGlow: 'shadow-[0_4px_24px_rgba(167,139,250,0.18)]',
    pillBg: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  },
  rare: {
    label: 'Rare',
    iconBg: 'bg-blue-400/20 text-blue-300 border-blue-400/40',
    chipBorder: 'border-blue-400/30',
    chipGlow: 'shadow-[0_4px_24px_rgba(96,165,250,0.15)]',
    pillBg: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  },
  common: {
    label: 'Common',
    iconBg: 'bg-white/10 text-white/80 border-white/15',
    chipBorder: 'border-white/15',
    chipGlow: 'shadow-[0_4px_20px_rgba(0,0,0,0.4)]',
    pillBg: 'bg-white/5 text-white/60 border-white/10',
  },
}

const FALLBACK_ACHIEVEMENTS = [
  {
    code: 'FIRST_TRANSACTION',
    title: 'First Step',
    description: 'Record your first transaction',
    icon: 'Sparkles',
    coinReward: 50,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    currentProgress: 1,
    targetProgress: 1,
    progressPercentage: 100,
  },
  {
    code: 'SMART_SAVER',
    title: 'Smart Saver',
    description: 'First savings contribution',
    icon: 'PiggyBank',
    coinReward: 75,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    currentProgress: 1,
    targetProgress: 1,
    progressPercentage: 100,
  },
  {
    code: 'CONSISTENCY_BUILDER',
    title: 'Consistency Builder',
    description: '7 active financial days',
    icon: 'Flame',
    coinReward: 100,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    currentProgress: 7,
    targetProgress: 7,
    progressPercentage: 100,
  },
  {
    code: 'MONEY_DISCIPLINE',
    title: 'Money Discipline',
    description: '30 active financial days',
    icon: 'ShieldCheck',
    coinReward: 250,
    unlocked: false,
    unlockedAt: null,
    currentProgress: 7,
    targetProgress: 30,
    progressPercentage: 23.3,
  },
  {
    code: 'GOAL_CRUSHER',
    title: 'Goal Crusher',
    description: 'Complete a savings goal',
    icon: 'Trophy',
    coinReward: 300,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    currentProgress: 1,
    targetProgress: 1,
    progressPercentage: 100,
  },
]

export const AchievementGallery = ({
  achievements = [],
  loading = false,
  error,
  onRetry,
}) => {
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState('ALL') // 'ALL' | 'UNLOCKED' | 'LOCKED'
  const [isPaused, setIsPaused] = useState(false)

  const sourceAchievements = achievements && achievements.length > 0 ? achievements : FALLBACK_ACHIEVEMENTS

  const filteredAchievements = sourceAchievements.filter((a) => {
    if (filter === 'UNLOCKED') return a.unlocked
    if (filter === 'LOCKED') return !a.unlocked
    return true
  })

  const [items, setItems] = useState(filteredAchievements)

  useEffect(() => {
    setItems(filteredAchievements)
  }, [achievements, filter])

  // Cycle chips
  useEffect(() => {
    if (isPaused || items.length <= 1) return

    const interval = setInterval(() => {
      setItems((prev) => {
        if (prev.length <= 1) return prev
        const [first, ...rest] = prev
        return [...rest, first]
      })
    }, 2800)

    return () => clearInterval(interval)
  }, [isPaused, items.length])

  const handleSelectBadge = (code) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex((i) => i.code === code)
      if (targetIndex <= 0) return prev
      const target = prev[targetIndex]
      const remaining = prev.filter((_, idx) => idx !== targetIndex)
      return [target, ...remaining]
    })
  }

  const handleNext = () => {
    setItems((prev) => {
      if (prev.length <= 1) return prev
      const [first, ...rest] = prev
      return [...rest, first]
    })
  }

  const handlePrev = () => {
    setItems((prev) => {
      if (prev.length <= 1) return prev
      const last = prev[prev.length - 1]
      const rest = prev.slice(0, prev.length - 1)
      return [last, ...rest]
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#181818]/60 p-6 backdrop-blur-xl animate-pulse">
        <div className="h-6 w-48 rounded bg-white/5 mb-6" />
        <div className="h-56 w-full rounded-2xl bg-white/5" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#181818]/70 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h3 className="text-sm font-semibold text-white/90">Badges couldn't load</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/55">
              {error} Your rewards haven't been lost. Try refreshing.
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#C3ABFA]/25 bg-[#C3ABFA]/10 px-3 text-xs font-semibold text-[#D5C5FF] transition-colors hover:bg-[#C3ABFA]/20"
          >
            <RefreshCw aria-hidden="true" size={14} />
            Try again
          </button>
        )}
      </div>
    )
  }

  const unlockedCount = sourceAchievements.filter((a) => a.unlocked).length
  const lockedCount = sourceAchievements.length - unlockedCount
  const activeChip = items[0]
  const isUnlocked = activeChip?.unlocked
  const rarity = isUnlocked ? getRarity(activeChip?.coinReward || 0) : 'common'
  const rarityCfg = RARITY_CONFIG[rarity]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141416]/95 via-[#0F0F11]/95 to-[#0A0A0C]/98 p-5 sm:p-6 backdrop-blur-2xl shadow-xl">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#C3ABFA]/8 blur-[100px] pointer-events-none"
      />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400/20 to-yellow-500/15 border border-amber-400/30 text-amber-300">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-white/95 tracking-tight">
              Financial Achievements
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#C3ABFA]/15 text-[#C3ABFA] border border-[#C3ABFA]/20 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" />
              {unlockedCount} / {sourceAchievements.length} Unlocked
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-0.5 ml-9">
            Discipline milestones & rewards collected in your vault
          </p>
        </div>

        {/* Filters & Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'ALL'
                  ? 'bg-[#C3ABFA] text-[#0A0A0C] font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              All ({sourceAchievements.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNLOCKED')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'UNLOCKED'
                  ? 'bg-[#C3ABFA] text-[#0A0A0C] font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('LOCKED')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === 'LOCKED'
                  ? 'bg-[#C3ABFA] text-[#0A0A0C] font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              In Progress ({lockedCount})
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/10 rounded-lg p-0.5 text-white/70">
            <button
              type="button"
              onClick={handlePrev}
              title="Previous"
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume' : 'Pause'}
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              {isPaused ? <Play className="w-3 h-3 text-amber-300" /> : <Pause className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next"
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3D GLASS BOX CONTAINER (COMPACT & CLASSY WITH GAP) ── */}
      <div className="relative flex flex-col items-center justify-center w-full pt-8 pb-2">
        <div
          className="relative isolate w-full max-w-[320px] sm:max-w-[360px]"
          style={{ aspectRatio: '655/352' }}
        >
          {/* Back 3D Box SVG */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 655 352"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 z-0"
          >
            <foreignObject x="443.561" y="-10.5141" width="211.24" height="166.977">
              <div
                style={{
                  backdropFilter: 'blur(11.03px)',
                  clipPath: 'url(#bgblur_0_51_65_clip_path)',
                  height: '100%',
                  width: '100%',
                }}
              />
            </foreignObject>
            <g filter="url(#filter1_dddi_51_65)">
              <path
                d="M535.59 78.7427L487.973 42.8776L558.738 13.9516C562.902 12.2494 564.984 11.3984 567.143 11.5597C569.301 11.7211 571.233 12.8723 575.098 15.1747L590.22 24.1832C603.923 32.347 610.775 36.4289 610.372 42.0779C609.97 47.7269 602.609 50.7964 587.887 56.9354L535.59 78.7427Z"
                fill="white"
                fillOpacity="0.22"
                shapeRendering="crispEdges"
              />
            </g>
            <foreignObject x="-3.43323e-05" y="-10.9516" width="215.96" height="167.786">
              <div
                style={{
                  backdropFilter: 'blur(11.03px)',
                  clipPath: 'url(#bgblur_1_51_65_clip_path)',
                  height: '100%',
                  width: '100%',
                }}
              />
            </foreignObject>
            <g filter="url(#filter2_dddi_51_65)">
              <path
                d="M123.116 79.1145L171.548 42.8776L97.2715 12.5164C94.8305 11.5186 93.61 11.0197 92.3446 11.1143C91.0793 11.2089 89.9465 11.8837 87.681 13.2334L56.155 32.0149C48.1832 36.7641 44.1973 39.1386 44.4205 42.4378C44.6438 45.737 48.9132 47.553 57.4522 51.1849L123.116 79.1145Z"
                fill="white"
                fillOpacity="0.22"
                shapeRendering="crispEdges"
              />
            </g>
            <foreignObject x="78.7048" y="20.823" width="501.297" height="136.012">
              <div
                style={{
                  backdropFilter: 'blur(11.03px)',
                  clipPath: 'url(#bgblur_2_51_65_clip_path)',
                  height: '100%',
                  width: '100%',
                }}
              />
            </foreignObject>
            <g filter="url(#filter3_dddi_51_65)">
              <path
                d="M487.973 42.8774L171.548 42.8775L123.116 79.1144L535.59 78.7424L487.973 42.8774Z"
                fill="url(#paint0_linear_51_65)"
                fillOpacity="0.45"
                shapeRendering="crispEdges"
              />
            </g>
            <foreignObject x="78.7048" y="20.823" width="137.255" height="136.012">
              <div
                style={{
                  backdropFilter: 'blur(11.03px)',
                  clipPath: 'url(#bgblur_3_51_65_clip_path)',
                  height: '100%',
                  width: '100%',
                }}
              />
            </foreignObject>
            <g filter="url(#filter4_dddi_51_65)">
              <path
                d="M171.548 78.9088V42.8774L123.116 79.1144L171.548 78.9088Z"
                fill="white"
                fillOpacity="0.25"
                shapeRendering="crispEdges"
              />
            </g>

            <g filter="url(#filter5_dddi_51_65)">
              <path
                d="M487.973 78.9088V42.8774L536.404 79.1144L487.973 78.9088Z"
                fill="white"
                fillOpacity="0.25"
                shapeRendering="crispEdges"
              />
            </g>

            <defs>
              <filter id="filter0_i_51_65" x="123.766" y="79.1595" width="413" height="275.676" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="5.51362" />
                <feGaussianBlur stdDeviation="1.83787" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.36 0" />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_51_65" />
              </filter>
              <filter id="filter1_dddi_51_65" x="443.561" y="-10.5141" width="211.24" height="166.977" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" result="shape" />
              </filter>
              <clipPath id="bgblur_0_51_65_clip_path" transform="translate(-443.561 10.5141)">
                <path d="M535.59 78.7427L487.973 42.8776L558.738 13.9516C562.902 12.2494 564.984 11.3984 567.143 11.5597C569.301 11.7211 571.233 12.8723 575.098 15.1747L590.22 24.1832C603.923 32.347 610.775 36.4289 610.372 42.0779C609.97 47.7269 602.609 50.7964 587.887 56.9354L535.59 78.7427Z" />
              </clipPath>
              <filter id="filter2_dddi_51_65" x="-3.43323e-05" y="-10.9516" width="215.96" height="167.786" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" result="shape" />
              </filter>
              <clipPath id="bgblur_1_51_65_clip_path" transform="translate(3.43323e-05 10.9516)">
                <path d="M123.116 79.1145L171.548 42.8776L97.2715 12.5164C94.8305 11.5186 93.61 11.0197 92.3446 11.1143C91.0793 11.2089 89.9465 11.8837 87.681 13.2334L56.155 32.0149C48.1832 36.7641 44.1973 39.1386 44.4205 42.4378C44.6438 45.737 48.9132 47.553 57.4522 51.1849L123.116 79.1145Z" />
              </clipPath>
              <filter id="filter3_dddi_51_65" x="78.7048" y="20.823" width="501.297" height="136.012" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" result="shape" />
              </filter>
              <clipPath id="bgblur_2_51_65_clip_path" transform="translate(-78.7048 -20.823)">
                <path d="M487.973 42.8774L171.548 42.8775L123.116 79.1144L535.59 78.7424L487.973 42.8774Z" />
              </clipPath>
              <filter id="filter4_dddi_51_65" x="78.7048" y="20.823" width="137.255" height="136.012" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" result="shape" />
              </filter>
              <clipPath id="bgblur_3_51_65_clip_path" transform="translate(-78.7048 -20.823)">
                <path d="M171.548 78.9088V42.8774L123.116 79.1144L171.548 78.9088Z" />
              </clipPath>
              <filter id="filter5_dddi_51_65" x="443.561" y="20.823" width="137.255" height="136.012" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" result="shape" />
              </filter>
              <filter id="filter6_dddi_51_65" x="21.477" y="56.6875" width="612.444" height="212.562" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" result="shape" />
              </filter>
              <clipPath id="center_box_clip">
                <rect x="123.766" y="0" width="413" height="352" />
              </clipPath>
              <linearGradient id="paint0_linear_51_65" x1="329.353" y1="42.8774" x2="329.353" y2="79.1144" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" stopOpacity="0.3" />
                <stop offset="1" stopColor="white" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>

          {/* ── Sleek Floating Pill Card (Floating Just Above the Box Opening with Perfect Gap) ── */}
          <div className="absolute inset-x-0 -top-4 sm:-top-5 z-10 flex justify-center pointer-events-none">
            <AnimatePresence mode="popLayout">
              {activeChip && (
                <motion.div
                  key={activeChip.code}
                  initial={{
                    y: -18,
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    y: 75,
                    scale: 0.7,
                    opacity: 0,
                    transition: { duration: 0.45, ease: 'easeIn' },
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`rounded-full py-2 px-3 sm:px-3.5 w-[220px] sm:w-[250px] border shadow-2xl pointer-events-auto flex items-center justify-between gap-2 backdrop-blur-2xl bg-[#141418] ${rarityCfg.chipBorder} ${rarityCfg.chipGlow}`}
                >
                  {/* Left Icon inside circle */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`size-7 sm:size-7.5 rounded-full shrink-0 flex items-center justify-center border ${
                        isUnlocked
                          ? rarityCfg.iconBg
                          : 'bg-white/10 border-white/15 text-white/40'
                      }`}
                    >
                      {(() => {
                        const IconComp = ICON_MAP[activeChip.icon] || Award
                        return isUnlocked ? (
                          <IconComp className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )
                      })()}
                    </div>

                    {/* Text info: Title and concise description */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-semibold text-white/95 leading-tight truncate">
                        {activeChip.title}
                      </span>
                      <span className="text-[9px] text-white/50 leading-tight truncate mt-0.5">
                        {activeChip.description}
                      </span>
                    </div>
                  </div>

                  {/* Right Coin / Status tag */}
                  <div className="flex shrink-0 items-center gap-1">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 border border-amber-400/30 text-amber-300">
                      <Coins className="w-2.5 h-2.5 text-amber-400" />
                      <span>+{activeChip.coinReward}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Front 3D Glass Box Layer */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 655 352"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {/* Front Box Body (Solid Frosted Dark to Conceal Dropped Chip) */}
            <g filter="url(#filter0_i_51_65)">
              <path
                d="M512.766 79.1595L147.766 79.1624C136.453 79.1625 130.796 79.1626 127.281 82.6773C123.766 86.192 123.766 91.8488 123.766 103.162V327.159C123.766 338.473 123.766 344.13 127.281 347.645C130.796 351.159 136.453 351.159 147.766 351.159H512.766C524.08 351.159 529.737 351.159 533.252 347.645C536.766 344.13 536.766 338.473 536.766 327.159V103.159C536.766 91.8457 536.766 86.1888 533.252 82.6741C529.737 79.1594 524.08 79.1594 512.766 79.1595Z"
                fill="#131316"
                fillOpacity="0.98"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            </g>

            {/* Front Glass Panel Blur */}
            <g clipPath="url(#center_box_clip)">
              <foreignObject x="0" y="0" width="655" height="352">
                <div
                  style={{
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    height: '100%',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.015)',
                    clipPath:
                      "path('M74.6011 164.033L123.116 79.1138L535.59 78.7419L581.532 164.469C588.006 176.55 591.243 182.59 588.568 187.06C585.892 191.529 579.039 191.529 565.333 191.529H90.5591C76.4759 191.529 69.4343 191.529 66.7781 186.953C64.1219 182.376 67.615 176.262 74.6011 164.033Z')",
                  }}
                />
              </foreignObject>
            </g>

            {/* Front Rim */}
            <g filter="url(#filter6_dddi_51_65)">
              <path
                d="M74.6011 164.033L123.116 79.1138L535.59 78.7419L581.532 164.469C588.006 176.55 591.243 182.59 588.568 187.06C585.892 191.529 579.039 191.529 565.333 191.529H90.5591C76.4759 191.529 69.4343 191.529 66.7781 186.953C64.1219 182.376 67.615 176.262 74.6011 164.033Z"
                fill="white"
                fillOpacity="0.16"
                shapeRendering="crispEdges"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* ── Interactive Achievement Vault Pill Tray ── */}
      <div className="relative z-10 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-semibold text-white/70">
            Achievements Vault ({filteredAchievements.length})
          </span>
          <span className="text-[10px] text-white/35">
            Click badge to drop into vault
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {filteredAchievements.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Award
            const isItemUnlocked = item.unlocked
            const itemRarity = isItemUnlocked ? getRarity(item.coinReward) : 'common'
            const itemCfg = RARITY_CONFIG[itemRarity]
            const isSelected = activeChip?.code === item.code

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectBadge(item.code)}
                className={`relative flex items-center gap-2 p-2 rounded-xl border text-left transition-all duration-150 ${
                  isSelected
                    ? 'bg-white/10 border-[#C3ABFA]/50 shadow-[0_0_12px_rgba(195,171,250,0.2)] scale-[1.02]'
                    : isItemUnlocked
                    ? 'bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.06]'
                    : 'bg-white/[0.015] border-white/5 opacity-50 hover:opacity-85'
                }`}
              >
                <div
                  className={`flex items-center justify-center size-7 rounded-lg shrink-0 ${
                    isItemUnlocked
                      ? `${itemCfg.iconBg} ${itemCfg.iconColor}`
                      : 'bg-white/5 border border-white/10 text-white/30'
                  }`}
                >
                  {isItemUnlocked ? <IconComp className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/90 truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      +{item.coinReward}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-white/40 truncate">
                    {isItemUnlocked ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                      </span>
                    ) : (
                      <span>{item.progressPercentage}%</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AchievementGallery
