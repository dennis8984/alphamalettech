import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addToSocialQueue } from '@/lib/social-queue'
import { headers } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post_id } = await request.json()
    
    if (!post_id) {
      return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
    }

    // Get the failed post
    const { data: post, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', post_id)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Add to queue for retry
    await addToSocialQueue({
      article_id: post.article_id,
      platform: post.platform,
      priority: 10, // High priority for retries
      scheduled_for: new Date() // Process immediately
    })

    // Update post status
    await supabase
      .from('social_posts')
      .update({ 
        status: 'pending',
        retry_count: (post.retry_count || 0) + 1
      })
      .eq('id', post_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry post' },
      { status: 500 }
    )
  }
}