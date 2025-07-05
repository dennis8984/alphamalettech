import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Store states temporarily (in production, use Redis or database)
const pendingStates = new Map<string, { timestamp: number; client_id: string; client_secret: string }>()

// Clean up old states periodically
setInterval(() => {
  const now = Date.now()
  for (const [state, data] of pendingStates.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      pendingStates.delete(state)
    }
  }
}, 60 * 1000) // Check every minute

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // If this is a callback from Reddit
  if (state && (code || error)) {
    const stateData = pendingStates.get(state)
    
    if (!stateData) {
      return new NextResponse(
        '<html><body><h1>Error</h1><p>Invalid or expired state. Please try again.</p><script>window.setTimeout(() => window.close(), 3000);</script></body></html>',
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
    
    pendingStates.delete(state)
    
    if (error) {
      return new NextResponse(
        `<html><body><h1>Authorization Denied</h1><p>${error}</p><script>window.setTimeout(() => window.close(), 3000);</script></body></html>`,
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
    
    try {
      // Exchange code for refresh token
      const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${stateData.client_id}:${stateData.client_secret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MensHealthBot/1.0'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code!,
          redirect_uri: 'https://www.menshb.com/api/admin/social-marketing/reddit-oauth'
        })
      })
      
      const tokenData = await tokenResponse.json()
      
      if (tokenData.error) {
        throw new Error(tokenData.error)
      }
      
      // Return success page with refresh token
      return new NextResponse(
        `<html>
          <head>
            <title>Reddit Authorization Success</title>
            <style>
              body { font-family: system-ui; padding: 40px; max-width: 600px; margin: 0 auto; }
              .success { color: #10b981; }
              .token-box { 
                background: #f3f4f6; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 20px 0;
                word-break: break-all;
                font-family: monospace;
              }
              button { 
                background: #3b82f6; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 6px; 
                cursor: pointer;
              }
              button:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <h1 class="success">✅ Authorization Successful!</h1>
            <p>Your Reddit refresh token has been generated. Copy it below:</p>
            <div class="token-box" id="token">${tokenData.refresh_token}</div>
            <button onclick="copyToken()">Copy Token</button>
            <button onclick="window.close()" style="margin-left: 10px; background: #6b7280;">Close Window</button>
            <p style="margin-top: 20px; color: #6b7280;">
              This token will not be shown again. Make sure to save it in the Reddit setup form.
            </p>
            <script>
              function copyToken() {
                const token = document.getElementById('token').innerText;
                navigator.clipboard.writeText(token).then(() => {
                  alert('Token copied to clipboard!');
                });
              }
              
              // Send token back to opener window if available
              if (window.opener) {
                window.opener.postMessage({
                  type: 'reddit-token',
                  token: '${tokenData.refresh_token}'
                }, '*');
              }
            </script>
          </body>
        </html>`,
        { 
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
      
    } catch (error: any) {
      console.error('Error exchanging code for token:', error)
      return new NextResponse(
        `<html><body><h1>Error</h1><p>Failed to get refresh token: ${error.message}</p><script>window.setTimeout(() => window.close(), 5000);</script></body></html>`,
        { 
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
  }
  
  // This shouldn't be called directly
  return NextResponse.json({ error: 'This endpoint handles Reddit OAuth callbacks' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const { client_id, client_secret } = await request.json()
    
    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      )
    }
    
    // Generate a random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex')
    
    // Store state with credentials temporarily
    pendingStates.set(state, {
      timestamp: Date.now(),
      client_id,
      client_secret
    })
    
    // Build Reddit authorization URL
    const redirectUri = 'https://www.menshb.com/api/admin/social-marketing/reddit-oauth'
    const scopes = ['identity', 'submit', 'read', 'save', 'edit', 'history']
    
    const authUrl = new URL('https://www.reddit.com/api/v1/authorize')
    authUrl.searchParams.set('client_id', client_id)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('duration', 'permanent')
    authUrl.searchParams.set('scope', scopes.join(' '))
    
    console.log('Reddit auth URL:', authUrl.toString())
    console.log('Redirect URI:', redirectUri)
    
    return NextResponse.json({ authUrl: authUrl.toString() })
    
  } catch (error: any) {
    console.error('Error initiating Reddit OAuth:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}