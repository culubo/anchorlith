'use client'

export function resolveSiteUrl() {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (process.env.NODE_ENV === 'production') {
    if (!envSiteUrl || envSiteUrl.includes('localhost') || envSiteUrl.includes('127.0.0.1')) {
      console.warn('NEXT_PUBLIC_SITE_URL is missing or points to localhost; using window.location.origin as a fallback for email redirects.')
      return window.location.origin
    }
    return envSiteUrl
  }

  return envSiteUrl || window.location.origin
}
