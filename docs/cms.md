# Men's Health CMS - Complete Guide

## 🚀 Quick Start

This is a production-ready clone of MensHealth.com built with Next.js 13, TypeScript, and modern web technologies. The CMS provides everything you need to run a professional health and fitness publication.

### Environment Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd menshealth-clone
   npm install
   ```

2. **Environment Variables**
   Create `.env.local` with these required variables:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/menshealth"
   DIRECT_URL="postgresql://username:password@localhost:5432/menshealth"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Supabase (for enhanced features)
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

3. **Database Setup**
   ```bash
   npx prisma db push
   npm run seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📝 Content Management

### Adding Articles

1. **Navigate to Admin**
   - Go to `/admin` and sign in
   - Click "Articles" > "Add New Article"

2. **Article Editor Features**
   - **Rich Text Editor**: Powered by Tiptap with Men's Health styling
   - **Auto-Generated Slugs**: URL-friendly slugs created from titles
   - **SEO Optimization**: Meta descriptions, OG tags, JSON-LD
   - **Image Placeholders**: Use `{IMAGE_URL}` - will be auto-replaced
   - **Affiliate Links**: Keywords automatically converted to affiliate links
   - **Authority Links**: Auto-detected and linked to authoritative sources

3. **Content Enhancement**
   ```typescript
   // Automatic enhancements available:
   - Rewrite for originality (Men's Health voice)
   - Improve readability and structure
   - Add strategic headings (H2s every 150-250 words)
   - SEO optimization with primary keywords
   - Replace image placeholders with contextual images
   - Add authority links to credible sources
   - Insert internal links to related articles
   ```

4. **Publishing Options**
   - **Draft**: Save without publishing
   - **Published**: Live on the site
   - **Featured**: Shows in featured sections
   - **Trending**: Appears in trending widgets

### Men's Health Article Structure

The CMS automatically applies Men's Health editorial formatting:

```html
<!-- Lead paragraph with ALL-CAPS hook -->
<p class="lead">YOUR FITNESS GAME IS ABOUT TO CHANGE. Here's everything you need to know.</p>

<!-- Quick Takeaways box -->
<div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
  <h3 class="text-lg font-bold text-red-900 mb-4">Quick Takeaways</h3>
  <ul>
    <li>Key insight #1</li>
    <li>Key insight #2</li>
  </ul>
</div>

<!-- Expert quotes -->
<blockquote class="border-l-4 border-red-600 pl-6 bg-gray-50">
  <p>"Professional insight that adds credibility"</p>
  <footer>— Dr. Expert Name, Credentials</footer>
</blockquote>

<!-- Action steps -->
<div class="bg-gray-100 p-6 rounded-lg">
  <h3>Action Steps:</h3>
  <ol>
    <li>Specific actionable step</li>
    <li>Another concrete action</li>
  </ol>
</div>
```

## 📦 Bulk Import System

### Importing Articles from ZIP Files

1. **Prepare Your Content**
   - Supported formats: HTML, Markdown, TXT
   - Pack multiple files into a ZIP
   - Include images (will be processed)

2. **Import Process**
   - Go to `/admin/import`
   - Drag and drop your ZIP file
   - Configure import options:
     - **Enhance Content**: Apply Men's Health formatting
     - **Replace Images**: Auto-find contextual images
     - **Add Authority Links**: Link to credible sources
     - **Add Internal Links**: Cross-reference existing articles
     - **Category**: Assign to specific category
     - **Publish Immediately**: Go live or save as drafts

3. **Conversion Pipeline**
   ```
   HTML → Turndown → Markdown → Enhanced → MDX → Database
   ```

4. **Preview and Review**
   - See diff before committing
   - Review warnings and errors
   - Bulk approve or individual selection

### Supported File Formats

- **HTML Files** (`.html`, `.htm`): Converted to clean Markdown
- **Markdown Files** (`.md`, `.markdown`): Processed and enhanced
- **Text Files** (`.txt`): Basic formatting applied

## 🔗 Keyword Hot-Linking System

### Setting Up Affiliate Keywords

1. **Add Keywords**
   - Go to `/admin/keywords`
   - Click "Add Keyword"
   - Configure:
     - **Keyword**: Text to match (e.g., "protein powder")
     - **Affiliate URL**: Your affiliate/partner link
     - **Category**: Supplements, Fitness, Nutrition, etc.
     - **Max Per Page**: Limit links per article (1-10)
     - **Weight**: Priority (1-100, higher = more important)

2. **How It Works**
   ```typescript
   // During article rendering:
   "I recommend protein powder for recovery"
   // Becomes:
   "I recommend <a href="affiliate-link" rel="nofollow sponsored">protein powder</a> for recovery"
   ```

3. **SEO Best Practices**
   - Automatic `rel="nofollow sponsored"` attributes
   - `target="_blank"` for external links
   - Click tracking for analytics
   - Respects max-hits-per-page limits

4. **Performance Tracking**
   - Total clicks per keyword
   - Revenue attribution
   - Click-through rates
   - Category performance analysis

### Keyword Strategy Tips

- **Quality over Quantity**: 20-30 high-converting keywords work better than 200 random ones
- **Relevance**: Match keywords to your content categories
- **Moderation**: 2-3 affiliate links per article maintains readability
- **Testing**: Monitor which keywords drive actual sales

## 🎯 Ad Management System

### Creating Ad Campaigns

1. **Ad Setup**
   - Go to `/admin/ads`
   - Click "Add New Ad"
   - Configure:
     - **Name**: Internal reference
     - **Image**: Upload creative (supports multiple sizes)
     - **Target URL**: Landing page
     - **Sizes**: Standard web ad sizes (300x250, 728x90, etc.)
     - **Placement**: Header, Sidebar, Inline, Footer
     - **Weight**: Rotation priority

2. **Ad Placements**
   ```tsx
   // Use throughout your site:
   <AdSlot placement="header" />
   <AdSlot placement="sidebar" />
   <AdSlot placement="inline" />
   <AdSlot placement="footer" />
   ```

3. **Supported Ad Sizes**
   - **Header**: 728x90 (Leaderboard), 970x250 (Billboard)
   - **Sidebar**: 300x250 (Medium Rectangle), 160x600 (Skyscraper)
   - **Inline**: 728x90 (Leaderboard), 300x250 (Rectangle)
   - **Footer**: 728x90 (Leaderboard), 970x90 (Super Leaderboard)

4. **Smart Ad Rotation**
   - Weight-based selection
   - Automatic fallbacks
   - Performance tracking
   - A/B testing support

## 🔧 Technical Features

### Performance Optimizations

- **Bundle Size**: ≤ 250kB JavaScript on homepage
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Image Optimization**: `next/image` with automatic WebP conversion
- **Font Loading**: `next/font/google` for system fonts
- **Caching**: Aggressive caching with ISR (Incremental Static Regeneration)

### SEO Features

- **Structured Data**: JSON-LD for articles, authors, organizations
- **Meta Tags**: Dynamic OG tags, Twitter cards
- **Canonical URLs**: Prevent duplicate content
- **Sitemap**: Auto-generated XML sitemap
- **RSS Feed**: Automatic RSS generation
- **Internal Linking**: Smart cross-references between articles

### Security Features

- **Input Sanitization**: All user content is sanitized
- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: API endpoint protection
- **XSS Prevention**: Content Security Policy headers
- **SQL Injection**: Prisma ORM prevents injection attacks

## 📊 Analytics & Monitoring

### Built-in Analytics

1. **Article Performance**
   - Page views per article
   - Reading time analytics
   - Bounce rate tracking
   - Social sharing metrics

2. **Keyword Performance**
   - Click-through rates
   - Revenue attribution
   - Conversion tracking
   - Category analysis

3. **Ad Performance**
   - Impression tracking
   - Click-through rates
   - Revenue per placement
   - A/B testing results

### Integration Options

- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: Custom event tracking
- **Google Search Console**: SEO performance
- **Affiliate Networks**: Revenue tracking APIs

## 🛠️ Development Workflow

### Code Quality

```bash
# Linting and formatting
npm run lint          # ESLint type checking
npm run format        # Prettier formatting

# Type checking
npm run type-check    # TypeScript validation

# Testing
npm run test          # Jest unit tests
npm run test:e2e      # Playwright end-to-end tests
```

### Database Management

```bash
# Schema changes
npx prisma db push           # Push schema changes
npx prisma migrate dev       # Create migration
npx prisma studio           # Database GUI

# Data management
npm run seed                 # Populate with demo data
npm run reset               # Reset database
```

### Deployment

```bash
# Production build
npm run build               # Build for production
npm run start              # Start production server

# Bundle analysis
npm run analyze            # Analyze bundle size
```

## 🔒 Security Best Practices

### Content Security

1. **User Input**: All content is sanitized before storage
2. **File Uploads**: Images are processed and validated
3. **External Links**: Automatic `rel="noopener"` attributes
4. **Affiliate Links**: Proper disclosure and tracking

### Access Control

1. **Admin Routes**: Protected by NextAuth.js
2. **Role-Based Access**: Admin, Editor, Author roles
3. **API Security**: Rate limiting and authentication
4. **Session Management**: Secure session handling

## 📱 Mobile Optimization

### Responsive Design

- **Breakpoints**: Mobile-first Tailwind CSS
- **Touch Targets**: Minimum 44px touch areas
- **Performance**: Optimized for 3G networks
- **PWA Ready**: Service worker and manifest

### Mobile Features

- **Offline Reading**: Cache articles for offline viewing
- **Push Notifications**: Article alerts and updates
- **App-like Experience**: Full-screen mode support
- **Fast Loading**: Critical CSS inlined

## 🎨 Customization

### Styling

```css
/* Custom CSS variables */
:root {
  --primary-red: #dc2626;    /* Men's Health red */
  --text-primary: #111827;   /* Dark gray */
  --text-secondary: #6b7280; /* Light gray */
  --background: #ffffff;     /* White */
}

/* Component customization */
.mens-health-button {
  @apply bg-red-600 text-white font-bold py-3 px-6 rounded;
}
```

### Theme Configuration

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'mh-red': '#dc2626',
        'mh-black': '#111827',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
      }
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check database status
   npx prisma db push
   # Reset if needed
   npx prisma migrate reset
   ```

2. **Image Upload Issues**
   ```bash
   # Verify Cloudinary credentials
   echo $CLOUDINARY_CLOUD_NAME
   # Test upload endpoint
   curl -X POST /api/upload
   ```

3. **Keyword Linking Not Working**
   - Check keyword status is "Active"
   - Verify `max_hits_per_page` > 0
   - Ensure keywords exist in content
   - Check browser console for errors

4. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next
   npm run build
   ```

### Performance Issues

1. **Slow Page Loads**
   - Check bundle size: `npm run analyze`
   - Optimize images: Ensure WebP format
   - Review database queries

2. **Memory Issues**
   - Monitor with: `node --max-old-space-size=4096`
   - Check for memory leaks in components
   - Optimize large data operations

## 📞 Support

### Getting Help

1. **Documentation**: Check this guide first
2. **Issues**: Create GitHub issue with reproduction steps
3. **Community**: Join our Discord for quick help
4. **Enterprise**: Contact for priority support

### Contributing

1. **Bug Reports**: Use GitHub issues
2. **Feature Requests**: Discussion in GitHub Discussions
3. **Pull Requests**: Follow contribution guidelines
4. **Documentation**: Help improve these docs

---

## 🎉 You're Ready!

Your Men's Health CMS is now ready for production. Start by:

1. **Setting up your first article** at `/admin/articles`
2. **Configuring affiliate keywords** at `/admin/keywords`  
3. **Adding ad placements** at `/admin/ads`
4. **Importing existing content** at `/admin/import`

For additional help, check the troubleshooting section or create an issue on GitHub.

**Happy publishing! 💪** 