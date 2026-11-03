import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { register, clearAuthError, resetRegisterSuccess } from './authSlice'
import { toast } from '../../lib/toast'

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
)

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
)

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }) => (
  <div className="rounded-2xl border border-divider/60 bg-white/[0.04] backdrop-blur-sm transition-colors focus-within:border-primaryAccent/70 focus-within:bg-primaryAccent/10">
    {children}
  </div>
)

const TestimonialCard = ({ testimonial }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-surface/85 backdrop-blur-xl border border-white/10 p-4 w-72 shadow-2xl">
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-xl shrink-0" alt="avatar" />
    <div className="text-xs leading-snug">
      <p className="font-semibold text-white">{testimonial.name}</p>
      <p className="text-mutedText text-[11px]">{testimonial.handle}</p>
      <p className="mt-1 text-secondaryText text-[12px]">{testimonial.text}</p>
    </div>
  </div>
)

const DEFAULT_TESTIMONIALS = [
  {
    avatarSrc:
      'https://cdn.21st.dev/assets/mirror/9f/9f797e4acee1a4de4f9b4c3aa1cc4e89d7c9efd5dbff1c463d88374ed601d719.jpg',
    name: 'Sarah Chen',
    handle: '@sarahdigital',
    text: 'Amazing platform! The user experience is seamless and the features are exactly what I needed.',
  },
  {
    avatarSrc:
      'https://cdn.21st.dev/assets/mirror/8d/8d9a61a581c43fe2088f221b7692c95db4b3ad5c0da0c856400c0e5acdcdcea8.jpg',
    name: 'Marcus Johnson',
    handle: '@marcustech',
    text: 'This service has transformed how I work. Clean design, powerful features, and excellent support.',
  },
]

// --- MAIN SIGN UP COMPONENT ---

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, status, error, registerSuccess } = useSelector((state) => state.auth)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [showPassword, setShowPassword] = useState(false)
  const [clientError, setClientError] = useState('')

  useEffect(() => {
    dispatch(clearAuthError())
    dispatch(resetRegisterSuccess())
  }, [dispatch])

  if (token) return <Navigate to="/" replace />

  const handleOAuthRedirect = (provider) => {
    setClientError('')
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL
    const baseUrl = rawApiUrl && rawApiUrl.trim() ? rawApiUrl.trim().replace(/\/+$/, '') : ''
    window.location.assign(`${baseUrl}/oauth2/authorization/${provider}`)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setClientError('')

    if (!fullName.trim()) {
      setClientError('Full name is required')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setClientError('Please enter a valid email address')
      return
    }
    if (password.length < 8) {
      setClientError('Password must be at least 8 characters')
      return
    }

    try {
      await dispatch(register({ fullName: fullName.trim(), email: email.trim(), password, currency })).unwrap()
      toast.success('Account created successfully!', 'Welcome to MoneyOS. Redirecting to sign in…')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (err) {
      toast.error("Couldn't create account", err || 'Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background text-primaryText font-sans selection:bg-primaryAccent selection:text-white">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primaryAccent/30 bg-primaryAccent/10 text-accentSubtle text-xs font-mono uppercase tracking-wider mb-3">
                ✦ Get Started Free
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Create Account
              </h1>
              <p className="text-secondaryText text-sm mt-1">
                Access your personal financial operating system and take control of your wealth.
              </p>
            </div>

            {/* Success notification */}
            {registerSuccess && (
              <div
                role="status"
                className="rounded-xl border border-positive/30 bg-positive/10 px-4 py-3 text-xs text-positive font-medium text-center"
              >
                Account created successfully! Redirecting to sign in…
              </div>
            )}

            {/* Error banner */}
            {(clientError || error) && !registerSuccess && (
              <div
                role="alert"
                className="rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-xs text-negative font-medium text-center"
              >
                {clientError || error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-medium text-secondaryText mb-1 block">Full Name</label>
                <GlassInputWrapper>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setClientError('')
                      setFullName(e.target.value)
                    }}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent text-sm p-3.5 rounded-2xl text-white placeholder-mutedText focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-medium text-secondaryText mb-1 block">Email Address</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setClientError('')
                      setEmail(e.target.value)
                    }}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm p-3.5 rounded-2xl text-white placeholder-mutedText focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-medium text-secondaryText mb-1 block">Password (min. 8 characters)</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setClientError('')
                        setPassword(e.target.value)
                      }}
                      placeholder="Create a strong password"
                      className="w-full bg-transparent text-sm p-3.5 pr-12 rounded-2xl text-white placeholder-mutedText focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-mutedText hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-medium text-secondaryText mb-1 block">Base Currency</label>
                <GlassInputWrapper>
                  <select
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-transparent text-sm p-3.5 rounded-2xl text-white focus:outline-none cursor-pointer"
                  >
                    <option value="INR" className="bg-surface text-white">INR (₹) - Indian Rupee</option>
                    <option value="USD" className="bg-surface text-white">USD ($) - US Dollar</option>
                    <option value="EUR" className="bg-surface text-white">EUR (€) - Euro</option>
                    <option value="GBP" className="bg-surface text-white">GBP (£) - British Pound</option>
                  </select>
                </GlassInputWrapper>
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || registerSuccess}
                className="w-full rounded-2xl bg-primaryAccent py-3.5 font-semibold text-white shadow-lg shadow-primaryAccent/25 hover:bg-accentSoft transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-1">
              <span className="w-full border-t border-divider"></span>
              <span className="px-3 text-xs text-mutedText bg-background absolute">Or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthRedirect('google')}
                className="w-full flex items-center justify-center gap-2.5 border border-divider rounded-2xl py-3 text-xs font-medium text-white hover:bg-white/[0.06] transition-colors"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthRedirect('github')}
                className="w-full flex items-center justify-center gap-2.5 border border-divider rounded-2xl py-3 text-xs font-medium text-white hover:bg-white/[0.06] transition-colors"
              >
                <GitHubIcon />
                GitHub
              </button>
            </div>

            <p className="text-center text-xs text-secondaryText mt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-accentSoft hover:underline font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      <section className="hidden md:flex flex-1 relative p-6 items-center justify-center">
        <div
          className="absolute inset-6 rounded-3xl bg-cover bg-center overflow-hidden border border-white/10 shadow-2xl"
          style={{
            backgroundImage: `url('https://cdn.21st.dev/assets/mirror/ec/ecff1664e7fc3185d0e947571f984ea5fa3de9580fb0e73a03cd9c9b3461cb09.jpg')`,
            backgroundPosition: 'center',
          }}
        >
          {/* Dark translucent gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />

          {/* Floating Testimonial Cards */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col xl:flex-row gap-4 w-full px-6 justify-center items-center">
            <TestimonialCard testimonial={DEFAULT_TESTIMONIALS[0]} />
            <TestimonialCard testimonial={DEFAULT_TESTIMONIALS[1]} />
          </div>
        </div>
      </section>
    </div>
  )
}
