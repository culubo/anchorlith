'use client'

import { useState } from 'react'
import { ResumeEditor } from './components/ResumeEditor'
import { PortfolioEditor } from './components/PortfolioEditor'
import { LinksEditor } from './components/LinksEditor'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

type Tab = 'resume' | 'portfolio' | 'links'

export default function PublicPage() {
  const [activeTab, setActiveTab] = useState<Tab>('resume')

  const tabs: { label: string; value: Tab }[] = [
    { label: 'Resume', value: 'resume' },
    { label: 'Portfolio', value: 'portfolio' },
    { label: 'Links', value: 'links' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <h1 className="text-2xl mb-8 text-text-primary">Public Pages</h1>

      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border-subtle">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            variant={activeTab === tab.value ? 'default' : 'ghost'}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'resume' && <ResumeEditor />}
      {activeTab === 'portfolio' && <PortfolioEditor />}
      {activeTab === 'links' && <LinksEditor />}
    </motion.div>
  )
}

