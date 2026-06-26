import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/security/admin'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in, check if they're admin and redirect appropriately
  if (session) {
    const { data: profile } = await supabase
      .from('perfiles')
      .select('es_admin, role')
      .eq('id', session.user.id)
      .single()

    const isAdminFromProfile = profile?.es_admin === true || profile?.role === 'admin'
    const isAdmin = isAdminFromProfile || isAdminEmail(session.user.email)

    // If admin is trying to access login/register pages, redirect to admin dashboard
    if (isAdmin && (req.nextUrl.pathname.startsWith('/auth/login') || req.nextUrl.pathname.startsWith('/auth/registro'))) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // If non-admin tries to access admin, redirect to arquitectura
    if (!isAdmin && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/arquitectura', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
    '/auth/registro',
    '/auth/callback',
  ]
}
