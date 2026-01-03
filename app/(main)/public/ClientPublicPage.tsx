'use client'

import { useState, useLayoutEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResumeEditor } from './components/ResumeEditor'
import { PortfolioEditor } from './components/PortfolioEditor'
import { LinksEditor } from './components/LinksEditor'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

type Tab = 'resume' | 'portfolio' | 'links'

export default function ClientPublicPage() {
  const searchParams = useSearchParams()
  const editType = searchParams?.get('edit')
  const initialTab: Tab = (editType && ['resume', 'portfolio', 'links'].includes(editType)) 
    ? (editType as Tab) 
    : 'resume'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  // Check if we're coming from an edit link
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => {
    if (editType && ['resume', 'portfolio', 'links'].includes(editType)) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setActiveTab(editType as Tab)
      })
    }
  }, [editType])

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
