import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="text-center space-y-4">
        <h1 className="text-2xl text-text-primary">404</h1>
        <p className="text-text-secondary">Page not found</p>
        <Link href="/today">
          <Button>Go to Today</Button>
        </Link>
      </div>
    </div>
  )
}

