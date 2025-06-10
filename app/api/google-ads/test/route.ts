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

    // Test simple Google Ads API call - get customer info
    const customerUrl = `https://googleads.googleapis.com/v14/customers/${customerId}`
    console.log('🔍 Testing customer API:', customerUrl)

    const customerResponse = await fetch(customerUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
    })

    const customerResult = await customerResponse.text()
    console.log('📊 Customer API Response Status:', customerResponse.status)
    console.log('📊 Customer API Response:', customerResult)

    if (customerResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Google Ads API authentication successful',
        customerId: customerId,
        customerData: JSON.parse(customerResult)
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Google Ads API call failed',
        status: customerResponse.status,
        details: customerResult,
        customerId: customerId
      })
    }

  } catch (error) {
    console.error('❌ Google Ads API test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
} 