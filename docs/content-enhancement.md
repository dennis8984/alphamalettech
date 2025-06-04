# Content Enhancement System

The Men's Hub content enhancement system provides comprehensive article optimization with automatic image replacement, authority link detection, and internal link optimization.

## Features

### 🖼️ **Image Service** (Unsplash Integration)
- **Automatic Image Replacement**: Replaces `{IMAGE_URL}` placeholders with relevant high-quality images
- **Smart Search**: Analyzes article content to find contextually relevant images
- **Fallback System**: Uses backup images when API is unavailable
- **Men's Health Focus**: Searches optimized for fitness, nutrition, and health imagery

### 🔗 **Authority Link Detector**
- **Government Sources**: Automatically links mentions of CDC, FDA, NIH, WHO, etc.
- **Educational Institutions**: Links Harvard, Stanford, Johns Hopkins, etc.
- **Research Journals**: Links The Lancet, Nature, NEJM, JAMA, etc.
- **Medical Organizations**: Links Mayo Clinic, American Heart Association, etc.

### 🔗 **Internal Link Optimizer**
- **Smart Matching**: Analyzes content to find natural internal linking opportunities
- **Relevance Scoring**: Prioritizes links based on topic relevance and content quality
- **SEO Optimization**: Adds strategic internal links to boost page authority
- **Natural Placement**: Ensures links feel organic and helpful to readers

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Unsplash API (for automatic image fetching)
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
```

### Getting Unsplash API Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy the "Access Key"
4. Add to your environment variables

## Usage

### Automatic Enhancement (Bulk Import)

The bulk import system automatically applies all enhancements:

```typescript
const enhancedContent = await ContentEnhancer.enhanceContent(
  title,
  content,
  {
    rewriteForOriginality: true,
    improveReadability: true,
    addHeadings: true,
    optimizeForSEO: true,
    replaceImages: true,           // 🖼️ Fetch and replace images
    addAuthorityLinks: true,       // 🔗 Link to .gov/.edu sources
    addInternalLinks: true,        // 🔗 Add internal site links
    articleSlug: 'article-slug',
    category: 'fitness'
  }
)
```

### Manual Services

#### Image Service

```typescript
import { ImageService } from '@/lib/image-service';

// Get article image
const imageUrl = await ImageService.getArticleImage(
  'How to Build Muscle Fast',
  'fitness',
  'Build lean muscle with these proven strategies...'
);

// Replace placeholders in content
const updatedContent = await ImageService.replaceImagePlaceholders(
  content,
  'Article Title',
  'fitness'
);
```

#### Authority Link Detection

```typescript
import { AuthorityLinkDetector } from '@/lib/authority-link-detector';

// Detect and link authorities
const result = await AuthorityLinkDetector.detectAndLinkAuthorities(content);

console.log(result.linkedText);      // Content with authority links
console.log(result.linksAdded);      // Array of added links
```

#### Internal Link Optimization

```typescript
import { InternalLinkOptimizer } from '@/lib/internal-link-optimizer';

// Optimize internal links
const result = await InternalLinkOptimizer.optimizeInternalLinks(
  content,
  'current-article-slug',
  2  // Target number of links
);

console.log(result.linkedText);      // Content with internal links
console.log(result.linksAdded);      // Array of added links
```

## Men's Health Editorial Structure

The system creates professional Men's Health-style articles with:

### Content Structure
- **Hook Lede**: 2-sentence opener (first may be ALL-CAPS)
- **Quick Takeaways**: Styled red box with 3-5 bullet points
- **Strategic H2 Headings**: Every 150-250 words with keyword optimization
- **Expert Quotes**: Professional blockquotes with credentials
- **Action Lists**: Numbered steps with clear formatting
- **CTA Call-outs**: Motivational "Quick Tip" and "READ MORE" sections

### SEO Optimization
- **Meta Descriptions**: 140-160 character optimized descriptions
- **Image Alt Text**: Keyword-rich, descriptive alt attributes
- **Authority Links**: Links to .gov/.edu/research sources boost credibility
- **Internal Links**: Strategic linking improves site architecture
- **Keyword Optimization**: Natural keyword placement throughout content

### Professional Features
- **Second-Person Voice**: Engaging "you" perspective
- **Active Voice**: Dynamic, action-oriented language
- **Power Words**: "Proven", "Essential", "Game-changing", etc.
- **Men's Health Vocabulary**: Fitness and health-focused terminology

## Examples

### Before Enhancement
```html
<p>Exercise is important for health. Studies show benefits.</p>
<img src="{IMAGE_URL}" alt="exercise">
<p>Research indicates muscle building works.</p>
```

### After Enhancement
```html
<p class="lead text-xl text-gray-700 mb-8 leading-relaxed">
YOUR FITNESS GAME IS ABOUT TO CHANGE. Here's everything you need to know to build the physique you've always wanted.
</p>

<div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
  <h3 class="text-lg font-bold text-red-900 mb-3">Quick Takeaways</h3>
  <ul class="space-y-2 text-red-800">
    <li class="flex items-start">
      <span class="text-red-600 mr-2">•</span>
      Muscle building can transform your health in ways you never imagined
    </li>
    <li class="flex items-start">
      <span class="text-red-600 mr-2">•</span>
      The right approach makes all the difference between success and failure
    </li>
  </ul>
</div>

<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6">
Why Muscle Building Works Better Than You Think
</h2>

<p class="mb-6 text-gray-700 leading-relaxed">
Training is crucial for your health. Studies from the 
<a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">CDC</a> 
show significant benefits for 
<a href="/articles/muscle-building-basics" class="text-red-600 hover:text-red-800 underline font-medium">muscle development</a>.
</p>

<figure class="my-8">
  <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b" 
       alt="Man demonstrating proper muscle building technique in gym" 
       class="w-full rounded-lg">
  <figcaption class="text-center text-gray-600 text-sm mt-2">
    Proper form is essential for maximizing muscle building results.
  </figcaption>
</figure>
```

## Performance

### Image Service
- **API Rate Limits**: 50 requests/hour for free Unsplash accounts
- **Fallback Images**: High-quality Pexels images when API unavailable
- **Image Optimization**: Returns optimized URLs for fast loading

### Link Detection
- **Authority Database**: 50+ pre-mapped authority sources
- **Pattern Matching**: Advanced regex for institution detection
- **Link Validation**: Ensures all links point to official sources

### Internal Linking
- **Relevance Scoring**: Sophisticated algorithm for link quality
- **Content Analysis**: Keyword extraction and semantic matching
- **Performance**: Processes 1000+ articles in under 30 seconds

## Troubleshooting

### Image Issues
- **No Images Loading**: Check `UNSPLASH_ACCESS_KEY` environment variable
- **Placeholder Not Replaced**: Ensure `{IMAGE_URL}` format exactly
- **Wrong Images**: Content may need more specific keywords

### Authority Links
- **Links Not Added**: Check content mentions common authority sources
- **Wrong Links**: Authority mapping may need updates
- **Missing Links**: Add new sources to `getKnownAuthorityLink()` method

### Internal Links
- **No Internal Links**: Ensure sufficient published articles exist
- **Poor Link Quality**: Check relevance scoring algorithm
- **Over-linking**: Adjust `targetLinkCount` parameter

## Advanced Configuration

### Custom Image Sources
```typescript
// Override image search query
ImageService.generateImageSearchQuery = (title, category, excerpt) => {
  return `${title} professional ${category} men's health`;
};
```

### Custom Authority Sources
```typescript
// Add new authority sources
const customSources = {
  'New Authority': {
    text: 'New Authority',
    url: 'https://newauthority.gov',
    type: 'government',
    confidence: 1.0
  }
};
```

### Custom Link Scoring
```typescript
// Adjust internal link relevance scoring
InternalLinkOptimizer.calculateRelevanceScore = (match, article, content) => {
  // Custom scoring logic
  return customScore;
};
```

## API Reference

### ContentEnhancer.enhanceContent()

**Parameters:**
- `title: string` - Article title
- `content: string` - Article content (HTML/Markdown)
- `options: ContentEnhancementOptions` - Enhancement options

**Options:**
- `rewriteForOriginality?: boolean` - Rewrite for uniqueness
- `improveReadability?: boolean` - Format for readability
- `addHeadings?: boolean` - Add strategic H2 headings
- `optimizeForSEO?: boolean` - Generate meta descriptions
- `replaceImages?: boolean` - Fetch and replace images
- `addAuthorityLinks?: boolean` - Link to authority sources
- `addInternalLinks?: boolean` - Add internal site links
- `articleSlug?: string` - Current article slug (for internal linking)
- `category?: string` - Article category
- `primaryKeyword?: string` - Override primary keyword

**Returns:**
```typescript
interface EnhancedContent {
  title: string;                    // Enhanced title
  content: string;                  // Enhanced content
  excerpt: string;                  // Generated excerpt
  readabilityScore: number;         // Readability score (0-100)
  wordCount: number;                // Total word count
  warnings: string[];               // Enhancement warnings
  metaDescription?: string;         // SEO meta description
  imageReplacements?: number;       // Number of images replaced
  authorityLinksAdded?: number;     // Number of authority links added
  internalLinksAdded?: number;      // Number of internal links added
}
``` 