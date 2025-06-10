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

    // Check environment variables
    const envCheck = {
      hasCustomerId: !!config.customerId,
      customerIdLength: config.customerId?.length || 0,
      customerIdValue: config.customerId,
      hasDeveloperToken: !!config.developerToken,
      developerTokenLength: config.developerToken?.length || 0,
      developerTokenPrefix: config.developerToken?.substring(0, 10) + '...',
      hasClientId: !!config.clientId,
      clientIdDomain: config.clientId?.includes('.googleusercontent.com'),
      hasClientSecret: !!config.clientSecret,
      hasRefreshToken: !!config.refreshToken,
      refreshTokenLength: config.refreshToken?.length || 0
    }

    console.log('🔍 Environment Check:', envCheck)

    // Test OAuth token with proper scope
    console.log('🔑 Testing OAuth with Google Ads scope...')
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
      return NextResponse.json({
        success: false,
        step: 'oauth_token',
        error: 'OAuth token refresh failed',
        details: tokenError,
        envCheck
      })
    }

    const tokenData = await tokenResponse.json()
    
    // Check token response for scope
    const tokenInfo = {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope
    }

    console.log('🔍 Token Info:', tokenInfo)

    // Test if Google Ads API is accessible at all
    console.log('🔍 Testing Google Ads API base URL...')
    const baseApiTest = await fetch('https://googleads.googleapis.com/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': config.developerToken!,
      },
    })

    const baseApiResult = await baseApiTest.text()
    console.log('📊 Base API Test Status:', baseApiTest.status)
    console.log('📊 Base API Response:', baseApiResult)

    // Try a different approach - test with search endpoint
    console.log('🔍 Testing Google Ads Search API...')
    const searchUrl = `https://googleads.googleapis.com/v14/customers/${config.customerId}/googleAds:search`
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': config.developerToken!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'SELECT customer.id FROM customer LIMIT 1'
      }),
    })

    const searchResult = await searchResponse.text()
    console.log('📊 Search API Status:', searchResponse.status)
    console.log('📊 Search API Response:', searchResult)

    return NextResponse.json({
      success: baseApiTest.ok || searchResponse.ok,
      environmentCheck: envCheck,
      tokenInfo,
      tests: {
        baseApi: {
          status: baseApiTest.status,
          success: baseApiTest.ok,
          response: baseApiResult
        },
        searchApi: {
          status: searchResponse.status,
          success: searchResponse.ok,
          response: searchResult
        }
      },
      recommendations: [
        'Check if your Google Ads Developer Token is APPROVED (not just applied for)',
        'Verify Google Ads API is enabled in your Google Cloud Console',
        'Ensure OAuth was done with correct scope: https://www.googleapis.com/auth/adwords',
        'Check if your Google Ads account has API access enabled'
      ]
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 