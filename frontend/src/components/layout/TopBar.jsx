// src/components/layout/TopBar.jsx — Premium Apple-Inspired Navbar (Lavender Dawn)
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Search,
  Bell,
  UserRound,
  LayoutDashboard,
  Activity,
  ArrowLeftRight,
  Wallet,
  Tags,
  Target,
  Settings2,
  ShieldCheck,
  Sliders,
  LogOut,
  ChevronDown,
  X,
  Menu,
  CircleCheck,
  Sparkles,
} from '../ui/Icons'
import GlassBadge from '../ui/glass/GlassBadge'
import GlassTooltip from '../ui/glass/GlassTooltip'
import MoneyOSLogo from '../ui/MoneyOSLogo'
import { logout } from '../../features/auth/authSlice'
import { toast } from '../../lib/toast'

export default function TopBar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const user = useSelector((state) => state.auth.user)
  const transactions = useSelector((state) => state.transactions.list)
  const pockets = useSelector((state) => state.pockets.list)
  const goals = useSelector((state) => state.dashboard.goalProgress)
  const isAdmin = user?.role === 'ADMIN'

  // Onboarding status — highlight for new users who haven't completed it
  const onboardingCompleted = useSelector((state) => state.onboarding.completed)
  const onboardingStatus = useSelector((state) => state.onboarding.status)
  const showOnboardingHighlight = onboardingStatus === 'succeeded' && !onboardingCompleted

  // Scroll detection for Apple-inspired dynamic glass elevation
  const [isScrolled, setIsScrolled] = useState(false)

  // Dropdown states
  const [spacesOpen, setSpacesOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Search state
  const [query, setQuery] = useState('')

  // Notification state
  const [notificationsRead, setNotificationsRead] = useState(false)

  // Refs for outside-click handling
  const spacesRef = useRef(null)
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector('main')
      const scrollPos = window.scrollY || (mainEl ? mainEl.scrollTop : 0)
      setIsScrolled(scrollPos > 12)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const mainEl = document.querySelector('main')
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close menus on route change
  useEffect(() => {
    setSpacesOpen(false)
    setSearchOpen(false)
    setNotificationsOpen(false)
    setProfileOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Global keyboard shortcut (⌘K / Ctrl+K) & Escape to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
          setSearchOpen(true)
        }
      }
      if (e.key === 'Escape') {
        setSpacesOpen(false)
        setSearchOpen(false)
        setNotificationsOpen(false)
        setProfileOpen(false)
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Outside click listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (spacesRef.current && !spacesRef.current.contains(e.target)) {
        setSpacesOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        const toggleBtn = document.getElementById('mobile-menu-toggle')
        if (!toggleBtn || !toggleBtn.contains(e.target)) {
          setMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [mobileMenuOpen])

  // Registered navigation spaces
  const spaces = [
    {
      to: '/',
      label: 'Dashboard Overview',
      desc: 'Real-time liquidity, cash flow & net rate',
      icon: <LayoutDashboard className="w-4 h-4 text-[#C3ABFA]" />,
    },
    {
      to: '/overview',
      label: 'Activity Overview',
      desc: 'Financial habits, streaks & activity ledger',
      icon: <Activity className="w-4 h-4 text-[#C3ABFA]" />,
    },
    {
      to: '/transactions',
      label: 'Transactions Ledger',
      desc: 'Inflows, debits & inter-pocket transfers',
      icon: <ArrowLeftRight className="w-4 h-4 text-[#86B8F5]" />,
    },
    {
      to: '/pockets',
      label: 'Money Pockets',
      desc: 'Capital partitions & reserve allocations',
      icon: <Wallet className="w-4 h-4 text-[#C3ABFA]" />,
    },
    {
      to: '/categories',
      label: 'Taxonomy Categories',
      desc: 'Income channels & spending classifications',
      icon: <Tags className="w-4 h-4 text-[#70D6A3]" />,
    },
    {
      to: '/onboarding?edit=1',
      label: 'Financial Calibration',
      desc: 'Adjust income, living costs & planning rules',
      icon: <Sliders className="w-4 h-4 text-[#D5C5FF]" />,
    },
  ]

  // Search items database for genuine search palette
  const searchableItems = [
    { id: 'dash', label: 'Dashboard Overview', path: '/', category: 'Views', icon: <LayoutDashboard className="w-4 h-4 text-[#C3ABFA]" /> },
    { id: 'overview', label: 'Activity Overview & Progress', path: '/overview', category: 'Views', icon: <Activity className="w-4 h-4 text-[#C3ABFA]" /> },
    { id: 'tx', label: 'Transactions History', path: '/transactions', category: 'Views', icon: <ArrowLeftRight className="w-4 h-4 text-[#86B8F5]" /> },
    { id: 'new-tx', label: 'Record New Transaction', path: '/transactions', category: 'Actions', icon: <ArrowLeftRight className="w-4 h-4 text-[#70D6A3]" /> },
    { id: 'pockets', label: 'Manage Money Pockets', path: '/pockets', category: 'Views', icon: <Wallet className="w-4 h-4 text-[#C3ABFA]" /> },
    { id: 'cat', label: 'Income & Expense Categories', path: '/categories', category: 'Views', icon: <Tags className="w-4 h-4 text-[#70D6A3]" /> },
    { id: 'profile', label: 'Financial Profile & Planning', path: '/onboarding?edit=1', category: 'Planning', icon: <Sliders className="w-4 h-4 text-[#D5C5FF]" /> },
    { id: 'settings', label: 'Account Security & Settings', path: '/settings', category: 'System', icon: <Settings2 className="w-4 h-4 text-[#FAFAFA]" /> },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Console & Logs', path: '/admin', category: 'Admin', icon: <ShieldCheck className="w-4 h-4 text-[#C3ABFA]" /> }] : []),
  ]

  const filteredSearch = query.trim()
    ? searchableItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : searchableItems.slice(0, 5)

  const handleSearchSelect = (path) => {
    navigate(path)
    setQuery('')
    setSearchOpen(false)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredSearch.length > 0) {
        handleSearchSelect(filteredSearch[0].path)
      } else {
        const lower = query.toLowerCase()
        if (lower.includes('overview') || lower.includes('streak') || lower.includes('heatmap') || lower.includes('activity')) navigate('/overview')
        else if (lower.includes('transaction')) navigate('/transactions')
        else if (lower.includes('pocket')) navigate('/pockets')
        else if (lower.includes('category')) navigate('/categories')
        else if (lower.includes('setting')) navigate('/settings')
        else if (lower.includes('onboard') || lower.includes('profile')) navigate('/onboarding?edit=1')
        else if (lower.includes('admin') && isAdmin) navigate('/admin')
        else navigate('/')
        setQuery('')
        setSearchOpen(false)
      }
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success('Signed out successfully.')
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  // Derive dynamic real notifications from user financial state
  const derivedNotifications = [
    ...(showOnboardingHighlight
      ? [
          {
            id: 'onboarding-incomplete',
            title: 'Action Required: Complete Setup',
            desc: 'Your financial onboarding profile is incomplete. Finish setup to activate AI pacing and budgets.',
            time: 'High Priority',
            variant: 'rose',
            isHighPriority: true,
            actionPath: '/onboarding',
          },
        ]
      : []),
    {
      id: 'tx-status',
      title: 'Ledger Synchronized',
      desc: `${transactions?.length || 0} verified transactions recorded in current period.`,
      time: 'Real-time',
      variant: 'default',
    },
    {
      id: 'pockets-status',
      title: 'Capital Partitions Active',
      desc: `${pockets?.length || 0} money pockets safeguarding allocated liquidity.`,
      time: 'Live',
      variant: 'lavender',
    },
    ...(goals && goals.length > 0
      ? [
          {
            id: 'goals-status',
            title: 'Savings Milestones',
            desc: `${goals.length} target goal${goals.length > 1 ? 's' : ''} currently tracking progress.`,
            time: 'Active',
            variant: 'positive',
          },
        ]
      : []),
  ]

  const unreadCount = notificationsRead ? 0 : derivedNotifications.length

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3 pb-1 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 rounded-2xl transition-all duration-300 ${
          isScrolled
            ? 'py-2 bg-[#141414]/90 border border-white/[0.12] shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl'
            : 'py-2.5 bg-[#181818]/65 border border-white/[0.07] shadow-[0_6px_24px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-xl'
        }`}
      >
        {/* ── Left Section: Brand & Workspaces Dropdown ────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Brand Mark */}
          <NavLink
            to="/"
            title="MoneyOS Dashboard"
            className="group flex items-center gap-2.5 focus:outline-none"
          >
            <div className="transition-transform group-hover:scale-105">
              <MoneyOSLogo size={32} />
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-[#FAFAFA]">
                Money<span className="text-[#C3ABFA]">OS</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/25">
                Live
              </span>
            </div>
          </NavLink>

          {/* Workspaces / Quick Jump Dropdown (Desktop) */}
          <div className="relative hidden md:block" ref={spacesRef}>
            <button
              type="button"
              onClick={() => setSpacesOpen(!spacesOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C3ABFA]"
              aria-expanded={spacesOpen}
              aria-haspopup="true"
            >
              <span>Workspaces</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  spacesOpen ? 'rotate-180 text-[#C3ABFA]' : ''
                }`}
              />
            </button>

            {/* Spaces Dropdown Menu */}
            {spacesOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-72 p-2 rounded-2xl bg-[#181818]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-3 py-1.5 border-b border-[#292929] mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                    Financial Workspaces
                  </span>
                </div>
                <div className="space-y-0.5">
                  {spaces.map((space) => {
                    const isActive = location.pathname === space.to
                    return (
                      <NavLink
                        key={space.to}
                        to={space.to}
                        onClick={() => setSpacesOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-[#C3ABFA]/15 border border-[#C3ABFA]/30 text-[#FAFAFA]'
                            : 'hover:bg-white/[0.06] text-[#A3A3A3] hover:text-[#FAFAFA]'
                        }`}
                        role="menuitem"
                      >
                        <div className="p-1 rounded-lg bg-white/[0.05] border border-white/10 shrink-0 mt-0.5">
                          {space.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#FAFAFA] leading-tight">
                            {space.label}
                          </p>
                          <p className="text-[11px] text-[#737373] truncate mt-0.5">
                            {space.desc}
                          </p>
                        </div>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Center Section: Global Command / Search Palette ─────────── */}
        <div className="relative flex-1 max-w-sm sm:max-w-md lg:max-w-lg mx-2" ref={searchContainerRef}>
          <div className="relative">
            <input
              ref={searchInputRef}
              id="top-search"
              type="text"
              placeholder="Search views, pockets… (⌘K)"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-12 py-1.5 rounded-xl text-xs sm:text-sm text-[#FAFAFA] placeholder-[#737373] bg-[#101010]/70 border border-[#292929] focus:bg-[#101010]/90 focus:border-[#C3ABFA]/50 focus:ring-2 focus:ring-[#C3ABFA]/20 outline-none transition-all"
              aria-label="Search financial views and commands"
              autoComplete="off"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none" />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-[#737373] bg-[#222222] rounded border border-[#292929] shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Autocomplete Suggestions Palette */}
          {searchOpen && (
            <div className="absolute left-0 right-0 mt-2 p-2 rounded-2xl bg-[#181818]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1 flex items-center justify-between border-b border-[#292929] mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
                  {query.trim() ? 'Matching Results' : 'Quick Navigation'}
                </span>
                <span className="text-[10px] text-[#737373]">Press Enter to select</span>
              </div>
              <ul className="space-y-0.5 max-h-60 overflow-y-auto">
                {filteredSearch.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSearchSelect(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-1 rounded-md bg-white/[0.04] border border-white/10 group-hover:border-[#C3ABFA]/30">
                          {item.icon}
                        </span>
                        <span className="font-medium text-[#FAFAFA]">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-[#737373]">
                        {item.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Right Section: Notifications, Profile & Mobile Toggle ────── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* High Priority Onboarding Alert Task for New Users */}
          {showOnboardingHighlight && (
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-[#C3ABFA]/20 hover:from-amber-500/30 hover:via-rose-500/30 hover:to-[#C3ABFA]/30 border border-rose-500/50 hover:border-rose-400 text-xs shadow-[0_0_18px_rgba(244,63,94,0.3)] transition-all animate-pulse"
              title="High Priority: Complete your onboarding setup"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-semibold text-white hidden md:inline">
                Complete Onboarding
              </span>
              <span className="font-semibold text-white md:hidden">
                Setup
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/30 text-rose-200 border border-rose-500/50 uppercase tracking-wider">
                Priority
              </span>
            </button>
          )}

          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <GlassTooltip content="Notifications" position="bottom">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setNotificationsRead(true)
                }}
                aria-label="View financial notifications"
                className="relative p-2 rounded-xl text-[#737373] hover:text-[#FAFAFA] hover:bg-white/[0.06] border border-transparent hover:border-[#292929] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C3ABFA]"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C3ABFA] shadow-[0_0_6px_#C3ABFA]" />
                )}
              </button>
            </GlassTooltip>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notification center"
                className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[#181818]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#C3ABFA]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#FAFAFA]">
                      Financial Alerts
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsRead(true)}
                    className="text-[11px] text-[#A3A3A3] hover:text-[#C3ABFA] transition-colors"
                  >
                    Clear badge
                  </button>
                </div>

                <div className="py-2 space-y-2">
                  {derivedNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (notif.actionPath) {
                          setNotificationsOpen(false)
                          navigate(notif.actionPath)
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all ${
                        notif.isHighPriority
                          ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                          : 'bg-white/[0.03] border-white/[0.06] hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${notif.isHighPriority ? 'text-rose-200 flex items-center gap-1.5' : 'text-[#FAFAFA]'}`}>
                          {notif.isHighPriority && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                          )}
                          {notif.title}
                        </span>
                        <span className={`text-[10px] font-mono ${notif.isHighPriority ? 'text-rose-300 font-bold uppercase' : 'text-[#737373]'}`}>
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#A3A3A3] mt-1 leading-snug">{notif.desc}</p>
                      {notif.actionPath && (
                        <div className="mt-2 text-[11px] text-[#C3ABFA] hover:text-[#D5C5FF] font-medium flex items-center gap-1">
                          Complete now &rarr;
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#292929] flex justify-between items-center text-xs">
                  <span className="text-[11px] text-[#737373] flex items-center gap-1.5">
                    <CircleCheck className="w-3.5 h-3.5 text-[#70D6A3]" />
                    Real-time status
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false)
                      navigate('/transactions')
                    }}
                    className="text-xs text-[#C3ABFA] hover:underline font-medium"
                  >
                    View transactions &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown (Desktop) */}
          {user && (
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[#292929] hover:border-white/15 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C3ABFA]"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#FAFAFA] leading-tight">
                    {user.fullName ? user.fullName.split(' ')[0] : 'Account'}
                  </p>
                  <p className="text-[10px] text-[#737373] font-mono uppercase">{user.currency || 'INR'}</p>
                </div>
                {/* Initials Avatar in Lavender Gradient */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#C3ABFA] to-[#8E6BE8] text-[#18151F] flex items-center justify-center font-bold text-xs border border-white/20 shadow-inner">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-[#737373] transition-transform duration-200 ${
                    profileOpen ? 'rotate-180 text-[#C3ABFA]' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-[#181818]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2.5 border-b border-[#292929] mb-1">
                    <p className="text-xs font-bold text-[#FAFAFA] truncate">
                      {user.fullName || 'User Profile'}
                    </p>
                    <p className="text-[11px] text-[#737373] truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <GlassBadge variant={isAdmin ? 'accent' : 'default'} size="sm">
                        {user.role || 'USER'}
                      </GlassBadge>
                      <span className="text-[10px] text-[#737373] font-mono">
                        Base: {user.currency || 'INR'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] transition-colors"
                      role="menuitem"
                    >
                      <UserRound className="w-4 h-4 text-[#C3ABFA]" />
                      <span>Account &amp; Security</span>
                    </NavLink>
                    <NavLink
                      to="/onboarding?edit=1"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] transition-colors"
                      role="menuitem"
                    >
                      <Sliders className="w-4 h-4 text-[#D5C5FF]" />
                      <span>Financial Profile Calibration</span>
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#C3ABFA] hover:bg-[#C3ABFA]/10 transition-colors"
                        role="menuitem"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C3ABFA]" />
                        <span>Admin Console</span>
                      </NavLink>
                    )}
                  </div>

                  <div className="pt-1 mt-1 border-t border-[#292929]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#F07891] hover:bg-[#F07891]/10 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 text-[#F07891]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Mobile Animated Menu Toggle ──────────────────────────── */}
          <div className="sm:hidden">
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.06] border border-transparent hover:border-[#292929] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ───────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-x-3 top-[68px] z-50 sm:hidden p-4 rounded-3xl bg-[#141414]/95 border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
            <span className="text-xs font-bold text-[#FAFAFA]">Navigation Menu</span>
            <span className="text-[10px] text-[#C3ABFA] font-mono uppercase tracking-wider">
              {user?.role || 'Personal'} Workspace
            </span>
          </div>

          <nav className="py-3 space-y-1">
            {showOnboardingHighlight && (
              <NavLink
                to="/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 mb-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-rose-500/40 text-rose-200 animate-pulse"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Action Required: Setup Profile</p>
                    <p className="text-[11px] text-amber-300">Complete financial onboarding</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/30 text-rose-200 border border-rose-500/40 uppercase">
                  High Priority
                </span>
              </NavLink>
            )}

            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#C3ABFA]/15 text-[#C3ABFA] font-semibold border border-[#C3ABFA]/30'
                    : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </NavLink>

            <NavLink
              to="/transactions"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#C3ABFA]/15 text-[#C3ABFA] font-semibold border border-[#C3ABFA]/30'
                    : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
                }`
              }
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transactions</span>
            </NavLink>

            <NavLink
              to="/pockets"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#C3ABFA]/15 text-[#C3ABFA] font-semibold border border-[#C3ABFA]/30'
                    : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
                }`
              }
            >
              <Wallet className="w-4 h-4" />
              <span>Money Pockets</span>
            </NavLink>

            <NavLink
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#C3ABFA]/15 text-[#C3ABFA] font-semibold border border-[#C3ABFA]/30'
                    : 'text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04]'
                }`
              }
            >
              <Tags className="w-4 h-4" />
              <span>Categories</span>
            </NavLink>

            <NavLink
              to="/onboarding?edit=1"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04] transition-colors"
            >
              <Sliders className="w-4 h-4 text-[#D5C5FF]" />
              <span>Financial Profile</span>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-white/[0.04] transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#C3ABFA] hover:bg-[#C3ABFA]/10 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </NavLink>
            )}
          </nav>

          {/* Mobile User Card & Logout */}
          {user && (
            <div className="pt-3 border-t border-[#292929] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#C3ABFA] to-[#8E6BE8] text-[#18151F] flex items-center justify-center font-bold text-xs shrink-0">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                    {user.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-[#737373] truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F07891] bg-[#F07891]/10 border border-[#F07891]/20 hover:bg-[#F07891]/20 transition-colors shrink-0"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
