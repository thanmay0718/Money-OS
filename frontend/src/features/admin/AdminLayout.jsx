// src/features/admin/AdminLayout.jsx
import React, { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  UsersRound,
  ChartNoAxesCombined,
  Tags,
  ClipboardList,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  ShieldCheck,
  RefreshCw,
} from '../../components/ui/Icons'
import { logout } from '../auth/authSlice'
import { GlassBadge } from '../../components/ui/glass'
import MoneyOSLogo from '../../components/ui/MoneyOSLogo'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { to: '/admin', end: true, label: 'Overview', icon: <LayoutDashboard /> },
    { to: '/admin/users', label: 'Users', icon: <UsersRound /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <ChartNoAxesCombined /> },
    { to: '/admin/categories', label: 'Categories', icon: <Tags /> },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: <ClipboardList /> },
    { to: '/admin/health', label: 'System Health', icon: <Activity /> },
  ]

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      navigate('/login', { replace: true })
    } catch {
      navigate('/login', { replace: true })
    }
  }

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/admin') return 'Executive Overview'
    if (path.includes('/users')) return 'User & Account Management'
    if (path.includes('/analytics')) return 'Platform Analytics & Growth'
    if (path.includes('/categories')) return 'System Categories'
    if (path.includes('/audit-logs')) return 'Security & Audit Trail'
    if (path.includes('/health')) return 'System Operational Health'
    return 'Admin Console'
  }

  return (
    <div className="flex h-screen bg-background text-primaryText font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col glass-surface border-r border-white/10 bg-slate-900/80 backdrop-blur-2xl transition-all duration-300 lg:static ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700/60">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <MoneyOSLogo size={32} className="shrink-0" />
            {!collapsed && (
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white tracking-tight">
                  Money<span className="text-[#C3ABFA]">OS</span>
                </span>
                <GlassBadge variant="accent" size="sm">
                  Admin
                </GlassBadge>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-indigo-500/90 text-white shadow-[0_2px_10px_rgba(99,102,241,0.4)] border border-white/20 font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                } ${collapsed ? 'justify-center' : 'space-x-3'}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer Navigation: Switch to User App & Sign Out */}
        <div className="p-3 border-t border-slate-700/60 space-y-2">
          {/* Switch to Personal Finance View */}
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/[0.06] hover:text-white border border-slate-700/60 transition-colors ${
              collapsed ? 'justify-center' : 'space-x-2.5'
            }`}
            title="Switch to Personal Finance Workspace"
          >
            <ArrowLeftRight className="w-4 h-4 shrink-0 text-indigo-400" />
            {!collapsed && <span>Personal Workspace</span>}
          </button>

          {/* Admin Profile & Logout */}
          <div
            className={`flex items-center justify-between p-2 rounded-xl glass-subtle border border-slate-700/50 ${
              collapsed ? 'flex-col space-y-2' : ''
            }`}
          >
            {!collapsed && (
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user?.fullName || 'Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'admin@moneyos.com'}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign out of session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between h-16 px-6 glass-surface border-b border-white/10 bg-slate-900/60 backdrop-blur-xl shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-1 rounded-lg lg:hidden text-slate-400 hover:text-white hover:bg-white/[0.06]"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-white tracking-tight">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <GlassBadge variant="accent" size="sm">
              SYSTEM LIVE
            </GlassBadge>
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl glass-pill text-slate-400 hover:text-white transition-colors"
              title="Refresh View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Nested Viewport Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
