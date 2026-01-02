import { Suspense } from 'react'
import ClientPublicPage from './ClientPublicPage'

export default function PublicPage() {
  return (
    <Suspense fallback={<div />}>
      <ClientPublicPage />
    </Suspense>
  )
}

