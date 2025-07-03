# 📚 How to Import Your Articles from article-prompts.md

## 🎯 Current Situation

Your 10 comprehensive articles in `/article-prompts.md` are not appearing on the website because they need to be imported into the Supabase database. The website reads articles from the database, not directly from markdown files.

## ✅ Solution: Import via Admin Interface

I've created a CSV file (`articles-import.csv`) containing all your articles that can be easily imported through the admin interface.

### Step 1: Access the Admin Import Page

1. Start your development server if not already running:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/admin/import`

### Step 2: Upload the CSV File

1. Click "Browse Files" or drag and drop `articles-import.csv` into the upload area
2. The file is already in your project root directory
3. Click "Process Upload"

### Step 3: Map CSV Columns (if needed)

The import tool will automatically detect and map your CSV columns. Verify the mappings:
- Title → title
- Content → content  
- Excerpt → excerpt
- Category → category
- Author → author
- Image → image
- Date → date

### Step 4: Review and Import

1. Review the 10 articles in the preview
2. All should show as "ready" status with green checkmarks
3. Click "Import Selected (10)" to import all articles

### Step 5: Verify Import Success

After import completes:
1. Visit `http://localhost:3000` - Articles should appear on homepage
2. Check category pages:
   - `/articles/fitness` (4 articles)
   - `/articles/nutrition` (2 articles)
   - `/articles/weight-loss` (1 article)
   - `/articles/health` (1 article)
   - `/articles/style` (1 article)
   - `/articles/entertainment` (1 article)

## 🚨 Important: Supabase Setup Required

**Before importing, ensure your Supabase database is properly configured:**

### Check Supabase Connection

1. Add these environment variables to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Get these values from your Supabase project:
   - Go to [supabase.com](https://supabase.com)
   - Open your project
   - Go to Settings → API
   - Copy the URL and anon/public key

### Run Database Setup

If you haven't already set up the articles table:

1. Open Supabase SQL Editor
2. Run the script from `docs/supabase-articles-setup.sql`
3. This creates the articles table with proper structure

## 🔧 Alternative: Direct Database Import

If you prefer programmatic import, I've also created:
- `scripts/import-articles-from-markdown.ts` - Direct database import
- `scripts/convert-markdown-to-csv.ts` - Converts markdown to CSV

To use the direct import:
```bash
npx tsx scripts/import-articles-from-markdown.ts
```

**Note:** This requires Supabase environment variables to be configured.

## 📝 Article Distribution

Your 10 articles cover these categories:
- **Fitness**: 4 articles
  - Men's Fitness: The Complete Guide
  - Workout Tips: Expert Strategies
  - Muscle Building: Complete Guide
  - Exercise Routines: Training Programs
  
- **Nutrition**: 2 articles
  - Nutrition Advice: Fueling Your Body
  - Diet Plans for Men: Customized Strategies
  
- **Weight Loss**: 1 article
  - Weight Loss for Men: Science-Based Strategies
  
- **Health**: 1 article
  - Men's Health: Complete Guide to Wellness
  
- **Style**: 1 article
  - Men's Style: Master Your Personal Fashion
  
- **Entertainment**: 1 article
  - Entertainment for Men: Movies, Sports, and Pop Culture

## 🎯 Next Steps After Import

1. **Test Search**: Articles should be searchable on your site
2. **Check SEO**: Each article has proper meta descriptions
3. **Verify Images**: Articles use placeholder images that can be updated
4. **Admin Management**: Use `/admin/articles` to edit articles
5. **Monitor Traffic**: Articles are optimized for their target keywords

## ❓ Troubleshooting

If articles don't appear after import:

1. **Check Browser Console** for JavaScript errors
2. **Verify Database Connection** at `/api/debug/articles`
3. **Clear Cache** with the refresh button in admin
4. **Check Supabase Dashboard** to confirm articles exist in database
5. **Verify RLS Policies** are allowing public read access

## 📊 Why Database Storage?

Your website uses database storage for articles because:
- **Dynamic Loading**: Articles load based on category/search
- **Admin Interface**: Easy editing and management
- **Performance**: Database queries are optimized
- **Scalability**: Can handle thousands of articles
- **Search**: Full-text search capabilities
- **Analytics**: Track views and engagement

The markdown file serves as your source/backup, while the database powers the live site.