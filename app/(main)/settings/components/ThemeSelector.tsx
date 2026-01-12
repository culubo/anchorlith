'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileUpload } from '@/components/FileUpload'
import { createClient } from '@/lib/supabase/client'

const FONTS = [
  { name: 'System Default', value: 'system-ui' },
  { name: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Monaco', value: 'Monaco, "Courier New", monospace' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
]

export function ThemeSelector() {
  const { colorMode, customization, setColorMode, setCustomization } = useTheme()
  const [bgColor, setBgColor] = useState(customization.backgroundColor)
  const [bgImageUrl, setBgImageUrl] = useState(customization.backgroundImage)

  // Sync local inputs if customization changes elsewhere
  useEffect(() => {
    setBgColor(customization.backgroundColor)
    setBgImageUrl(customization.backgroundImage)
  }, [customization])

  const handleBgColorChange = (color: string) => {
    setBgColor(color)
    setCustomization({ backgroundColor: color })
  }

  const handleBgImageUrlChange = (url: string) => {
    setBgImageUrl(url)
    setCustomization({ backgroundImage: url })
  }

  const handleImageUpload = async (file: { publicUrl?: string }) => {
    if (file.publicUrl) {
      setBgImageUrl(file.publicUrl)
      setCustomization({ backgroundImage: file.publicUrl })
    }
  }

  const handleFontChange = (font: string) => {
    setCustomization({ fontFamily: font })
  }

  const toggleImageAnarchy = () => {
    setCustomization({ imageAnarchy: !customization.imageAnarchy })
  }

  return (
    <div className="space-y-8 pl-8">
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

      <div>
        <h3 className="text-base text-text-primary mb-4">Background Color</h3>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={bgColor || (colorMode === 'dark' ? '#000000' : '#ffffff')}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="w-16 h-10 rounded cursor-pointer"
          />
          <Input
            type="text"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            placeholder="#ffffff or transparent"
            className="flex-1 max-w-xs"
          />
          <Button
            onClick={() => {
              setBgColor('')
              setCustomization({ backgroundColor: '' })
            }}
            variant="ghost"
            className="text-sm"
          >
            Reset
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-base text-text-primary mb-4">Background Image</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Input
              type="url"
              value={bgImageUrl}
              onChange={(e) => handleBgImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 max-w-md"
            />
            <FileUpload
              linkedType="portfolio"
              onUploadComplete={handleImageUpload}
              accept="image/*"
            />
            <Button
              onClick={() => {
                setBgImageUrl('')
                setCustomization({ backgroundImage: '' })
              }}
              variant="ghost"
              className="text-sm"
            >
              Remove
            </Button>
          </div>
          {bgImageUrl && (
            <div className="text-xs text-text-secondary">
              Preview: <span className="text-text-tertiary">{bgImageUrl.substring(0, 60)}...</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-base text-text-primary mb-4">Font Family</h3>
        <div className="flex flex-wrap items-center gap-2">
          {FONTS.map((font) => (
            <Button
              key={font.value}
              onClick={() => handleFontChange(font.value)}
              variant={customization.fontFamily === font.value ? 'default' : 'ghost'}
              className="text-sm"
            >
              {font.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base text-text-primary mb-4">Image Anarchy</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={customization.imageAnarchy}
              onChange={toggleImageAnarchy}
              className="w-4 h-4"
            />
            <span className="text-sm text-text-secondary">
              Enable image anarchy mode (use /image command to insert and drag images)
            </span>
          </label>
        </div>
        <p className="text-xs text-text-tertiary mt-2">
          Keyboard shortcut: Press <kbd className="px-1.5 py-0.5 bg-bg-secondary border border-border-subtle rounded text-xs">Ctrl/Cmd + Shift + A</kbd> to toggle
        </p>
      </div>
    </div>
  )
}

