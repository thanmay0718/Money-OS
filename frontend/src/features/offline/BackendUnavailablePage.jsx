import React, { useState } from 'react'
import { Moon, RotateCw, Sun } from 'lucide-react'
import { Snake404 } from '../../components/ui/Snake404'

const THEME_STORAGE_KEY = 'moneyos-offline-theme'

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  } catch {
    // Theme selection still works for this visit when storage is unavailable.
  }
  return 'dark'
}

export default function BackendUnavailablePage({ status: initialStatus }) {
  const [theme, setTheme] = useState(getInitialTheme)
  const [retrying, setRetrying] = useState(false)
  const [httpStatus, setHttpStatus] = useState(initialStatus)
  const isDark = theme === 'dark'

  React.useEffect(() => {
    setHttpStatus(initialStatus)
  }, [initialStatus])

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Keep the selected theme in component state if storage is unavailable.
    }
  }

  const retryConnection = async () => {
    setRetrying(true)
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

    try {
      const response = await fetch(`${apiBase}/api/auth/me`, {
        cache: 'no-store',
      })

      if (response.status >= 500) {
        setHttpStatus(response.status)
        return
      }

      window.location.reload()
    } catch {
      setHttpStatus(null)
    } finally {
      setRetrying(false)
    }
  }

  const palette = isDark
    ? {
      page: 'bg-[#101014] text-[#F5F3FA]',
      button: 'bg-[#C3ABFA] text-[#18151F] hover:bg-[#D5C5FF]',
      toggle: 'border-white/10 bg-white/[0.06] text-[#F5F3FA] hover:bg-white/10',
    }
    : {
      page: 'bg-[#F4F1FA] text-[#211A2D]',
      button: 'bg-[#7653B5] text-white hover:bg-[#6745A4]',
      toggle: 'border-[#DED7EB] bg-white/80 text-[#382D49] hover:bg-white',
    }

  return (
    <main
    data-offline-theme={theme}
    className={`fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden px-5 py-20 transition-colors duration-300 sm:px-8 ${palette.page}`}
    >
    <div className="pointer-events-none absolute inset-0 opacity-30">
      <Snake404
        code="404"
        theme={theme}
        label="404, backend unavailable"
        cellSize={14}
        speed={12}
        score={false}
        className="fixed inset-0"
      />
    </div>

    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors sm:right-6 sm:top-6 ${palette.toggle}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? 'Light theme' : 'Dark theme'}</span>
    </button>

    <section className="relative z-10 w-full max-w-xl text-center" aria-labelledby="backend-offline-title">
      <h1 id="backend-offline-title" className="text-2xl font-bold tracking-tight sm:text-4xl">
        Backend unavailable
      </h1>
      <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-[#AAA5B5]' : 'text-[#625B6D]'}`}>
        {httpStatus == null ? 'No HTTP response received' : `HTTP ${httpStatus}`}
      </p>
        <button
          type="button"
          onClick={retryConnection}
          disabled={retrying}
          className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition-colors disabled:cursor-wait disabled:opacity-60 ${palette.button}`}
        >
          <RotateCw size={16} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Checking connection…' : 'Try again'}
        </button>
    </section>
    </main>
  )
}
