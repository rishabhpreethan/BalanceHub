"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    // Determine initial theme
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem("theme")) as Theme | null
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light")
    applyTheme(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyTheme = (t: Theme) => {
    setThemeState(t)
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (t === "dark") root.classList.add("dark")
      else root.classList.remove("dark")
      root.setAttribute('data-theme', t)
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("theme", t)
    }
  }

  const setTheme = (t: Theme) => applyTheme(t)
  const toggleTheme = () => {
    if (typeof document === 'undefined') return
    const isDark = document.documentElement.classList.contains('dark')
    applyTheme(isDark ? "light" : "dark")
  }

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within Providers")
  return ctx
}
