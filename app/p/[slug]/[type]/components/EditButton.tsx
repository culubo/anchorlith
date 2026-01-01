'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface EditButtonProps {
  userId: string
}

export function EditButton({ userId }: EditButtonProps) {
  const [isOwner, setIsOwner] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const pageType = params?.type as string

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user && user.id === userId) {
          setIsOwner(true)
        }
      } catch (error) {
        console.error('Failed to check ownership:', error)
      } finally {
        setIsChecking(false)
      }
    }
    checkOwnership()
  }, [userId, supabase])

  if (isChecking || !isOwner) {
    return null
  }

  const handleEdit = () => {
    if (pageType && ['resume', 'portfolio', 'links'].includes(pageType)) {
      router.push(`/public?edit=${pageType}`)
    } else {
      router.push('/public')
    }
  }

  const getEditLabel = () => {
    switch (pageType) {
      case 'resume':
        return 'Edit Resume'
      case 'portfolio':
        return 'Edit Portfolio'
      case 'links':
        return 'Edit Links'
      default:
        return 'Edit'
    }
  }

  return (
    <Button
      onClick={handleEdit}
      className="mb-6"
    >
      {getEditLabel()}
    </Button>
  )
}

