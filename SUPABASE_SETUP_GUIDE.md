# 🚀 Quick Fix: Missing Nutrition Articles

Your bulk uploaded articles aren't appearing because they weren't saved to the database. Here's how to fix it:

## **Step 1: Run the Database Setup (2 minutes)**

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Click **"SQL Editor"** in the sidebar

2. **Copy & Run the Setup Script**
   - Copy **ALL contents** from `docs/supabase-articles-setup.sql`
   - Paste into the SQL Editor
   - Click **"Run"** button

3. **Verify Success**
   - You should see success messages in the Results panel
   - Go to **"Table Editor"** → You should see the `articles` table
   - The table should have 3 sample articles

## **Step 2: Retry Your Bulk Upload**

1. Go to `/admin/import` on your site
2. Upload your nutrition articles again  
3. Check `/articles/nutrition` - articles should now appear!

## **What This Fixes:**

- ✅ Creates proper `articles` table structure
- ✅ Sets up Row Level Security (RLS) correctly
- ✅ Adds indexes for performance
- ✅ Inserts sample articles for testing
- ✅ Enables public read access to published articles

## **Alternative: Quick Disable RLS (Testing Only)**

If you want to test immediately without running the full script:

```sql
-- In Supabase SQL Editor:
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
```

Then retry your bulk upload. **WARNING:** This removes security - only use for testing!

## **Expected Results:**

After running the setup:
- Your nutrition page should show sample articles immediately
- Bulk uploads will work properly  
- Articles will persist and appear on the public site
- Cache will refresh automatically

## **Need Help?**

If you still don't see articles after this:
1. Check browser console for errors
2. Visit `/api/debug/articles` to see database status
3. Verify the articles table exists in Supabase Table Editor 