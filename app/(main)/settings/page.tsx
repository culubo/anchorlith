'use client'

import { ThemeSelector } from './components/ThemeSelector'
import PredictiveWritingToggle from './components/PredictiveWritingToggle'
import { ExportButton } from './components/ExportButton'
import { Divider } from '@/components/ui/Divider'

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl mb-8 text-text-primary">Settings</h1>

      <div className="space-y-12">
        <div className="pl-8">
          <h2 className="text-lg mb-4 text-text-primary">About AnchorLith</h2>
          <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
            <p>
              AnchorLith is a minimalist, text-forward productivity hub designed to help you organize your thoughts, tasks, and schedule in one place. Built with a focus on typography and whitespace, it provides a distraction-free environment for managing your daily life.
            </p>
            
            <div>
              <h3 className="text-base text-text-primary mb-2 mt-6">How It Works</h3>
              <ul className="space-y-2 pl-4 list-disc">
                <li>
                  <strong className="text-text-primary">Today:</strong> Your daily dashboard showing today&apos;s schedule and tasks. Events and reminders appear in the schedule, while todos due today are listed as tasks.
                </li>
                <li>
                  <strong className="text-text-primary">Notes:</strong> Create and organize notes with Markdown support. Use the split-view editor to write and preview your notes. Toggle the &ldquo;Edit&rdquo; checkbox to view past notes in read-only mode.
                </li>
                <li>
                  <strong className="text-text-primary">Todos:</strong> Manage tasks with due dates, priorities, and tags. Complete tasks to see them animate and move to the bottom. Use filters to view today&apos;s tasks, upcoming items, or completed work.
                </li>
                <li>
                  <strong className="text-text-primary">Calendar:</strong> View and create events. Events scheduled for today automatically appear on your Today page.
                </li>
                <li>
                  <strong className="text-text-primary">Reminders:</strong> Set time-based reminders for important tasks or events.
                </li>
                <li>
                  <strong className="text-text-primary">Public Pages:</strong> Create shareable resume, portfolio, or links pages. Control visibility with public, unlisted, or private settings.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base text-text-primary mb-2 mt-6">Privacy & Security</h3>
              <p>
                All your data is private by default. Only content you explicitly mark as public or share via unlisted links can be accessed by others. Your data is stored securely and you can export it at any time from this settings page.
              </p>
            </div>
          </div>
        </div>

        <Divider />

        <ThemeSelector />
        <Divider />
        <PredictiveWritingToggle />
        <Divider />
        <ExportButton />
      </div>
    </div>
  )
}

