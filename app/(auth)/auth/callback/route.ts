import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const nextParam = requestUrl.searchParams.get('next')
  const typeParam = requestUrl.searchParams.get('type')


  // Always redirect to /auth/reset if either next=/auth/reset or type=recovery is present
  let redirectPath = '/today'
  if (
    (nextParam && nextParam === '/auth/reset') ||
    typeParam === 'recovery' ||
    typeParam === 'invite'
  ) {
    redirectPath = '/auth/reset'
  } else if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    redirectPath = nextParam
  }

  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}${redirectPath}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options as any)
          })
        },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    return supabaseResponse
  }

  // If no code, redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
