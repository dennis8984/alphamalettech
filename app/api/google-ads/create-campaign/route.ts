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
    const campaignData = await request.json()
    
    console.log('🚀 Creating Google Ads campaign via API...')
    
    // Get environment variables server-side
    const config = {
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      clientId: process.env.GOOGLE_ADS_CLIENT_ID,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID
    }

    // Validate required credentials
    if (!config.developerToken || !config.customerId || !config.clientId || !config.clientSecret || !config.refreshToken) {
      console.error('❌ Missing Google Ads API credentials')
      return NextResponse.json({
        success: false,
        error: 'Missing Google Ads API credentials. Check Vercel environment variables.'
      })
    }

    // Get access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('❌ Failed to get access token:', tokenError)
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${tokenError}`
      })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Create campaign budget
    const budgetResponse = await fetch(
      `https://googleads.googleapis.com/v14/customers/${config.customerId}/campaignBudgets:mutate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': config.developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations: [{
            create: {
              name: `Budget-${Date.now()}`,
              amountMicros: (campaignData.budget * 10000).toString(),
              deliveryMethod: 'STANDARD'
            }
          }]
        }),
      }
    )

    if (!budgetResponse.ok) {
      const budgetError = await budgetResponse.text()
      console.error('❌ Budget creation failed:', budgetError)
      return NextResponse.json({
        success: false,
        error: `Budget creation failed: ${budgetError}`
      })
    }

    const budgetResult = await budgetResponse.json()
    const budgetResourceName = budgetResult.results?.[0]?.resourceName

    // Create campaign
    const campaignResponse = await fetch(
      `https://googleads.googleapis.com/v14/customers/${config.customerId}/campaigns:mutate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': config.developerToken,
          'Content-Type': 'application/json',
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
                targetContentNetwork: false
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
        error: `Campaign creation failed: ${campaignError}`
      })
    }

    const campaignResult = await campaignResponse.json()
    console.log('✅ Campaign created successfully')

    return NextResponse.json({
      success: true,
      data: {
        message: 'Google Ads campaign created successfully',
        campaignId: campaignResult.results?.[0]?.resourceName
      }
    })

  } catch (error) {
    console.error('❌ Google Ads API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 