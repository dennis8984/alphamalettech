# Social Media API Setup Guide

This guide will help you obtain the necessary credentials for each social media platform.

## 📘 Facebook

### Required Credentials:
- `FACEBOOK_PAGE_ID`: Your Facebook Page ID
- `FACEBOOK_ACCESS_TOKEN`: Long-lived Page Access Token

### How to Get Them:

1. **Create a Facebook App**:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - Fill in app details

2. **Get Page ID**:
   - Go to your Facebook Page
   - Click "About"
   - Scroll to "Page ID"

3. **Get Access Token**:
   - In your Facebook App, go to "Tools" → "Graph API Explorer"
   - Select your app
   - Add permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`
   - Generate Access Token
   - Exchange for long-lived token using:
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?
   grant_type=fb_exchange_token&
   client_id={app-id}&
   client_secret={app-secret}&
   fb_exchange_token={short-lived-token}
   ```

## 🐦 Twitter/X

### Required Credentials:
- `TWITTER_API_KEY`: API Key (Consumer Key)
- `TWITTER_API_SECRET`: API Secret (Consumer Secret)
- `TWITTER_ACCESS_TOKEN`: Access Token
- `TWITTER_ACCESS_TOKEN_SECRET`: Access Token Secret

### How to Get Them:

1. **Apply for Twitter API Access**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Apply for "Elevated" access (required for v2 API)

2. **Create an App**:
   - In Developer Portal, create a new App
   - Save the API Key and API Secret

3. **Generate Access Tokens**:
   - In your app settings, go to "Keys and tokens"
   - Generate Access Token and Secret
   - Make sure app has "Read and Write" permissions

## 🤖 Reddit

### Required Credentials:
- `REDDIT_CLIENT_ID`: App Client ID
- `REDDIT_CLIENT_SECRET`: App Client Secret
- `REDDIT_REFRESH_TOKEN`: OAuth2 Refresh Token
- `REDDIT_USER_AGENT`: Your app's user agent

### How to Get Them:

1. **Create Reddit App**:
   - Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
   - Click "Create App" or "Create Another App"
   - Choose "script" type
   - Set redirect URI to `http://localhost:8080`

2. **Get Client ID and Secret**:
   - Client ID is shown under "personal use script"
   - Client Secret is shown as "secret"

3. **Get Refresh Token**:
   
   **Option 1: Web-based (Recommended)**
   - Go to the Reddit setup in the admin dashboard
   - Enter your Client ID and Client Secret
   - Click "🔐 Authorize with Reddit"
   - Approve the permissions in the popup
   - The refresh token will be automatically filled in
   
   **Option 2: Python Script**
   - Download the script from the admin dashboard
   - Or create `get_reddit_token.py` with the provided code
   - Update CLIENT_ID and CLIENT_SECRET in the script
   - Run: `pip install praw && python get_reddit_token.py`
   - Follow the browser prompts
   - Copy the refresh token from the terminal

4. **User Agent Format**:
   `AppName/Version by /u/YourUsername`
   Example: `MensHealthBot/1.0 by /u/YourRedditUsername`

## 📸 Instagram

### Required Credentials:
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`: Instagram Business Account ID
- `INSTAGRAM_ACCESS_TOKEN`: Access Token (via Facebook)

### How to Get Them:

1. **Convert to Business Account**:
   - Open Instagram app
   - Go to Settings → Account
   - Switch to Professional Account → Business

2. **Connect to Facebook Page**:
   - In Instagram Settings → Account → Linked Accounts
   - Connect to your Facebook Page

3. **Get Instagram Business Account ID**:
   - Use Facebook Graph API Explorer
   - Query: `GET /me/accounts`
   - Then: `GET /{page-id}?fields=instagram_business_account`

4. **Use Facebook Access Token**:
   - The same long-lived Facebook Page Access Token works for Instagram

## 🔧 Using the Setup Scripts

### Interactive Setup:
```bash
npx tsx scripts/setup-social-media-credentials.ts
```

### Update from Environment Variables:
```bash
# First, set your environment variables
export FACEBOOK_PAGE_ID="your-page-id"
export FACEBOOK_ACCESS_TOKEN="your-token"
# ... etc

# Then run the update script
npx tsx scripts/update-social-credentials-from-env.ts
```

## 🚦 Testing Your Setup

1. Visit: https://www.menshb.com/admin/social-marketing
2. Check the "Platform Status" section
3. Try posting a test article to each platform

## ⚠️ Important Notes

1. **Token Expiration**: 
   - Facebook/Instagram tokens expire after 60 days
   - Set up a reminder to refresh them
   - Consider implementing automatic token refresh

2. **Rate Limits**:
   - Facebook: 200 calls per hour
   - Twitter: 300 posts per 3 hours
   - Reddit: 60 requests per minute
   - Instagram: 200 calls per hour

3. **Content Policies**:
   - Each platform has different content policies
   - Avoid over-promotional content
   - Use platform-appropriate formatting

4. **Security**:
   - Never commit credentials to Git
   - Use environment variables in production
   - Rotate tokens regularly

## 🆘 Troubleshooting

### Facebook/Instagram Issues:
- Ensure your Facebook App is in "Live" mode
- Check that all required permissions are granted
- Verify Page and Instagram account are properly linked

### Twitter Issues:
- Make sure you have "Elevated" API access
- Check that your app has read and write permissions
- Verify you're using API v2 endpoints

### Reddit Issues:
- Ensure your app type is "script"
- Check that your user agent follows the required format
- Verify your account has posting permissions in target subreddits

### General Issues:
- Check Supabase logs for detailed error messages
- Verify all credentials are properly formatted (no extra spaces)
- Ensure your server can reach social media API endpoints