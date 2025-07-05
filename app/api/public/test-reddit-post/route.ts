import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { title, content, subreddit = 'test' } = await request.json()
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    console.log(`Posting to r/${subreddit}: ${title}`)
    
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
      return NextResponse.json({
        success: false,
        error: 'Failed to get access token'
      })
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
        kind: 'self', // 'self' for text post, 'link' for link post
        sr: subreddit,
        title: title,
        text: content
      })
    })
    
    const postResult = await postResponse.json()
    console.log('Reddit post result:', postResult)
    
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