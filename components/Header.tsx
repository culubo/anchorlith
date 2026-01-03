'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NavTabs } from './NavTabs'
import { SearchBar } from './SearchBar'
import { Button } from './ui/Button'

export function Header() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-sm border-b border-border-subtle safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          <Link href="/today" className="flex items-center gap-3 text-lg sm:text-xl text-text-primary hover:opacity-70 transition-opacity flex-shrink-0">
            <Image src="/logo.png" alt="AnchorLith" width={36} height={36} className="rounded" />
            <span className="hidden sm:inline font-medium">AnchorLith</span>
          </Link>
          
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-8 min-w-0">
            <NavTabs />
            <div className="hidden sm:block">
              <SearchBar />
            </div>
          </div>

          <Button onClick={handleSignOut} variant="ghost" className="text-xs sm:text-sm flex-shrink-0 min-h-[44px] px-2 sm:px-4">
            <span className="hidden sm:inline">Sign out</span>
            <span className="sm:hidden">Out</span>
          </Button>
        </div>
        <div className="sm:hidden mt-2">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}

