import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Snake404 } from '../../components/ui/Snake404'

const THEME_STORAGE_KEY = 'moneyos-offline-theme'

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  } catch {
    // Theme selection remains available for the current visit.
  }
  return 'dark'
}

export default function NotFoundPage() {
  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    setTheme(nextTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      // Keep the selected theme in component state if storage is unavailable.
    }
  }

  return (
    <main
      className={`fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-between overflow-hidden px-5 py-8 transition-colors duration-300 sm:px-8 sm:py-10 ${
        isDark ? 'bg-[#101014] text-[#F5F3FA]' : 'bg-[#F4F1FA] text-[#211A2D]'
      }`}
    >
      <Snake404
        code="404"
        theme={theme}
        label="404, page not found"
        cellSize={14}
        speed={12}
        score={false}
        className="fixed inset-0 opacity-45"
      />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        className={`relative z-10 ml-auto inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium backdrop-blur-md transition-colors ${
          isDark
            ? 'border-white/10 bg-[#101014]/70 text-[#F5F3FA] hover:bg-white/10'
            : 'border-[#DED7EB] bg-white/80 text-[#382D49] hover:bg-white'
        }`}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
        <span>{isDark ? 'Light theme' : 'Dark theme'}</span>
      </button>

      <section className="relative z-10 my-auto max-w-lg rounded-2xl px-6 py-8 text-center backdrop-blur-sm">
        <p className="text-sm font-semibold tracking-[0.3em] text-[#C3ABFA]">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-[#AAA5B5]' : 'text-[#625B6D]'}`}>
          We couldn’t find the page you’re looking for.
        </p>
        <Link
          to="/"
          className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
            isDark
              ? 'bg-[#C3ABFA] text-[#18151F] hover:bg-[#D5C5FF]'
              : 'bg-[#7653B5] text-white hover:bg-[#6745A4]'
          }`}
        >
          Go to MoneyOS
        </Link>
      </section>
    </main>
  )
}
