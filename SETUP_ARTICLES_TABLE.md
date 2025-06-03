# 🚀 URGENT: Set Up Articles Table in Supabase

Your imported articles are currently not persisting because they need to be saved to Supabase. Follow these steps to fix this:

## Quick Setup (2 minutes)

### 1. Open Supabase SQL Editor
- Go to your Supabase project at https://supabase.com
- Click on **SQL Editor** in the left sidebar

### 2. Run the Migration Script
- Copy ALL the contents from `docs/supabase-articles-setup.sql`
- Paste it into the SQL Editor
- Click **Run** button

### 3. Verify It Worked
- Go to **Table Editor** in Supabase
- You should see a new `articles` table
- It might have 1 sample article already

## That's it! 🎉

Your imported articles will now:
- ✅ Save permanently to Supabase
- ✅ Show up in the Nutrition category (and all other categories)
- ✅ Persist between deployments
- ✅ Be visible on the public site

## Test It
1. Go to `/admin/import` on your site
2. Upload a CSV file with articles
3. Check the Nutrition category - articles should appear!
4. Refresh the page - articles should still be there!

## Troubleshooting
- If you get permission errors, make sure you're logged into Supabase
- If articles still don't show, check the `articles` table in Supabase Table Editor
- The table uses temporary public access for now (we'll add proper auth later) 