'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function PublicLinks() {
  const links = [
    { href: '/public?tab=resume', label: 'Resume' },
    { href: '/public?tab=portfolio', label: 'Portfolio' },
    { href: '/public?tab=links', label: 'Links' },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Public</h3>
      {links.map((link) => (
        <motion.div
          key={link.href}
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            href={link.href}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors block"
          >
            {link.label}
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

