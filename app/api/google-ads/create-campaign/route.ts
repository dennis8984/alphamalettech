import { NextRequest, NextResponse } from 'next/server'

interface CampaignData {
  name: string
  targetUrl: string
  headlines: string[]
  descriptions: string[]
  keywords: string[]
  budget: number
}

export async function POST(request: NextRequest) {
  try {
    const campaignData: CampaignData = await request.json()
    
    console.log('🚀 Creating Google Ads campaign via API...')
    console.log('📊 Campaign Data:', { 
      name: campaignData.name,
      budget: campaignData.budget,
      headlinesCount: campaignData.headlines?.length || 0,
      descriptionsCount: campaignData.descriptions?.length || 0,
      keywordsCount: campaignData.keywords?.length || 0
    })
    
    // Get environment variables server-side
    const config = {
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/[-\s]/g, '')
    }

    console.log('🔍 Google Ads API Config:', {
      hasDevToken: !!config.developerToken,
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      hasRefreshToken: !!config.refreshToken,
      customerId: config.customerId,
      customerIdLength: config.customerId?.length,
      developerTokenLength: config.developerToken?.length
    })

    // Validate required credentials with detailed feedback
    const missingVars: string[] = []
    if (!config.developerToken) missingVars.push('GOOGLE_ADS_DEVELOPER_TOKEN')
    if (!config.clientId) missingVars.push('GOOGLE_ADS_CLIENT_ID') 
    if (!config.clientSecret) missingVars.push('GOOGLE_ADS_CLIENT_SECRET')
    if (!config.refreshToken) missingVars.push('GOOGLE_ADS_REFRESH_TOKEN')
    if (!config.customerId) missingVars.push('GOOGLE_ADS_CUSTOMER_ID')

    if (missingVars.length > 0) {
      console.error('❌ Missing Google Ads API credentials:', missingVars)
      return NextResponse.json({
        success: false,
        error: `Missing Google Ads API credentials: ${missingVars.join(', ')}`,
        helpMessage: 'Add these environment variables to your Vercel project settings.',
        missingVars,
        setupGuide: 'https://developers.google.com/google-ads/api/docs/first-call/oauth'
      })
    }

    // Get access token using validated credentials
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId as string,
        client_secret: config.clientSecret as string,
        refresh_token: config.refreshToken as string,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('❌ Failed to get access token:', tokenError)
      
      if (tokenError.includes('invalid_grant')) {
        return NextResponse.json({
          success: false,
          error: 'Refresh token expired or invalid',
          helpMessage: 'Generate a new refresh token using Google OAuth 2.0 Playground: https://developers.google.com/oauthplayground/',
          details: tokenError
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        helpMessage: 'Check your Google OAuth credentials',
        details: tokenError
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Create campaign budget
    console.log('💰 Creating campaign budget...')
    console.log('📊 Budget details:', {
      dailyBudgetDollars: campaignData.budget / 100,
      dailyBudgetCents: campaignData.budget,
      dailyBudgetMicros: campaignData.budget * 10000
    })
    
    const budgetPayload = {
      operations: [{
        create: {
          name: `MensHub Budget ${Date.now()}`,
          deliveryMethod: 'STANDARD',
          amountMicros: (campaignData.budget * 10000).toString(), // Convert cents to micros (100 cents * 10000 = 1,000,000 micros)
        }
      }]
    }
    
    console.log('📤 Budget request payload:', JSON.stringify(budgetPayload, null, 2))
    
    const budgetResponse = await fetch(
      `https://googleads.googleapis.com/v14/customers/${config.customerId}/campaignBudgets:mutate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': config.developerToken as string,
          'Content-Type': 'application/json',
          'login-customer-id': config.customerId || '' // Add login-customer-id header (ensure it's a string)
        },
        body: JSON.stringify(budgetPayload),
      }
    )

    console.log('📡 Budget API Response Status:', budgetResponse.status, budgetResponse.statusText)
    
    if (!budgetResponse.ok) {
      const budgetError = await budgetResponse.text()
      console.error('❌ Budget creation failed:', budgetError)
      console.error('📊 Response headers:', Object.fromEntries(budgetResponse.headers.entries()))
      
      // Parse error for more details
      let errorDetails = budgetError
      let errorCode = ''
      try {
        const errorJson = JSON.parse(budgetError)
        errorDetails = errorJson.error?.message || errorJson.error?.details?.[0]?.errors?.[0]?.message || budgetError
        errorCode = errorJson.error?.code || errorJson.error?.status || ''
      } catch (e) {
        // Keep original error text if not JSON
      }
      
      // Common error explanations
      let helpMessage = 'Check your Google Ads API permissions and developer token status'
      if (errorDetails.includes('PERMISSION_DENIED')) {
        helpMessage = 'Your developer token may not have access to this account. Ensure token is approved.'
      } else if (errorDetails.includes('INVALID_ARGUMENT')) {
        helpMessage = 'Invalid request format. Check customer ID and budget parameters.'
      } else if (errorDetails.includes('UNAUTHENTICATED')) {
        helpMessage = 'Authentication failed. Check your refresh token and OAuth credentials.'
      } else if (errorDetails.includes('DEVELOPER_TOKEN')) {
        helpMessage = 'Developer token issue. Ensure it\'s approved for production use.'
      }
      
      return NextResponse.json({
        success: false,
        error: 'Budget creation failed',
        details: errorDetails,
        errorCode,
        helpMessage,
        debugInfo: {
          customerId: config.customerId,
          hasAccessToken: !!accessToken,
          budgetAmountMicros: (campaignData.budget * 10000).toString(),
          responseStatus: budgetResponse.status,
          apiUrl: `https://googleads.googleapis.com/v14/customers/${config.customerId}/campaignBudgets:mutate`
        }
      })
    }

    const budgetResult = await budgetResponse.json()
    const budgetResourceName = budgetResult.results?.[0]?.resourceName

    // Create campaign
    console.log('🎯 Creating search campaign...')
    const campaignResponse = await fetch(
      `https://googleads.googleapis.com/v14/customers/${config.customerId}/campaigns:mutate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': config.developerToken as string,
          'Content-Type': 'application/json',
          'login-customer-id': config.customerId || '' // Add login-customer-id header (ensure it's a string)
        },
        body: JSON.stringify({
          operations: [{
            create: {
              name: campaignData.name,
              advertisingChannelType: 'SEARCH',
              status: 'PAUSED',
              campaignBudget: budgetResourceName,
              networkSettings: {
                targetGoogleSearch: true,
                targetSearchNetwork: true,
                targetContentNetwork: false,
                targetPartnerSearchNetwork: false
              },
              biddingStrategyType: 'MANUAL_CPC',
              manualCpc: {
                enhancedCpcEnabled: true
              }
            }
          }]
        }),
      }
    )

    if (!campaignResponse.ok) {
      const campaignError = await campaignResponse.text()
      console.error('❌ Campaign creation failed:', campaignError)
      return NextResponse.json({
        success: false,
        error: 'Campaign creation failed',
        details: campaignError,
        helpMessage: 'Check your Google Ads account permissions'
      })
    }

    const campaignResult = await campaignResponse.json()
    const campaignResourceName = campaignResult.results?.[0]?.resourceName
    const campaignId = campaignResourceName?.split('/').pop()

    console.log('✅ Campaign created successfully:', campaignResourceName)

    return NextResponse.json({
      success: true,
      data: {
        message: '✅ Google Ads campaign created successfully! Campaign is PAUSED for your review.',
        campaignId,
        campaignName: campaignData.name,
        budget: `$${(campaignData.budget / 100).toFixed(2)}/day`,
        status: 'PAUSED',
        campaignResourceName,
        nextSteps: [
          'Go to your Google Ads account at https://ads.google.com',
          'Find your new campaign: ' + campaignData.name,
          'Review the campaign settings and targeting',
          'Add ad groups, ads, and keywords manually or enable the campaign',
          'Monitor performance and optimize as needed'
        ],
        note: 'Basic campaign structure created. Add ad groups, ads, and keywords through Google Ads interface.'
      }
    })

  } catch (error: any) {
    console.error('❌ Google Ads API Error:', error)
    
    // Handle specific errors
    if (error.message?.includes('INVALID_REFRESH_TOKEN')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid refresh token',
        helpMessage: 'Generate a new refresh token using Google OAuth 2.0 Playground: https://developers.google.com/oauthplayground/'
      })
    }

    if (error.message?.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
      return NextResponse.json({
        success: false,
        error: 'Developer token not approved',
        helpMessage: 'Apply for Google Ads API access and wait for approval (24-48 hours)'
      })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
      helpMessage: 'Check the setup guide and ensure all credentials are correct'
    })
  }
} 