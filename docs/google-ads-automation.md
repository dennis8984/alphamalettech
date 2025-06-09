# Google Ads Automation System

## Overview
The Google Ads automation system generates compelling ad campaigns for your published articles to drive traffic and increase readership.

## Quick Start

### 1. Generate Campaign Data
```javascript
import { createArticleAdCampaign } from '@/lib/google-ads-automation'

const article = {
  articleId: 'article-123',
  title: 'The Ultimate Guide to Building Muscle',
  excerpt: 'Learn science-backed strategies for rapid muscle growth.',
  category: 'fitness',
  slug: 'ultimate-guide-building-muscle',
  tags: ['muscle building', 'strength training', 'fitness']
}

const campaignData = await createArticleAdCampaign(article)
```

### 2. Use in Google Ads
1. Go to [Google Ads Manager](https://ads.google.com)
2. Create new Search campaign
3. Use generated headlines, descriptions, and keywords
4. Set budget to $20/day
5. Target English-speaking countries

## Generated Content

### Headlines (Category-Specific)
- **Fitness**: "Get Fit Fast", "Workout Like a Pro", "Build Muscle & Strength"
- **Nutrition**: "Nutrition Secrets", "Eat Better Today", "Healthy Eating Tips"  
- **Weight Loss**: "Lose Weight Fast", "Get Lean Now", "Burn Fat Effectively"
- **Health**: "Improve Health", "Men's Health Tips", "Stay Healthy & Strong"
- **Style**: "Upgrade Style", "Look Great Daily", "Men's Fashion Tips"

### Descriptions
- Article excerpt (truncated to 90 chars)
- "Expert [category] tips from Men's Hub. Trusted advice for real results."
- "Transform your [category] with proven strategies. Read the full guide now!"
- "Men's Hub - Your ultimate guide to health, fitness, and lifestyle success."

### Keywords
- Article tags + "tips" variations
- Category-based keywords
- "men's [category]" variations
- General men's health terms

## Best Practices

### Campaign Setup
- Start with $20/day budget
- Use "Phrase Match" keywords
- Target US, CA, GB, AU
- Monitor for 7 days before optimizing

### Performance Optimization
- Pause high CPC campaigns (>$3.00)
- Increase budget for high CTR campaigns (>3%)
- Add negative keywords for irrelevant traffic
- Test different headline combinations

## Expected Performance
- **CTR**: 2-4% for health/fitness content
- **CPC**: $0.50-$2.00 average
- **Conversion Rate**: 1-3% newsletter signups
- **CPA**: $15-$60 per subscriber

## Integration Examples

### Manual Console Usage
```javascript
// Run in browser console
const campaignData = await createArticleAdCampaign({
  articleId: 'nutrition-123',
  title: '10 Superfoods That Boost Energy',
  excerpt: 'Natural foods that increase energy and improve performance.',
  category: 'nutrition', 
  slug: '10-superfoods-boost-energy',
  tags: ['superfoods', 'energy', 'nutrition']
})

// Copy to clipboard
navigator.clipboard.writeText(JSON.stringify(campaignData, null, 2))
```

### Bulk Processing
```javascript
const articles = await getAllPublishedArticles()
const campaigns = await Promise.all(
  articles.map(article => createArticleAdCampaign(article))
)
console.log(`Generated ${campaigns.length} campaigns`)
```

## Troubleshooting

### Low Performance
- **Low Impressions**: Increase bids or add broader keywords
- **High CPC**: Add negative keywords, improve Quality Score
- **Low CTR**: Test new headlines, improve ad relevance
- **Poor Conversions**: Optimize landing page, adjust targeting

### Technical Issues
- Ensure article has all required fields (title, excerpt, category, slug)
- Check that tags are properly formatted as string array
- Verify article is published and accessible

For support, check the generated campaign data in browser console or contact the development team.

---

*This automation system helps streamline your Google Ads marketing while maintaining high-quality, targeted campaigns for your Men's Hub articles.* 