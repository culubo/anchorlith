'use client'

import { Button } from '@/components/ui/Button'

export type FilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'tag'

interface TodoFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  tagFilter?: string
}

export function TodoFilters({ activeFilter, onFilterChange, tagFilter }: TodoFiltersProps) {
  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
  ]

  return (
    <div className="flex items-center gap-4 mb-6">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          variant={activeFilter === filter.value ? 'default' : 'ghost'}
          className={`text-sm ${activeFilter === filter.value ? 'text-text-primary' : ''}`}
        >
          {filter.label}
        </Button>
      ))}
      {tagFilter && (
        <span className="text-sm text-text-secondary">
          Tag: #{tagFilter}
        </span>
      )}
    </div>
  )
}

