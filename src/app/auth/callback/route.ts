import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/main'

  // Ensure next URL is relative to prevent open redirects
  if (!next.startsWith('/')) {
    next = '/main'
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          // Local development
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          // Production with load balancer
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          // Production fallback
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
      
      console.error('Auth callback error:', error)
    } catch (err) {
      console.error('Auth callback exception:', err)
    }
  }

  // Redirect to login with error parameter
  return NextResponse.redirect(`${origin}/login?error=callback_failed`)
}