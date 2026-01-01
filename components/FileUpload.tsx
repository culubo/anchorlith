'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { uploadFile } from '@/lib/storage'
import { Loading } from './ui/Loading'

interface FileUploadProps {
  linkedType: 'note' | 'event' | 'todo' | 'portfolio'
  linkedId?: string
  onUploadComplete?: (file: any) => void
  accept?: string
}

export function FileUpload({
  linkedType,
  linkedId,
  onUploadComplete,
  accept = 'image/*,application/pdf',
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const uploadedFile = await uploadFile(file, linkedType, linkedId)
      onUploadComplete?.(uploadedFile)
      e.target.value = '' // Reset input
    } catch (err: any) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="cursor-pointer">
        <input
          type="file"
          onChange={handleFileChange}
          accept={accept}
          disabled={isUploading}
          className="hidden"
        />
        <Button
          type="button"
          disabled={isUploading}
          variant="ghost"
          className="text-sm"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Loading size="sm" />
              Uploading...
            </span>
          ) : (
            'Upload File'
          )}
        </Button>
      </label>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

