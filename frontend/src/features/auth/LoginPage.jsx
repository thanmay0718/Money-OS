import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { login, clearAuthError } from './authSlice'
import { toast } from '../../lib/toast'
import MoneyOSLogo from '../../components/ui/MoneyOSLogo'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, status, error: reduxError } = useSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  const oauthError = searchParams.get('oauthError')

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (oauthError) {
      setLocalError(oauthError)
      toast.error('Authentication Error', oauthError)
    }
  }, [oauthError])

  if (token) return <Navigate to="/" replace />

  const displayError = localError || reduxError

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  const handleSubmit = async (event) => {
    if (event) event.preventDefault()
    setLocalError(null)

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.')
      return
    }
    if (!validateEmail(email.trim())) {
      setLocalError('Please enter a valid email address.')
      return
    }

    try {
      await dispatch(login({ email: email.trim(), password })).unwrap()
      toast.success('Welcome back to MoneyOS!')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error('Sign In Failed', err || 'Please check your email and password.')
    }
  }

  const handleOAuthRedirect = (provider) => {
    setLocalError(null)
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL
    const baseUrl = rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim().replace(/\/+$/, '') : ''
    window.location.assign(`${baseUrl}/oauth2/authorization/${provider}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden w-full py-12 px-4 selection:bg-primaryAccent selection:text-white">
      {/* Ambient background glows for glassmorphism depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-primaryAccent/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[280px] bg-accentSoft/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] p-8 flex flex-col items-center">
        {/* Brand Logo Icon */}
        <div className="mb-4 shadow-lg shadow-[#C3ABFA]/20 rounded-2xl transition-transform hover:scale-105">
          <MoneyOSLogo size={56} />
        </div>

        {/* Title & Tagline */}
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 text-center font-sans">
          Money<span className="text-primaryAccent">OS</span>
        </h2>
        <p className="text-xs text-secondaryText mb-6 text-center font-medium">
          Modern personal finance & cash-flow intelligence
        </p>

        {/* Error Notification */}
        {displayError && (
          <div
            role="alert"
            className="w-full mb-4 rounded-xl border border-negative/30 bg-negative/10 px-3.5 py-2.5 text-xs text-negative font-medium text-center"
          >
            {displayError}
          </div>
        )}

        {/* Form Container */}
        <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-mutedText text-sm focus:outline-none focus:ring-2 focus:ring-primaryAccent/60 focus:border-transparent transition-all"
              onChange={(e) => {
                setLocalError(null)
                setEmail(e.target.value)
              }}
            />
            <input
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-mutedText text-sm focus:outline-none focus:ring-2 focus:ring-primaryAccent/60 focus:border-transparent transition-all"
              onChange={(e) => {
                setLocalError(null)
                setPassword(e.target.value)
              }}
            />
          </div>

          <hr className="border-t border-white/10 my-1" />

          <div>
            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primaryAccent text-white font-semibold px-5 py-3 rounded-full shadow-lg shadow-primaryAccent/25 hover:bg-accentSoft transition-all mb-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Signing in…' : 'Sign in'}
            </button>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthRedirect('google')}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-b from-[#232526] to-[#2d2e30] border border-white/10 rounded-full px-5 py-2.5 font-medium text-white shadow-md hover:brightness-110 active:scale-[0.99] transition mb-2.5 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthRedirect('github')}
              className="w-full flex items-center justify-center gap-2.5 bg-white/[0.06] border border-white/10 rounded-full px-5 py-2.5 font-medium text-white shadow-md hover:bg-white/[0.12] active:scale-[0.99] transition mb-3 text-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              Continue with GitHub
            </button>

            {/* Sign up redirection link */}
            <div className="w-full text-center mt-3">
              <span className="text-xs text-secondaryText">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="underline text-white font-medium hover:text-accentSoft transition-colors"
                >
                  Sign up, it&apos;s free!
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Social proof trust badge */}
      <div className="relative z-10 mt-10 flex flex-col items-center text-center">
        <p className="text-secondaryText text-xs md:text-sm mb-2.5">
          Join <span className="font-semibold text-white">thousands</span> of mindful savers managing their cash flow with MoneyOS.
        </p>
        <div className="flex -space-x-2">
          <img
            src="https://cdn.21st.dev/assets/mirror/a6/a634d4f02fe5b77804943c1d74b8d70e35ffe26454e0e9af9717432a2c72bfde.jpg"
            alt="MoneyOS User"
            className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
          />
          <img
            src="https://cdn.21st.dev/assets/mirror/d8/d8dab29a5736d5c2b0084d720d3db02c785560071609be501541922928fdf831.jpg"
            alt="MoneyOS User"
            className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
          />
          <img
            src="https://cdn.21st.dev/assets/mirror/d1/d1a3e08d4e37d6ee2b7de1db8df87c1dc7acd8ffb004caaf980917de518a60c9.jpg"
            alt="MoneyOS User"
            className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
          />
          <img
            src="https://cdn.21st.dev/assets/mirror/f0/f07b84f12ef125cbb837a7bd64da401992f5f62bd55fee10d01cd3dcc8abae80.jpg"
            alt="MoneyOS User"
            className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-sm"
          />
        </div>
      </div>
    </div>
  )
}
