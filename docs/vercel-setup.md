# Vercel Deployment Setup Guide

## 🚀 Complete Setup for Vercel Hosting

### Step 1: Fix Package Installation Issues (Local)

Due to npm issues, try these alternatives:

**Option A: Use the setup script**
```bash
./setup-admin.sh
```

**Option B: Manual installation**
```bash
# Try with --force flag
npm install --force next-auth @next-auth/prisma-adapter prisma @prisma/client

# Or try with legacy peer deps
npm install --legacy-peer-deps next-auth @next-auth/prisma-adapter prisma @prisma/client

# Or use yarn
yarn add next-auth @next-auth/prisma-adapter prisma @prisma/client
```

### Step 2: Set Up Vercel Environment Variables

Go to your Vercel project dashboard and add these environment variables:

#### Required Variables:
```
NEXTAUTH_SECRET=OCMfWbSMvT7uHTAxK2nVH9nm8Wk8vKogxt/9zib/r24=
NEXTAUTH_URL=https://your-project-name.vercel.app
DATABASE_URL=postgresql://postgres:qLIALqXxNJ37$^nt@db.vopntrgtkefstqbzsmot.supabase.co:5432/postgres?schema=public
DIRECT_URL=postgresql://postgres:qLIALqXxNJ37$^nt@db.vopntrgtkefstqbzsmot.supabase.co:5432/postgres?schema=public
NEXT_PUBLIC_SUPABASE_URL=https://vopntrgtkefstqbzsmot.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcG50cmd0a2Vmc3RxYnpzbW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDgyNzAsImV4cCI6MjA2NDIyNDI3MH0.9785EBdvz9VsoqL3prlJ3Q83ub3ZLIyOml4HP_WR6Dk
```

#### How to Add in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. Set Environment to **Production, Preview, Development**

### Step 3: Update Vercel Build Settings

Add to your `package.json` scripts:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

### Step 4: Database Setup

Run these commands locally (after package installation works):
```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate the Prisma client
- Create all tables in your Supabase database

### Step 5: Deploy to Vercel

**Option A: Git Push (Automatic)**
```bash
git add .
git commit -m "Add Vercel configuration and setup"
git push origin main
```
Vercel will automatically deploy from your GitHub repo.

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

### Step 6: Access Your Admin

Once deployed:
1. Go to `https://your-project-name.vercel.app/admin`
2. You'll be redirected to sign in
3. Use email magic link (no Google OAuth setup needed initially)
4. Enter your email → Check inbox → Click magic link
5. You'll be redirected to the admin dashboard

### Step 7: Test Admin Features

After signing in, you should see:
- ✅ Admin dashboard with stats cards
- ✅ Articles management section
- ✅ Ads management section  
- ✅ Keyword links section
- ✅ Bulk import section

## Troubleshooting

### Build Errors on Vercel:
1. Check that all environment variables are set
2. Ensure `postinstall` script is in package.json
3. Check Vercel build logs for specific errors

### Database Connection Issues:
1. Verify DATABASE_URL and DIRECT_URL are correct
2. Check Supabase connection pooling settings
3. Ensure database is accessible from Vercel

### Authentication Issues:
1. Verify NEXTAUTH_URL matches your Vercel domain
2. Check NEXTAUTH_SECRET is set
3. Ensure magic link emails are being sent

## Google OAuth Setup (Optional)

To enable Google sign-in:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
4. Add to Vercel environment variables:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Success! 🎉

Your admin system should now be live at:
- **Public Site**: `https://your-domain.vercel.app`
- **Admin Dashboard**: `https://your-domain.vercel.app/admin`

You can now upload articles, manage ads, and configure your Men's Health clone! 