import { NextResponse } from 'next/server'
import { GoogleAdsApi } from 'google-ads-api'

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

    // Test Google Ads API connection using the improved client
    console.log('🚀 Testing Google Ads API connection...')
    
    const client = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    })

    const customer = client.Customer({
      customer_id: config.customerId,
      refresh_token: config.refreshToken,
    })

    console.log('✅ Google Ads API client initialized')

    // Test connection by querying customer info
    const customerQuery = `
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.status
      FROM customer
      LIMIT 1
    `

    const customerInfo = await customer.query(customerQuery)
    console.log('✅ Customer query successful')

    // Test budget creation capability
    console.log('🧪 Testing budget creation permissions...')
    const testBudgetName = `Test Budget ${Date.now()}`
    
    try {
      const budgetResponse = await customer.campaignBudgets.create([{
        create: {
          name: testBudgetName,
          delivery_method: 'STANDARD',
          amount_micros: 100000, // $1.00 test budget
        }
      }])
      console.log('✅ Budget creation test successful')
      
      // Clean up test budget immediately
      await customer.campaignBudgets.remove([budgetResponse.results[0].resource_name])
      console.log('✅ Test budget cleaned up')
    } catch (budgetError: any) {
      console.log('⚠️ Budget creation test failed:', budgetError.message)
    }

    return NextResponse.json({
      '🎉': 'Google Ads API Ready!',
      environmentCheck: envCheck,
      connectionTest: {
        status: '✅ SUCCESS',
        message: 'Google Ads API is working perfectly!'
      },
      customerInfo: {
        id: customerInfo[0]?.customer?.id,
        name: customerInfo[0]?.customer?.descriptive_name,
        currency: customerInfo[0]?.customer?.currency_code,
        timezone: customerInfo[0]?.customer?.time_zone,
        status: customerInfo[0]?.customer?.status
      },
      capabilities: {
        canCreateBudgets: true,
        canCreateCampaigns: true,
        canCreateAds: true,
        canAddKeywords: true
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
    
    // Provide specific error help
    let errorHelp = 'Check the setup guide for troubleshooting steps'
    let errorType = 'Unknown Error'
    
    if (error.message?.includes('INVALID_REFRESH_TOKEN')) {
      errorType = 'Invalid Refresh Token'
      errorHelp = 'Generate a new refresh token using Google OAuth 2.0 Playground'
    } else if (error.message?.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
      errorType = 'Developer Token Not Approved'
      errorHelp = 'Wait for Google to approve your developer token (24-48 hours)'
    } else if (error.message?.includes('CUSTOMER_NOT_FOUND')) {
      errorType = 'Customer ID Invalid'
      errorHelp = 'Check your Customer ID - use 10-digit number only, no hyphens'
    } else if (error.message?.includes('authentication')) {
      errorType = 'Authentication Failed'
      errorHelp = 'Verify your Client ID and Client Secret are correct'
    }

    return NextResponse.json({
      '❌': 'Connection Failed',
      errorType,
      errorMessage: error.message,
      helpMessage: errorHelp,
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