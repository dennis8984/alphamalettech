# Supabase Database Setup Guide

This guide will help you set up the required database tables for Men's Hub commenting and newsletter functionality.

## 🚀 Quick Setup (5 minutes)

### Step 1: Access Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Men's Hub project
4. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Database Migration
1. Copy the entire contents of `docs/supabase-setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify Tables Were Created
1. Go to **Table Editor** in the left sidebar
2. You should see two new tables:
   - `comments`
   - `newsletter_subscribers`

## 📋 What Gets Created

### Tables

#### `comments` Table
- **Purpose**: Stores all user comments on articles
- **Fields**:
  - `id` (UUID) - Primary key
  - `article_id` (TEXT) - Article identifier/slug
  - `user_id` (UUID) - References auth.users
  - `user_email` (TEXT) - User's email
  - `user_name` (TEXT) - Display name
  - `content` (TEXT) - Comment content
  - `created_at` (TIMESTAMPTZ) - Auto-generated
  - `updated_at` (TIMESTAMPTZ) - Auto-updated

#### `newsletter_subscribers` Table
- **Purpose**: Stores newsletter subscription data
- **Fields**:
  - `id` (UUID) - Primary key
  - `name` (TEXT) - Subscriber's name
  - `email` (TEXT) - Unique email address
  - `subscribed_at` (TIMESTAMPTZ) - Auto-generated
  - `is_active` (BOOLEAN) - Subscription status

### Security (Row Level Security)

#### Comments Policies
- ✅ **Anyone can read** comments (public)
- ✅ **Authenticated users can post** comments
- ✅ **Users can edit/delete** their own comments only

#### Newsletter Policies
- ✅ **Anyone can subscribe** to newsletter
- ✅ **Read access** for admin purposes

### Performance Optimizations
- **Indexes** on frequently queried fields
- **Triggers** for automatic timestamp updates
- **Views** for comment statistics

## 🔧 Manual Setup (Alternative)

If you prefer to create tables manually:

### 1. Create Comments Table
```sql
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Create Newsletter Subscribers Table
```sql
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### 3. Enable Row Level Security
```sql
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
```

### 4. Create Basic Policies
```sql
-- Allow public reading of comments
CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Users can insert their own comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow anyone to subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);
```

## 🧪 Testing the Setup

### Test Comments
1. Sign up for an account on your site
2. Navigate to any article
3. Try posting a comment
4. Check the `comments` table in Supabase

### Test Newsletter
1. Fill out the subscription form at `/subscribe`
2. Check the `newsletter_subscribers` table in Supabase
3. Verify you receive the magic link email

## 📊 Viewing Data

### Comments Analytics
```sql
-- Get comment count per article
SELECT article_id, COUNT(*) as comment_count 
FROM comments 
GROUP BY article_id 
ORDER BY comment_count DESC;

-- Get most active commenters
SELECT user_name, user_email, COUNT(*) as comment_count
FROM comments 
GROUP BY user_name, user_email 
ORDER BY comment_count DESC;
```

### Newsletter Analytics
```sql
-- Get total active subscribers
SELECT COUNT(*) as total_subscribers 
FROM newsletter_subscribers 
WHERE is_active = true;

-- Get recent subscriptions
SELECT name, email, subscribed_at 
FROM newsletter_subscribers 
ORDER BY subscribed_at DESC 
LIMIT 10;
```

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User authentication** required for commenting
- **Data validation** at database level
- **Foreign key constraints** for data integrity
- **Email uniqueness** for newsletter subscriptions

## 🚨 Troubleshooting

### Comments Not Appearing
1. Check if user is authenticated
2. Verify `comments` table exists
3. Check RLS policies are enabled
4. Look for errors in browser console

### Newsletter Signup Failing
1. Verify `newsletter_subscribers` table exists
2. Check for duplicate email addresses
3. Ensure email validation is working
4. Check Supabase logs for errors

### Database Connection Issues
1. Verify environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Check Supabase project is active
3. Verify API keys are correct

## ✅ Success Checklist

- [ ] SQL migration executed successfully
- [ ] `comments` table created
- [ ] `newsletter_subscribers` table created
- [ ] RLS policies enabled
- [ ] Test comment posting works
- [ ] Test newsletter signup works
- [ ] Magic link authentication works
- [ ] Data appears in Supabase tables

## 🎯 Next Steps

After setup is complete:
1. **Test the full user flow** from signup to commenting
2. **Monitor the tables** for incoming data
3. **Set up email notifications** for new comments (optional)
4. **Create admin dashboard** to manage subscribers (optional)
5. **Add comment moderation** features (optional)

---

Your Men's Hub community platform is now ready for production use! 🚀 