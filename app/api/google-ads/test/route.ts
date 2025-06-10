import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🧪 Testing Google Ads API authentication...')
    
    // Get environment variables
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/[-\s]/g, '')
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN

    console.log('🔍 Environment Variables Check:', {
      hasCustomerId: !!customerId,
      customerIdValue: customerId,
      hasDeveloperToken: !!developerToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRefreshToken: !!refreshToken
    })

    if (!customerId || !developerToken || !clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing required Google Ads API environment variables',
        config: {
          hasCustomerId: !!customerId,
          hasDeveloperToken: !!developerToken,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          hasRefreshToken: !!refreshToken
        }
      })
    }

    // Test OAuth token
    console.log('🔑 Testing OAuth token refresh...')
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('❌ Token refresh failed:', tokenError)
      return NextResponse.json({
        success: false,
        error: 'OAuth token refresh failed',
        details: tokenError
      })
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ OAuth token refreshed successfully')

    // Test multiple Google Ads API endpoints
    const testEndpoints = [
      {
        name: 'Customer Info v14',
        url: `https://googleads.googleapis.com/v14/customers/${customerId}`,
        method: 'GET'
      },
      {
        name: 'Customer Info v13',
        url: `https://googleads.googleapis.com/v13/customers/${customerId}`,
        method: 'GET'
      },
      {
        name: 'List Accessible Customers',
        url: 'https://googleads.googleapis.com/v14/customers:listAccessibleCustomers',
        method: 'GET'
      }
    ]

    const results = []

    for (const endpoint of testEndpoints) {
      console.log(`🔍 Testing ${endpoint.name}:`, endpoint.url)
      
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'developer-token': developerToken,
            'Content-Type': 'application/json',
          },
        })

        const result = await response.text()
        console.log(`📊 ${endpoint.name} Status:`, response.status)
        console.log(`📊 ${endpoint.name} Response:`, result)

        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          success: response.ok,
          response: result
        })
      } catch (error) {
        console.error(`❌ ${endpoint.name} Error:`, error)
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Check if any endpoint was successful
    const hasSuccess = results.some(r => r.success)
    
    return NextResponse.json({
      success: hasSuccess,
      message: hasSuccess ? 'Google Ads API authentication successful' : 'Google Ads API authentication failed',
      customerId: customerId,
      tokenRefreshSuccess: true,
      testResults: results
    })

  } catch (error) {
    console.error('❌ Google Ads API test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 