'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type ColorMode = 'light' | 'dark' | 'system'

interface CustomizationSettings {
  backgroundColor: string
  backgroundImage: string
  fontFamily: string
  imageAnarchy: boolean
}

interface ThemeContextType {
  colorMode: ColorMode
  effectiveColorMode: 'light' | 'dark'
  customization: CustomizationSettings
  setColorMode: (mode: ColorMode) => void
  setCustomization: (settings: Partial<CustomizationSettings>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultCustomization: CustomizationSettings = {
  backgroundColor: '',
  backgroundImage: '',
  fontFamily: 'system-ui',
  imageAnarchy: false,
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>('system')
  const [effectiveColorMode, setEffectiveColorMode] = useState<'light' | 'dark'>('light')
  const [customization, setCustomizationState] = useState<CustomizationSettings>(defaultCustomization)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const savedColorMode = localStorage.getItem('colorMode') as ColorMode | null
    const savedCustomization = localStorage.getItem('customization')
    
    if (savedColorMode) setColorModeState(savedColorMode)
    if (savedCustomization) {
      try {
        setCustomizationState({ ...defaultCustomization, ...JSON.parse(savedCustomization) })
      } catch (e) {
        console.error('Failed to parse customization settings', e)
      }
    }
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

    // Apply color mode to document
    document.documentElement.setAttribute('data-color-mode', effective)
    
    // Apply customization
    const root = document.documentElement
    if (customization.backgroundColor) {
      root.style.setProperty('--custom-bg-color', customization.backgroundColor)
    } else {
      root.style.removeProperty('--custom-bg-color')
    }
    
    if (customization.backgroundImage) {
      root.style.setProperty('--custom-bg-image', `url(${customization.backgroundImage})`)
    } else {
      root.style.removeProperty('--custom-bg-image')
    }
    
    if (customization.fontFamily && customization.fontFamily !== 'system-ui') {
      root.style.setProperty('--custom-font-family', customization.fontFamily)
    } else {
      root.style.removeProperty('--custom-font-family')
    }
    
    root.setAttribute('data-image-anarchy', customization.imageAnarchy ? 'true' : 'false')
  }, [colorMode, customization, mounted])

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode)
    localStorage.setItem('colorMode', mode)
  }

  const setCustomization = (settings: Partial<CustomizationSettings>) => {
    const newCustomization = { ...customization, ...settings }
    setCustomizationState(newCustomization)
    localStorage.setItem('customization', JSON.stringify(newCustomization))
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
        colorMode,
        effectiveColorMode,
        customization,
        setColorMode,
        setCustomization,
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

