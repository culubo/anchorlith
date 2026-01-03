'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const tabs = [
  { href: '/today', label: 'Today' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/notes', label: 'Notes' },
  { href: '/todos', label: 'Todos' },
  { href: '/reminders', label: 'Reminders' },
  { href: '/public', label: 'Public' },
  { href: '/piggybank', label: 'Piggybank' },
  { href: '/settings', label: 'Settings' },
]

export function NavTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-hide -mx-2 sm:mx-0 px-2 sm:px-0">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || (tab.href !== '/today' && pathname?.startsWith(tab.href))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              text-xs sm:text-sm relative whitespace-nowrap min-h-[44px] flex items-center px-2 sm:px-0
              ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}
              transition-colors
            `}
          >
            {tab.label}
            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-px bg-text-primary"
                layoutId="activeTab"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

