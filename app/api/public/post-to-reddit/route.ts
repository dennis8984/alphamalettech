import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { post_id, title, content, subreddit } = await request.json()
    
    console.log(`Posting to Reddit - r/${subreddit}: ${title}`)
    
    // Reddit credentials
    const credentials = {
      client_id: '7aN2QARs_vb9VSNzTbGljw',
      client_secret: '081J7MOxDhtzMOxQ2LuqY9kG1FOY0Q',
      refresh_token: '411067208298-1tHvdxQJMflzOzO9eaOPvbLofRT5Wg',
      user_agent: 'MensHealthBot/1.0 by /u/holdinaces4u'
    }
    
    // Get access token
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${credentials.client_id}:${credentials.client_secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': credentials.user_agent
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refresh_token
      })
    })
    
    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      throw new Error('Failed to get Reddit access token')
    }
    
    // Submit the post
    const postResponse = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': credentials.user_agent
      },
      body: new URLSearchParams({
        api_type: 'json',
        kind: 'self',
        sr: subreddit,
        title: title,
        text: content
      })
    })
    
    const postResult = await postResponse.json()
    
    // Update the social post record
    if (post_id) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        if (postResult.json?.data?.url) {
          // Success
          await supabase
            .from('social_posts')
            .update({
              status: 'posted',
              posted_at: new Date().toISOString(),
              post_url: postResult.json.data.url,
              post_id: postResult.json.data.id
            })
            .eq('id', post_id)
        } else {
          // Failed
          const error = postResult.json?.errors?.[0]?.[1] || 'Unknown error'
          await supabase
            .from('social_posts')
            .update({
              status: 'failed',
              error_message: error
            })
            .eq('id', post_id)
        }
      }
    }
    
    if (postResult.json?.errors?.length > 0) {
      return NextResponse.json({
        success: false,
        error: postResult.json.errors[0][1] || 'Failed to post'
      })
    }
    
    if (postResult.json?.data?.url) {
      return NextResponse.json({
        success: true,
        message: 'Posted successfully!',
        url: postResult.json.data.url,
        id: postResult.json.data.id
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unexpected response from Reddit',
      details: postResult
    })
    
  } catch (error: any) {
    console.error('Error posting to Reddit:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to post'
      },
      { status: 500 }
    )
  }
}