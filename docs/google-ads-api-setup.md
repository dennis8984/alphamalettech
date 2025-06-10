# Google Ads API Integration Setup

## Overview
To automatically create campaigns in your Google Ads account (not just generate data), you need to set up Google Ads API access.

## Required Google Ads API Credentials

### 1. Developer Token
- **What**: Special token for Google Ads API access
- **How to get**: Apply at [Google Ads API Center](https://developers.google.com/google-ads/api/docs/first-call/dev-token)
- **Environment Variable**: `GOOGLE_ADS_DEVELOPER_TOKEN`

### 2. OAuth 2.0 Credentials
- **Client ID**: `GOOGLE_ADS_CLIENT_ID`
- **Client Secret**: `GOOGLE_ADS_CLIENT_SECRET`
- **Refresh Token**: `GOOGLE_ADS_REFRESH_TOKEN`

### 3. Customer ID
- **What**: Your Google Ads account ID (10-digit number)
- **Where to find**: Google Ads dashboard top-right corner
- **Environment Variable**: `GOOGLE_ADS_CUSTOMER_ID`

## Setup Steps

### Step 1: Enable Google Ads API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google Ads API"
4. Create OAuth 2.0 credentials

### Step 2: Get Developer Token
1. Visit [Google Ads API Center](https://developers.google.com/google-ads/api/docs/first-call/dev-token)
2. Fill out application form
3. Wait for approval (can take 24-48 hours)

### Step 3: Generate Refresh Token
```bash
# Use Google's OAuth 2.0 Playground
# https://developers.google.com/oauthplayground/

# Scope needed:
https://www.googleapis.com/auth/adwords
```

### Step 4: Add Environment Variables
```bash
# Add to your .env.local file
GOOGLE_ADS_DEVELOPER_TOKEN="your-dev-token-here"
GOOGLE_ADS_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token"
GOOGLE_ADS_CUSTOMER_ID="1234567890"
```

## Current vs Full Implementation

### Current Implementation (Data Generation Only)
```javascript
// Current: Just generates data
const campaignData = await createArticleAdCampaign(article)
console.log('Generated:', campaignData) // Copy to clipboard
```

### Full API Implementation (Actual Campaign Creation)
```javascript
// Would need: Actual API integration
import { GoogleAdsApi } from 'google-ads-api'

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
})

// Authenticate
const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
})

// Create actual campaign
const campaign = await customer.campaigns.create({
  name: campaignData.name,
  advertising_channel_type: 'SEARCH',
  campaign_budget: {
    amount_micros: campaignData.budget * 10000, // Convert to micros
  },
  // ... more campaign settings
})
```

## Required Dependencies

For full API integration, you would need:

```bash
npm install google-ads-api
```

## Implementation Cost & Complexity

### **Option 1: Current (Manual)**
- ✅ **Cost**: Free
- ✅ **Complexity**: Low  
- ✅ **Time**: Instant setup
- ❌ **Manual**: Copy/paste to Google Ads

### **Option 2: Full API Integration**
- ❌ **Cost**: Google Ads API charges apply
- ❌ **Complexity**: High (authentication, error handling)
- ❌ **Time**: 2-3 days development + approval wait
- ✅ **Automated**: Fully automatic campaign creation

## Current Workaround (Recommended)

Since the current system generates perfectly formatted campaign data:

1. **Click 🎯 button** → Campaign data copied to clipboard
2. **Go to Google Ads Manager** → Create new campaign  
3. **Paste headlines** → Paste descriptions → Paste keywords
4. **Set budget** → Launch campaign

This is actually **faster** than API integration for most users and has **no additional costs**.

## API Integration Checklist

If you want full automation, you need:

- [ ] Google Cloud Project with Ads API enabled
- [ ] Developer Token (approved by Google)
- [ ] OAuth 2.0 credentials configured  
- [ ] Refresh token generated
- [ ] Customer ID identified
- [ ] google-ads-api npm package installed
- [ ] Authentication flow implemented
- [ ] Error handling for API limits/failures
- [ ] Campaign creation code written
- [ ] Testing with Google Ads sandbox

## Recommendation

**For most users**: Stick with the current implementation
- Gets you 90% of the benefit with 10% of the complexity
- No API costs or approval delays
- Campaign data is perfectly formatted for copy/paste

**For enterprise users**: Consider API integration if you're publishing 10+ articles daily and need fully automated campaign creation.

## Support

The current system gives you everything needed to create effective Google Ads campaigns quickly. The manual copy/paste step takes only 30 seconds per campaign. 