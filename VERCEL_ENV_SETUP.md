# Vercel Environment Variables Setup

To enable the Fix Article Formatting feature in production, you need to add the `SUPABASE_SERVICE_ROLE_KEY` to your Vercel environment variables.

## Steps:

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Select your `alphamalettech` project

2. **Go to Settings → Environment Variables**
   - Click on the "Settings" tab
   - Select "Environment Variables" from the sidebar

3. **Add the Service Role Key**
   - Variable Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your Supabase service role key (found in Supabase Dashboard → Settings → API)
   - Environment: Select all (Production, Preview, Development)
   - Click "Save"

4. **Verify Existing Variables**
   Make sure you also have these variables set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Redeploy**
   - After adding the environment variable, you need to redeploy
   - Go to the "Deployments" tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

## Security Note:
The service role key provides admin access to your Supabase database. Keep it secure and never expose it in client-side code or commit it to your repository.

## Alternative:
If you don't want to add the service role key to Vercel, you can still use the Fix Formatting feature locally by running:
```bash
npm run tsx tools/fix-article-formatting.ts
```