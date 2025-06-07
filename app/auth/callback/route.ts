import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/admin/auth/signin?error=auth_failed', requestUrl.origin))
      }
      
      // Success - redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin', requestUrl.origin))
    } catch (error) {
      console.error('Unexpected auth error:', error)
      return NextResponse.redirect(new URL('/admin/auth/signin?error=unexpected', requestUrl.origin))
    }
  }
  
  // No code parameter - redirect to signin
  return NextResponse.redirect(new URL('/admin/auth/signin', requestUrl.origin))
} 