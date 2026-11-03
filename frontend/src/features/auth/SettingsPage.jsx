import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  GlassSurface,
  GlassButton,
  GlassBadge,
} from '../../components/ui/glass'
import { logout } from './authSlice'
import { toast } from '../../lib/toast'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [error, setError] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setError(null)
    setLoggingOut(true)
    try {
      await dispatch(logout()).unwrap()
      toast.success('Signed out successfully.')
      navigate('/login', { replace: true })
    } catch (message) {
      setError(message)
      setLoggingOut(false)
      toast.error('Logout failed', message || 'Please try again.')
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Account & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your MoneyOS security, preferences, and workspace authentication
        </p>
      </div>

      {error && (
        <div role="alert" className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Profile Details */}
      <GlassSurface className="p-6">
        <h2 className="text-base font-semibold text-white tracking-tight mb-4">User Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl glass-subtle border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Full Name
            </span>
            <p className="text-base font-medium text-slate-100 mt-1">
              {user?.fullName || 'Not available'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl glass-subtle border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Email Address
            </span>
            <p className="text-base font-medium text-slate-100 mt-1 truncate">
              {user?.email || 'Not available'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl glass-subtle border border-slate-700/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Base Currency
            </span>
            <p className="text-base font-medium text-slate-100 mt-1 font-mono">
              {user?.currency || 'INR'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl glass-subtle border border-slate-700/60 flex flex-col justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Account Role
            </span>
            <div className="mt-1">
              <GlassBadge variant={isAdmin ? 'accent' : 'default'} size="sm">
                {user?.role || 'USER'}
              </GlassBadge>
            </div>
          </div>
        </div>
      </GlassSurface>

      {/* Financial Profile */}
      <GlassSurface className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Financial Profile</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Update your income, lifestyle situation, savings goals, and financial planning parameters.
            </p>
          </div>
          <GlassButton
            type="button"
            onClick={() => navigate('/onboarding?edit=1')}
            variant="secondary"
          >
            Edit Financial Profile
          </GlassButton>
        </div>
      </GlassSurface>

      {/* Admin Panel (Visible Only To Authenticated Admins) */}
      {isAdmin && (
        <GlassSurface className="p-6 border-indigo-500/30 bg-indigo-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <h2 className="text-base font-semibold text-white tracking-tight">Admin Console</h2>
                <GlassBadge variant="accent" size="sm">
                  AUTHORIZED
                </GlassBadge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Access system health, user analytics, security audit logs, and global platform configuration.
              </p>
            </div>
            <GlassButton
              type="button"
              onClick={() => navigate('/admin')}
              variant="accent"
            >
              Open Admin Console
            </GlassButton>
          </div>
        </GlassSurface>
      )}

      {/* Session / Authentication Management */}
      <GlassSurface className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Session Management</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign out from your current device session.
            </p>
          </div>
          <GlassButton
            type="button"
            onClick={handleLogout}
            variant="danger"
            loading={loggingOut}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
          >
            Log Out
          </GlassButton>
        </div>
      </GlassSurface>
    </div>
  )
}
