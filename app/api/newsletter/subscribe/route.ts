import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already subscribed to newsletter' },
        { status: 400 }
      )
    }

    // Add user to newsletter table
    const { error: newsletterError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          name,
          email,
          subscribed_at: new Date().toISOString(),
          is_active: true
        }
      ])

    if (newsletterError) {
      console.error('Newsletter subscription error:', newsletterError)
      return NextResponse.json(
        { error: 'Failed to add to newsletter' },
        { status: 500 }
      )
    }

    // Send magic link for authentication
    const { error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${request.nextUrl.origin}/auth/callback?next=${encodeURIComponent('/profile?welcome=true')}`
      }
    })

    if (authError) {
      console.error('Magic link error:', authError)
      // Still return success for newsletter signup even if magic link fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for a login link.'
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 