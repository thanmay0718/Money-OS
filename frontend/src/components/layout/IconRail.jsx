// src/components/layout/IconRail.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  Settings2,
  ShieldCheck,
  Sliders,
  AlertTriangle,
} from '../ui/Icons'
import GlassTooltip from '../ui/glass/GlassTooltip'
import MoneyOSLogo from '../ui/MoneyOSLogo'

/**
 * Premium Liquid Glass Navigation Rail — Lavender Dawn theme.
 * Active states use soft lavender instead of indigo.
 */
export default function IconRail() {
  const user = useSelector((state) => state.auth.user)
  const isAdmin = user?.role === 'ADMIN'
  const onboardingCompleted = useSelector((state) => state.onboarding?.completed)
  const onboardingStatus = useSelector((state) => state.onboarding?.status)
  const showOnboardingHighlight = onboardingStatus === 'succeeded' && !onboardingCompleted

  const navItems = [
    { to: '/',             label: 'Overview',      icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/transactions', label: 'Transactions',  icon: <ArrowLeftRight className="w-5 h-5" /> },
    { to: '/pockets',      label: 'Pockets',       icon: <Wallet className="w-5 h-5" /> },
    { to: '/categories',   label: 'Categories',    icon: <Tags className="w-5 h-5" /> },
    { to: '/settings',     label: 'Settings',      icon: <Settings2 className="w-5 h-5" /> },
  ]

  return (
    <>
      {/* Desktop Floating Navigation Rail */}
      <aside
        aria-label="Sidebar Navigation"
        className="hidden md:flex flex-col items-center justify-between w-20 py-6 my-4 ml-4 rounded-3xl glass-surface border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl text-[#737373] z-30 select-none shrink-0"
      >
        {/* Brand Squircle — MoneyOS Logo */}
        <div className="flex flex-col items-center space-y-6">
          <NavLink
            to="/"
            title="MoneyOS Dashboard"
            className="group relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C3ABFA] to-[#8E6BE8] text-[#18151F] shadow-[0_4px_20px_rgba(195,171,250,0.4),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_25px_rgba(195,171,250,0.55)] p-1.5"
          >
            <MoneyOSLogo size={28} />
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex flex-col items-center space-y-2 pt-2">
            {showOnboardingHighlight && (
              <GlassTooltip content="High Priority: Complete Onboarding" position="right">
                <NavLink
                  to="/onboarding"
                  className={({ isActive }) =>
                    `relative p-3 rounded-2xl transition-all duration-200 group flex items-center justify-center animate-pulse ${
                      isActive
                        ? 'text-rose-300 bg-rose-500/20 border border-rose-500/40 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
                        : 'text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25'
                    }`
                  }
                  aria-label="Complete Financial Onboarding (High Priority)"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                </NavLink>
              </GlassTooltip>
            )}

            {navItems.map((item) => (
              <GlassTooltip key={item.to} content={item.label} position="right">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative p-3 rounded-2xl transition-all duration-200 group flex items-center justify-center ${
                      isActive
                        ? 'text-white bg-[#C3ABFA]/20 border border-[#C3ABFA]/35 shadow-[0_0_18px_rgba(195,171,250,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                        : 'text-[#737373] hover:text-[#FAFAFA] hover:bg-white/[0.06] hover:border hover:border-white/10'
                    }`
                  }
                  aria-label={item.label}
                >
                  {({ isActive }) => (
                    <>
                      {item.icon}
                      {isActive && (
                        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#C3ABFA] rounded-r-full shadow-[0_0_10px_#C3ABFA]" />
                      )}
                    </>
                  )}
                </NavLink>
              </GlassTooltip>
            ))}
          </nav>
        </div>

        {/* Admin Quick Jump */}
        {isAdmin && (
          <div className="pt-4 border-t border-[#292929] w-full flex flex-col items-center">
            <GlassTooltip content="Admin Console" position="right">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `p-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#C3ABFA] to-[#8E6BE8] text-[#18151F] shadow-[0_0_20px_rgba(195,171,250,0.4)] border border-white/20'
                      : 'text-[#C3ABFA]/80 hover:text-[#D5C5FF] hover:bg-[#C3ABFA]/10 hover:border hover:border-[#C3ABFA]/20'
                  }`
                }
                aria-label="Admin Console"
              >
                <ShieldCheck className="w-5 h-5" />
              </NavLink>
            </GlassTooltip>
          </div>
        )}
      </aside>

      {/* Mobile Floating Bottom Navigation */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 inset-x-3 z-40 mx-auto max-w-md rounded-2xl glass-panel bg-[#181818]/90 border border-white/10 px-3 py-2 flex items-center justify-around shadow-[0_15px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-2xl"
      >
        {showOnboardingHighlight && (
          <NavLink
            to="/onboarding"
            className={({ isActive }) =>
              `relative p-2 rounded-xl transition-all duration-200 flex flex-col items-center justify-center animate-pulse ${
                isActive
                  ? 'text-rose-300 bg-rose-500/20 border border-rose-500/30'
                  : 'text-amber-300 bg-amber-500/10 border border-amber-500/25'
              }`
            }
            aria-label="Complete Onboarding"
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span className="text-[9px] mt-0.5 font-bold text-amber-200">Setup</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          </NavLink>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative p-2.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${
                isActive
                  ? 'text-[#C3ABFA] bg-[#C3ABFA]/15 border border-[#C3ABFA]/25 shadow-[0_0_14px_rgba(195,171,250,0.3)]'
                  : 'text-[#737373] hover:text-[#A3A3A3] active:scale-95'
              }`
            }
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `p-2.5 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${
                isActive
                  ? 'text-[#D5C5FF] bg-[#C3ABFA]/25 border border-[#C3ABFA]/35'
                  : 'text-[#C3ABFA]/80 hover:text-[#D5C5FF]'
              }`
            }
            aria-label="Admin Console"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Admin</span>
          </NavLink>
        )}
      </nav>
    </>
  )
}
