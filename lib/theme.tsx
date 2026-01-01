'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'flat' | 'glassmorphism' | 'neumorphism'
type ColorMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  colorMode: ColorMode
  effectiveColorMode: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  setColorMode: (mode: ColorMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('flat')
  const [colorMode, setColorModeState] = useState<ColorMode>('system')
  const [effectiveColorMode, setEffectiveColorMode] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const savedColorMode = localStorage.getItem('colorMode') as ColorMode | null
    
    if (savedTheme) setThemeState(savedTheme)
    if (savedColorMode) setColorModeState(savedColorMode)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Determine effective color mode
    let effective: 'light' | 'dark' = 'light'
    if (colorMode === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      effective = colorMode
    }
    setEffectiveColorMode(effective)

    // Apply theme and color mode to document
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-color-mode', effective)
  }, [theme, colorMode, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode)
    localStorage.setItem('colorMode', mode)
  }

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || colorMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const effective = mediaQuery.matches ? 'dark' : 'light'
      setEffectiveColorMode(effective)
      document.documentElement.setAttribute('data-color-mode', effective)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [colorMode, mounted])

  // Always provide context, even before mounting
  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorMode,
        effectiveColorMode,
        setTheme,
        setColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

