import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing Reddit credentials...')
    
    // Hardcoded credentials from the database
    const credentials = {
      client_id: '7aN2QARs_vb9VSNzTbGljw',
      client_secret: '081J7MOxDhtzMOxQ2LuqY9kG1FOY0Q',
      refresh_token: '411067208298-1tHvdxQJMflzOzO9eaOPvbLofRT5Wg',
      user_agent: 'MensHealthBot/1.0 by /u/holdinaces4u'
    }
    
    // Test by getting an access token
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
    console.log('Reddit token response:', tokenData)
    
    if (tokenData.error) {
      return NextResponse.json({
        success: false,
        error: `Reddit API error: ${tokenData.error}`
      })
    }
    
    if (!tokenData.access_token) {
      return NextResponse.json({
        success: false,
        error: 'Failed to get access token'
      })
    }
    
    // Test the access token by getting user info
    const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': credentials.user_agent
      }
    })
    
    if (!userResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to get user info: ${userResponse.status}`
      })
    }
    
    const userData = await userResponse.json()
    console.log('Reddit user data:', userData)
    
    return NextResponse.json({
      success: true,
      message: 'Reddit credentials are valid!',
      username: userData.name,
      karma: {
        comment: userData.comment_karma,
        link: userData.link_karma
      }
    })
    
  } catch (error: any) {
    console.error('Error testing Reddit credentials:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to test credentials'
      },
      { status: 500 }
    )
  }
}