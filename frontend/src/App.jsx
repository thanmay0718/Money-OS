// src/App.jsx
import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCurrentUser } from './features/auth/authSlice'
import { loadProfile } from './features/onboarding/onboardingSlice'
import IconRail from './components/layout/IconRail'
import KineticGrid from './components/background/KineticGrid'
import TopBar from './components/layout/TopBar'
import Dashboard from './features/dashboard/Dashboard'
import OverviewPage from './features/overview/OverviewPage'
import TransactionsPage from './features/transactions/TransactionsPage'
import PocketsPage from './features/pockets/PocketsPage'
import CategoriesPage from './features/categories/CategoriesPage'
import SettingsPage from './features/auth/SettingsPage'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import OAuthCallbackPage from './features/auth/OAuthCallbackPage'
import LandingPage from './features/landing/LandingPage'
import FinancialOnboarding from './features/onboarding/FinancialOnboarding'
import BackendUnavailablePage from './features/offline/BackendUnavailablePage'
import NotFoundPage from './features/offline/NotFoundPage'
import {
  BACKEND_AVAILABLE_EVENT,
  BACKEND_UNAVAILABLE_EVENT,
} from './lib/backendStatus'
import { Toaster } from 'sileo'
import 'sileo/styles.css'

// Admin Experience Components
import AdminLayout from './features/admin/AdminLayout'
import AdminOverviewPage from './features/admin/AdminOverviewPage'
import AdminUsersPage from './features/admin/AdminUsersPage'
import AdminAnalyticsPage from './features/admin/AdminAnalyticsPage'
import AdminCategoriesPage from './features/admin/AdminCategoriesPage'
import AdminAuditLogsPage from './features/admin/AdminAuditLogsPage'
import AdminSystemHealthPage from './features/admin/AdminSystemHealthPage'

// Standard protected route wrapper with Liquid Glass loading
function ProtectedRoute({ children }) {
  const { token, sessionRestored } = useSelector((state) => state.auth)

  if (!sessionRestored) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-surface border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin" />
          <p className="text-slate-300 text-xs font-medium tracking-wide">Restoring secure session…</p>
        </div>
      </div>
    )
  }

  return token ? children : <Navigate to="/welcome" replace />
}

// Admin-only protected route wrapper
function AdminRoute({ children }) {
  const { token, user, sessionRestored } = useSelector((state) => state.auth)

  if (!sessionRestored) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-surface border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin" />
          <p className="text-slate-300 text-xs font-medium tracking-wide">Verifying authorization…</p>
        </div>
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

// Routes to dashboard if onboarding is completed, or to /onboarding if not completed
function DashboardRoute() {
  const { completed, status: onboardingStatus } = useSelector((state) => state.onboarding)

  if (onboardingStatus === 'loading' || onboardingStatus === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl glass-surface border border-white/10 shadow-xl backdrop-blur-xl">
          <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin" />
          <p className="text-slate-300 text-xs font-medium tracking-wide">Loading financial workspace…</p>
        </div>
      </div>
    )
  }

  if (onboardingStatus === 'succeeded' && !completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <Dashboard />
}

export default function App() {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const token = useSelector((state) => state.auth.token)
  const [backendError, setBackendError] = React.useState(null)
  const isLanding = pathname === '/welcome' || (!token && pathname === '/')
  const isAuthPage = ['/login', '/register', '/signup', '/oauth/callback', '/welcome'].includes(pathname) || (!token && pathname === '/')
  const isAdminPage = pathname.startsWith('/admin')

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser())
      dispatch(loadProfile())
    }
  }, [dispatch, token])

  useEffect(() => {
    const markUnavailable = (event) => {
      setBackendError({ status: event.detail?.status ?? null })
    }
    const markAvailable = () => setBackendError(null)

    window.addEventListener(BACKEND_UNAVAILABLE_EVENT, markUnavailable)
    window.addEventListener(BACKEND_AVAILABLE_EVENT, markAvailable)
    return () => {
      window.removeEventListener(BACKEND_UNAVAILABLE_EVENT, markUnavailable)
      window.removeEventListener(BACKEND_AVAILABLE_EVENT, markAvailable)
    }
  }, [])

  if (backendError) {
    return <BackendUnavailablePage status={backendError.status} />
  }

  // When inside Admin, AdminLayout provides its own dedicated sidebar and topbar
  if (isAdminPage) {
    return (
      <div className="relative min-h-screen bg-background text-primaryText font-sans antialiased overflow-x-hidden">
        <Toaster
          position="top-center"
          theme="light"
          options={{ duration: 3500, autopilot: { expand: 0, collapse: 3000 } }}
        />
        <KineticGrid />
        <div className="relative z-10">
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="health" element={<AdminSystemHealthPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-background text-primaryText font-sans antialiased overflow-x-hidden">
      <Toaster
        position="top-center"
        theme="light"
        options={{ duration: 3500, autopilot: { expand: 0, collapse: 3000 } }}
      />
      {/* Liquid Glass Ambient Lighting Blooms */}
      <div className="ambient-glow-background" aria-hidden="true" />

      {/* Floating Navigation Rail (Desktop + Mobile Dock) */}
      {!isAuthPage && <IconRail />}

      {/* Main Viewport Container */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 overflow-hidden">
        {!isAuthPage && <TopBar />}
        <main
          className={`flex-1 overflow-y-auto ${
            isLanding
              ? 'p-0 w-full h-full'
              : isAuthPage
              ? 'grid place-items-center p-6'
              : 'p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto'
          }`}
        >
          <Routes>
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/overview"
              element={
                <ProtectedRoute>
                  <OverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                token ? (
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                ) : (
                  <LandingPage />
                )
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pockets"
              element={
                <ProtectedRoute>
                  <PocketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <FinancialOnboarding />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
