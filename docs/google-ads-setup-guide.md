# 🚀 Complete Google Ads API Setup Guide

Your Google Ads automation is now **vastly improved** and ready to work! Follow this guide to get automatic campaign creation working.

## 🎯 **What You'll Get After Setup**

✅ **Fully Automated Campaign Creation** - Click 🎯 button → Campaign appears in Google Ads  
✅ **Complete Campaign Structure** - Budget, Campaign, Ad Groups, Ads, Keywords  
✅ **Smart Defaults** - $20/day budget, Manual CPC, Enhanced CPC enabled  
✅ **Safety First** - Campaigns start PAUSED for your review  
✅ **Detailed Feedback** - Know exactly what was created  

---

## 📋 **Required Google Ads API Credentials**

You need these 5 environment variables in your **Vercel project**:

```bash
GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
GOOGLE_ADS_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token"
GOOGLE_ADS_CUSTOMER_ID="1234567890"
```

---

## 🛠️ **Step-by-Step Setup Process**

### **Step 1: Install New Dependencies**

Run this in your project directory:

```bash
cd alphamalettech
npm install google-ads-api@^16.0.0
```

### **Step 2: Get Your Customer ID** ⚡ **(Easiest)**

1. Go to [Google Ads](https://ads.google.com)
2. Look at top-right corner for your 10-digit account ID
3. Copy the number (e.g., `1234567890`)

### **Step 3: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **"Google Ads API"**
4. Go to **APIs & Services → Credentials**

### **Step 4: Create OAuth 2.0 Credentials**

1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. Add redirect URI: `https://developers.google.com/oauthplayground`
5. **Copy the Client ID and Client Secret**

### **Step 5: Generate Refresh Token**

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click **Settings ⚙️** (top right)
3. Check **"Use your own OAuth credentials"**
4. Enter your **Client ID** and **Client Secret**
5. In **Step 1**: Enter scope: `https://www.googleapis.com/auth/adwords`
6. Click **"Authorize APIs"**
7. Sign in with your Google Ads account
8. In **Step 2**: Click **"Exchange authorization code for tokens"**
9. **Copy the Refresh Token**

### **Step 6: Apply for Developer Token** ⏰ **(Takes 1-2 days)**

1. Go to [Google Ads API Center](https://developers.google.com/google-ads/api/docs/first-call/dev-token)
2. Fill out the application form:
   - **Purpose**: "Article marketing automation for men's health website"
   - **Website**: `https://www.menshb.com`
   - **Expected usage**: "Create search campaigns for published articles"
3. Submit and **wait for approval** (24-48 hours)

### **Step 7: Add Environment Variables to Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add these 5 variables:

```bash
GOOGLE_ADS_DEVELOPER_TOKEN = "your-approved-token-from-step-6"
GOOGLE_ADS_CLIENT_ID = "your-client-id.apps.googleusercontent.com"
GOOGLE_ADS_CLIENT_SECRET = "your-client-secret-from-step-4"
GOOGLE_ADS_REFRESH_TOKEN = "your-refresh-token-from-step-5"
GOOGLE_ADS_CUSTOMER_ID = "1234567890"
```

### **Step 8: Deploy and Test**

1. **Redeploy your Vercel app** (environment variables need deployment)
2. Go to `https://www.menshb.com/admin/articles`
3. Click **🎯 button** next to any published article
4. Should see **"✅ Campaign created successfully!"** instead of clipboard copy

---

## 🔍 **Troubleshooting Common Issues**

### **❌ "Missing Google Ads API credentials"**
**Solution**: Check all 5 environment variables are added to Vercel and redeployed.

### **❌ "Developer token not approved"**
**Solution**: Wait for Google's approval or use test account with basic access token.

### **❌ "Invalid refresh token"**
**Solution**: Regenerate refresh token using OAuth playground.

### **❌ "Customer ID not found"**
**Solution**: Use 10-digit number only, no hyphens (e.g., `1234567890` not `123-456-7890`).

### **❌ "Authentication failed"**
**Solution**: Verify Client ID and Secret match your OAuth credentials.

---

## 🚀 **What Happens When It Works**

When you click the **🎯 button**:

1. **Budget Created**: `$20/day` (you can change this)
2. **Campaign Created**: Named after your article
3. **Ad Group Created**: Contains all ads and keywords
4. **Responsive Search Ad**: Multiple headlines/descriptions
5. **Keywords Added**: From article tags + category terms
6. **Status**: `PAUSED` for your review

**Campaign appears in your Google Ads account immediately!**

---

## ⚡ **Quick Test Without Full Setup**

If you want to test before getting developer token approval:

1. Set up everything except the developer token
2. Use a **test developer token** from Google Ads API documentation
3. Your campaigns will be created in **sandbox mode**
4. Switch to production token when approved

---

## 💡 **Pro Tips**

- **Start Small**: Test with 1-2 articles first
- **Review Campaigns**: Always check before enabling
- **Monitor Spend**: Set account-level budget limits
- **Optimize**: Pause low-performing keywords after 1 week
- **Scale Up**: Once working, batch-create campaigns for all articles

---

## 📞 **Need Help?**

If you get stuck on any step:

1. **Check Vercel Logs**: See detailed error messages
2. **Test API**: Use `/api/google-ads/debug` endpoint
3. **Verify Credentials**: Double-check all 5 environment variables
4. **Google Support**: Contact Google Ads API support for developer token issues

---

## 🎉 **Success Indicators**

✅ **Environment variables added to Vercel**  
✅ **App redeployed after adding variables**  
✅ **Developer token approved by Google**  
✅ **🎯 button shows success message**  
✅ **Campaign appears in Google Ads account**  

**Your automation will be 100% working!** 🚀

---

*This improved system creates complete, professional Google Ads campaigns automatically. Much better than the old clipboard method!* 