import { Header } from '@/components/Header'
import { AuthGuard } from '@/components/AuthGuard'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 safe-area-bottom">
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}

