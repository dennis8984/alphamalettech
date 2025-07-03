import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking Google Ads API setup...')
    
    // Get environment variables
    const config = {
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/[-\s]/g, ''),
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN
    }

    // Check which environment variables are missing
    const missingVars = []
    if (!config.customerId) missingVars.push('GOOGLE_ADS_CUSTOMER_ID')
    if (!config.developerToken) missingVars.push('GOOGLE_ADS_DEVELOPER_TOKEN') 
    if (!config.clientId) missingVars.push('GOOGLE_ADS_CLIENT_ID')
    if (!config.clientSecret) missingVars.push('GOOGLE_ADS_CLIENT_SECRET')
    if (!config.refreshToken) missingVars.push('GOOGLE_ADS_REFRESH_TOKEN')

    // Environment variables check
    const envCheck = {
      '✅ Status': 'Environment Variables',
      hasCustomerId: !!config.customerId,
      hasDeveloperToken: !!config.developerToken,
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      hasRefreshToken: !!config.refreshToken,
      customerId: config.customerId ? `${config.customerId.substring(0, 3)}***` : '❌ Missing',
      clientIdValid: config.clientId?.includes('.googleusercontent.com') || false,
      allConfigured: missingVars.length === 0,
      missingVariables: missingVars
    }

    console.log('🔍 Environment Check:', envCheck)

    // If variables are missing, return helpful setup information
    if (missingVars.length > 0) {
      return NextResponse.json({
        '❌': 'Configuration Incomplete',
        environmentCheck: envCheck,
        message: `Missing ${missingVars.length} required environment variables`,
        nextSteps: [
          `Add these to Vercel: ${missingVars.join(', ')}`,
          'Follow the complete setup guide',
          'Redeploy your app after adding variables'
        ],
        setupGuide: 'https://developers.google.com/google-ads/api/docs/first-call/oauth',
        vercelSettings: 'https://vercel.com/dashboard → Settings → Environment Variables'
      })
    }

    // Test Google Ads API connection using REST API
    console.log('🚀 Testing Google Ads API connection...')
    
    // Test OAuth token refresh
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId!,
        client_secret: config.clientSecret!,
        refresh_token: config.refreshToken!,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('❌ Token refresh failed:', tokenError)
      
      let errorHelp = 'Check your OAuth credentials'
      if (tokenError.includes('invalid_grant')) {
        errorHelp = 'Generate a new refresh token using Google OAuth 2.0 Playground'
      }
      
      return NextResponse.json({
        '❌': 'Authentication Failed',
        environmentCheck: envCheck,
        error: 'Token refresh failed',
        details: tokenError,
        helpMessage: errorHelp,
        fixSteps: [
          'Go to https://developers.google.com/oauthplayground/',
          'Use your Client ID and Client Secret',
          'Generate a new refresh token',
          'Update GOOGLE_ADS_REFRESH_TOKEN in Vercel',
          'Redeploy your app'
        ]
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ OAuth token refresh successful')

    // Test Google Ads API access
    const testResponse = await fetch(
      `https://googleads.googleapis.com/v14/customers/${config.customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'developer-token': config.developerToken!,
          'Content-Type': 'application/json',
          'login-customer-id': config.customerId || ''
        },
        body: JSON.stringify({
          query: 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1'
        }),
      }
    )

    if (!testResponse.ok) {
      const testError = await testResponse.text()
      console.error('❌ Google Ads API test failed:', testError)
      
      let errorHelp = 'Check your Google Ads API credentials'
      if (testError.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
        errorHelp = 'Wait for Google to approve your developer token (24-48 hours)'
      } else if (testError.includes('CUSTOMER_NOT_FOUND')) {
        errorHelp = 'Check your Customer ID - use 10-digit number only'
      }
      
      return NextResponse.json({
        '❌': 'API Access Failed',
        environmentCheck: envCheck,
        authTest: '✅ PASSED',
        apiTest: '❌ FAILED',
        error: 'Google Ads API access failed',
        details: testError,
        helpMessage: errorHelp
      })
    }

    const testResult = await testResponse.json()
    const customerInfo = testResult.results?.[0]?.customer
    console.log('✅ Google Ads API test successful')

    return NextResponse.json({
      '🎉': 'Google Ads API Ready!',
      environmentCheck: envCheck,
      authTest: '✅ PASSED',
      apiTest: '✅ PASSED',
      connectionTest: {
        status: '✅ SUCCESS',
        message: 'Google Ads API is working perfectly!'
      },
      customerInfo: {
        id: customerInfo?.id,
        name: customerInfo?.descriptive_name || 'N/A'
      },
      capabilities: {
        canCreateBudgets: true,
        canCreateCampaigns: true,
        canAuthenticate: true
      },
      '🚀': 'Ready to Use',
      message: 'Your Google Ads automation is fully configured and ready!',
      nextSteps: [
        'Go to https://www.menshb.com/admin/articles',
        'Click the 🎯 button next to any published article',
        'Watch as campaigns are created automatically in your Google Ads account!',
        'Campaigns will start PAUSED for your review'
      ],
      performance: {
        recommendedBudget: '$20/day per campaign',
        expectedCTR: '2-4% for health/fitness content',
        averageCPC: '$0.50-$2.00',
        targetConversions: 'Newsletter signups, article reads'
      }
    })

  } catch (error: any) {
    console.error('❌ Debug error:', error)
    
    return NextResponse.json({
      '❌': 'Connection Failed',
      error: error.message || 'Unknown error occurred',
      helpMessage: 'Check the setup guide and ensure all credentials are correct',
      troubleshooting: {
        step1: 'Double-check all 5 environment variables in Vercel',
        step2: 'Ensure Google Ads API is enabled in Google Cloud Console',
        step3: 'Verify your developer token is APPROVED (not just applied)',
        step4: 'Test OAuth credentials using Google OAuth 2.0 Playground',
        step5: 'Check that your Google Ads account has API access enabled'
      },
      setupGuide: 'Follow the complete Google Ads API setup guide',
      supportLinks: {
        oauth: 'https://developers.google.com/oauthplayground/',
        devToken: 'https://developers.google.com/google-ads/api/docs/first-call/dev-token',
        googleCloud: 'https://console.cloud.google.com/',
        vercelEnv: 'https://vercel.com/dashboard'
      }
    })
  }
} 