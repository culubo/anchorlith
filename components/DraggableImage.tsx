'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/lib/theme'

interface DraggableImageProps {
  src: string
  alt?: string
  id: string
  initialX?: number
  initialY?: number
  onPositionChange?: (id: string, x: number, y: number) => void
  onDelete?: (id: string) => void
}

export function DraggableImage({
  src,
  alt = '',
  id,
  initialX = 0,
  initialY = 0,
  onPositionChange,
  onDelete,
}: DraggableImageProps) {
  const { customization } = useTheme()
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const isImageAnarchy = customization.imageAnarchy

  useEffect(() => {
    if (!isImageAnarchy) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      setPosition({ x: newX, y: newY })
      onPositionChange?.(id, newX, newY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, id, onPositionChange, isImageAnarchy])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImageAnarchy) return
    e.preventDefault()
    setIsDragging(true)
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      setDragStart({
        x: e.clientX - rect.left - position.x,
        y: e.clientY - rect.top - position.y,
      })
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isImageAnarchy) return
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      setDragStart({
        x: touch.clientX - rect.left - position.x,
        y: touch.clientY - rect.top - position.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isImageAnarchy || !isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y
    setPosition({ x: newX, y: newY })
    onPositionChange?.(id, newX, newY)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (!isImageAnarchy) {
    return (
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded my-2"
      />
    )
  }

  return (
    <div
      ref={imageRef}
      className="relative inline-block cursor-move select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: isDragging ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-w-md h-auto rounded shadow-lg"
        draggable={false}
      />
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Delete image"
        >
          ×
        </button>
      )}
    </div>
  )
}



