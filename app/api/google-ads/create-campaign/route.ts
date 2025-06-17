import { NextRequest, NextResponse } from 'next/server'
import { GoogleAdsApi, enums } from 'google-ads-api'

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
      customerId: process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/[-\s]/g, '') // Remove hyphens and spaces
    }

    console.log('🔍 Google Ads API Config:', {
      hasDevToken: !!config.developerToken,
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret,
      hasRefreshToken: !!config.refreshToken,
      customerId: config.customerId
    })

    // Validate required credentials with detailed feedback
    const missingVars: Record<string, boolean> = {
      GOOGLE_ADS_DEVELOPER_TOKEN: !config.developerToken,
      GOOGLE_ADS_CLIENT_ID: !config.clientId,
      GOOGLE_ADS_CLIENT_SECRET: !config.clientSecret,
      GOOGLE_ADS_REFRESH_TOKEN: !config.refreshToken,
      GOOGLE_ADS_CUSTOMER_ID: !config.customerId
    }

    const missingVarNames = Object.entries(missingVars)
      .filter(([_, missing]) => missing)
      .map(([name, _]) => name)

    if (missingVarNames.length > 0) {
      console.error('❌ Missing Google Ads API credentials:', missingVarNames)
      return NextResponse.json({
        success: false,
        error: `Missing Google Ads API credentials: ${missingVarNames.join(', ')}`,
        helpMessage: 'Add these environment variables to your Vercel project settings.',
        missingVars,
        setupGuide: 'https://developers.google.com/google-ads/api/docs/first-call/oauth'
      })
    }

    // Initialize Google Ads API client
    const client = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    })

    console.log('✅ Google Ads API client initialized')

    // Get customer instance
    const customer = client.Customer({
      customer_id: config.customerId,
      refresh_token: config.refreshToken,
    })

    console.log('✅ Customer instance created for ID:', config.customerId)

    // Create campaign budget first
    console.log('💰 Creating campaign budget...')
    const budgetOperation = {
      create: {
        name: `MensHub Budget ${Date.now()}`,
        delivery_method: enums.BudgetDeliveryMethod.STANDARD,
        amount_micros: campaignData.budget * 10000, // Convert cents to micros
      }
    }

    const budgetResponse = await customer.campaignBudgets.create([budgetOperation])
    const budgetResourceName = budgetResponse.results[0].resource_name
    console.log('✅ Budget created:', budgetResourceName)

    // Create the campaign
    console.log('🎯 Creating search campaign...')
    const campaignOperation = {
      create: {
        name: campaignData.name,
        advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
        status: enums.CampaignStatus.PAUSED, // Start paused for review
        campaign_budget: budgetResourceName,
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: false,
          target_partner_search_network: false,
        },
        bidding_strategy_type: enums.BiddingStrategyType.MANUAL_CPC,
        manual_cpc: {
          enhanced_cpc_enabled: true,
        },
      }
    }

    const campaignResponse = await customer.campaigns.create([campaignOperation])
    const campaignResourceName = campaignResponse.results[0].resource_name
    console.log('✅ Campaign created:', campaignResourceName)

    // Create ad group
    console.log('📁 Creating ad group...')
    const adGroupOperation = {
      create: {
        name: `${campaignData.name} - Ad Group`,
        campaign: campaignResourceName,
        status: enums.AdGroupStatus.ENABLED,
        type: enums.AdGroupType.SEARCH_STANDARD,
        cpc_bid_micros: 1000000, // $1.00 in micros
      }
    }

    const adGroupResponse = await customer.adGroups.create([adGroupOperation])
    const adGroupResourceName = adGroupResponse.results[0].resource_name
    console.log('✅ Ad group created:', adGroupResourceName)

    // Create responsive search ad
    console.log('📝 Creating responsive search ad...')
    const headlines = campaignData.headlines.slice(0, 15).map(headline => ({
      text: headline.substring(0, 30), // Max 30 chars
    }))

    const descriptions = campaignData.descriptions.slice(0, 4).map(description => ({
      text: description.substring(0, 90), // Max 90 chars
    }))

    const adOperation = {
      create: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupAdStatus.ENABLED,
        ad: {
          responsive_search_ad: {
            headlines,
            descriptions,
            final_urls: [campaignData.targetUrl],
          },
        },
      }
    }

    const adResponse = await customer.adGroupAds.create([adOperation])
    console.log('✅ Responsive search ad created')

    // Add keywords
    console.log('🔑 Adding keywords...')
    const keywordOperations = campaignData.keywords.slice(0, 20).map(keyword => ({
      create: {
        ad_group: adGroupResourceName,
        status: enums.AdGroupCriterionStatus.ENABLED,
        keyword: {
          text: keyword,
          match_type: enums.KeywordMatchType.PHRASE,
        },
        cpc_bid_micros: 500000, // $0.50 in micros
      }
    }))

    const keywordsResponse = await customer.adGroupCriteria.create(keywordOperations)
    console.log(`✅ ${keywordsResponse.results.length} keywords added`)

    // Return success response
    const campaignId = campaignResourceName.split('/').pop()
    console.log('🎉 Campaign creation completed successfully!')

    return NextResponse.json({
      success: true,
      data: {
        message: '✅ Google Ads campaign created successfully! Campaign is PAUSED for your review.',
        campaignId,
        campaignName: campaignData.name,
        budget: `$${(campaignData.budget / 100).toFixed(2)}/day`,
        status: 'PAUSED',
        adGroupId: adGroupResourceName.split('/').pop(),
        totalKeywords: keywordsResponse.results.length,
        totalHeadlines: headlines.length,
        totalDescriptions: descriptions.length,
        nextSteps: [
          'Go to your Google Ads account',
          'Review the campaign settings',
          'Enable the campaign when ready',
          'Monitor performance and optimize'
        ]
      }
    })

  } catch (error: any) {
    console.error('❌ Google Ads API Error:', error)
    
    // Handle specific Google Ads API errors
    if (error.errors) {
      const apiErrors = error.errors.map((e: any) => ({
        error_code: e.error_code,
        message: e.message,
        location: e.location
      }))
      
      return NextResponse.json({
        success: false,
        error: 'Google Ads API Error',
        details: apiErrors,
        helpMessage: 'Check your Google Ads API credentials and account permissions.'
      })
    }

    // Handle authentication errors
    if (error.message?.includes('INVALID_REFRESH_TOKEN')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid refresh token',
        helpMessage: 'Please generate a new refresh token using Google OAuth 2.0 Playground.'
      })
    }

    if (error.message?.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
      return NextResponse.json({
        success: false,
        error: 'Developer token not approved',
        helpMessage: 'Apply for Google Ads API access and wait for approval.'
      })
    }

    // Generic error handling
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error occurred',
      helpMessage: 'Check the server logs for more details.'
    })
  }
} 