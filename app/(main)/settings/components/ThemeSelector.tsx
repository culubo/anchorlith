'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/Button'

export function ThemeSelector() {
  const { theme, colorMode, setTheme, setColorMode } = useTheme()

  return (
    <div className="space-y-6 pl-8">
      <div>
        <h3 className="text-base text-text-primary mb-4">Theme Style</h3>
        <div className="flex items-center gap-4">
          {(['flat', 'glassmorphism', 'neumorphism'] as const).map((t) => (
            <Button
              key={t}
              onClick={() => setTheme(t)}
              variant={theme === t ? 'default' : 'ghost'}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base text-text-primary mb-4">Color Mode</h3>
        <div className="flex items-center gap-4">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <Button
              key={mode}
              onClick={() => setColorMode(mode)}
              variant={colorMode === mode ? 'default' : 'ghost'}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

