# Social Media Marketing Automation

This document describes the automated social media marketing system for Men's Hub.

## Overview

The social media marketing system automatically detects new published articles and distributes them across Facebook, Reddit, Twitter/X, and Instagram with platform-optimized content and full analytics tracking.

## Features

### 🤖 Automated Detection & Posting
- Real-time detection of newly published articles
- Platform-specific content formatting
- Smart scheduling based on optimal engagement times
- Automatic retry with exponential backoff for failed posts

### 📊 Analytics & Tracking
- Custom shortened URLs with click tracking
- Engagement metrics (likes, shares, comments)
- Platform performance comparison
- A/B testing capabilities

### 🎯 Smart Content Distribution
- Category-based routing rules
- Keyword-based targeting
- Minimum engagement thresholds
- Platform-specific optimizations

### 📱 Platform Support
- **Facebook**: Posts with images, longer descriptions, hashtags
- **Twitter/X**: Character-optimized posts with trending hashtags
- **Reddit**: Subreddit targeting with natural titles
- **Instagram**: Image-required posts with extensive hashtags

### 🔔 Monitoring & Alerts
- Failure rate monitoring
- Queue backlog alerts
- Engagement drop detection
- Rate limit warnings

## Setup

### 1. Database Setup

Run the social marketing schema:

```bash
psql -U your_user -d your_database -f scripts/social-marketing-schema.sql
```

### 2. Environment Variables

Copy `.env.social.example` to `.env.local` and add your credentials:

```env
# Facebook
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_ACCESS_TOKEN=your_token

# Twitter
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_ACCESS_TOKEN=your_token
TWITTER_ACCESS_TOKEN_SECRET=your_token_secret

# Reddit
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_REFRESH_TOKEN=your_token
REDDIT_USER_AGENT=MensHub/1.0

# Instagram
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id
```

### 3. Platform Configuration

#### Facebook
1. Create a Facebook App at https://developers.facebook.com
2. Get a Page Access Token with `pages_manage_posts` permission
3. Add Page ID and Access Token to environment variables

#### Twitter/X
1. Apply for Twitter API access at https://developer.twitter.com
2. Create an app and get API keys
3. Generate access tokens with read/write permissions

#### Reddit
1. Create app at https://www.reddit.com/prefs/apps
2. Get client ID and secret
3. Use OAuth2 flow to get refresh token

#### Instagram
1. Convert to Instagram Business Account
2. Connect to Facebook Page
3. Use Facebook Graph API to get Instagram Business Account ID

## Usage

### Admin Dashboard

Access the social media marketing dashboard at `/admin/social-marketing`

Features:
- Start/stop automation
- View posting queue status
- Monitor platform performance
- Retry failed posts
- Sync engagement metrics

### Automation Rules

Default rules are created automatically:

1. **Fitness Articles - All Platforms**
   - Posts fitness articles to all platforms
   - Requires 500+ words and featured image

2. **Nutrition Content - Health Focused**
   - Shares on Facebook and Reddit
   - Minimum 400 words

3. **High Engagement Content**
   - Reposts successful content
   - 100+ engagement threshold

### Content Formatting

The system automatically formats content for each platform:

#### Facebook
```
💪 [Article Title]

[Excerpt - up to 200 chars]

Read more: [tracking link]

#MensHealth #Fitness #Nutrition
```

#### Twitter/X
```
New: [Truncated Title]

[link]

#MensHealth #Fitness #Health
```

#### Reddit
```
Title: [Article Title] - Science-backed guide for men
Post Type: Link post to article
```

#### Instagram
```
[Emoji] [Title]

[Excerpt]

✅ Swipe up for the full guide (link in bio)
.
.
.
#MensHealth #FitnessMotivation #GymLife [17 more hashtags]
```

### Click Tracking

All links use the format:
```
https://www.menshb.com/api/track/social?c=SHORTCODE
```

Tracks:
- IP address (anonymized)
- User agent
- Device type
- Browser
- Operating system
- Timestamp

### Monitoring

The system monitors:
- **Failure Rate**: Alerts if >20% posts fail
- **Queue Backlog**: Warns if >50 posts pending
- **Platform Status**: Checks for inactive platforms
- **Engagement Drops**: Compares week-over-week
- **Rate Limits**: Warns at 80% usage

## API Endpoints

### Analytics
```
GET /api/admin/social-marketing/analytics
  ?platform=facebook
  &from=2024-01-01
  &to=2024-01-31
  &metric=engagement
```

### Queue Status
```
GET /api/admin/social-marketing/queue-status
```

### Detector Control
```
POST /api/admin/social-marketing/detector
Body: { "action": "start" | "stop" }
```

### Retry Failed Post
```
POST /api/admin/social-marketing/retry
Body: { "post_id": "uuid" }
```

### Sync Engagement
```
POST /api/admin/social-marketing/sync-engagement
Body: { "post_id": "uuid" }
```

## Troubleshooting

### Common Issues

1. **Posts not being created**
   - Check automation is enabled
   - Verify platform credentials
   - Check automation rules match articles

2. **High failure rate**
   - Verify API credentials are valid
   - Check rate limits
   - Review error messages in dashboard

3. **Low engagement**
   - Review posting times
   - Check content formatting
   - Consider A/B testing different formats

4. **Click tracking not working**
   - Ensure tracking endpoint is accessible
   - Check URL shortening is working
   - Verify database permissions

### Debug Mode

Enable debug logging:
```typescript
// In article-detector.ts
console.log('DEBUG:', detectorStatus)

// In social-queue.ts
console.log('Queue:', await queue.getQueueStatus())
```

## Best Practices

1. **Content Quality**
   - Ensure articles have compelling titles
   - Include high-quality featured images
   - Write engaging excerpts

2. **Timing**
   - Schedule posts during peak engagement hours
   - Avoid posting too frequently
   - Consider timezone differences

3. **Platform Optimization**
   - Use platform-specific features (polls, stories)
   - Engage with comments/replies
   - Monitor platform algorithm changes

4. **Monitoring**
   - Check dashboard daily
   - Address failed posts promptly
   - Track engagement trends

## Security

- All credentials stored encrypted in environment variables
- API keys never exposed to client
- Click tracking uses anonymized data
- Admin-only access to dashboard
- Rate limiting on all endpoints

## Future Enhancements

- [ ] LinkedIn integration
- [ ] Pinterest support
- [ ] Story/Reel automation
- [ ] Competitor analysis
- [ ] Sentiment analysis
- [ ] Automated response system
- [ ] Multi-language support
- [ ] Advanced scheduling algorithms