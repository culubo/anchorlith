import { getTodayData } from '@/lib/queries/today'
import { ScheduleSection } from './components/ScheduleSection'
import { TasksSection } from './components/TasksSection'
import { PublicLinks } from './components/PublicLinks'
import { formatDate } from '@/lib/utils/date'

export default async function TodayPage() {
  const { schedule, tasks, date } = await getTodayData()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
      <div className="lg:col-span-2 space-y-8 sm:space-y-12">
        <div>
          <h1 className="text-xl sm:text-2xl mb-2 text-text-primary">
            Today — {formatDate(date)}
          </h1>
        </div>

        <div>
          <h2 className="text-base sm:text-lg mb-4 text-text-primary">Schedule</h2>
          <ScheduleSection items={schedule} />
        </div>

        <div>
          <h2 className="text-base sm:text-lg mb-4 text-text-primary">Tasks</h2>
          <TasksSection tasks={tasks} />
        </div>
      </div>

      <div className="lg:col-span-1">
        <PublicLinks />
      </div>
    </div>
  )
}

