# Admin Access Guide

## How to Access the Admin Section

The admin section is located at `/admin` and requires authentication.

### Step 1: Install Required Dependencies

First, you need to install the necessary packages:

```bash
npm install next-auth @next-auth/prisma-adapter prisma @prisma/client @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-video bcryptjs @types/bcryptjs
```

### Step 2: Set Up Your Environment Variables

Make sure your `.env.local` file includes:

```bash
# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email configuration (for magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Database (already configured)
DATABASE_URL="your-supabase-connection-string"
DIRECT_URL="your-supabase-direct-connection-string"
```

### Step 3: Run Database Migrations

```bash
npx prisma generate
npx prisma db push
```

### Step 4: Create Your First Admin User

You have two options to sign in:

#### Option A: Google OAuth (Recommended)
1. Go to `http://localhost:3000/admin`
2. You'll be redirected to the sign-in page
3. Click "Continue with Google"
4. Sign in with your Google account
5. You'll be redirected to the admin dashboard

#### Option B: Email Magic Link
1. Go to `http://localhost:3000/admin`
2. Enter your email address
3. Click "Send magic link"
4. Check your email for the magic link
5. Click the link to sign in

### Step 5: Admin Dashboard Features

Once signed in, you'll have access to:

- **Articles Management**: Create, edit, and publish articles using the Tiptap rich text editor
- **Ad Management**: Upload and manage ad creatives for different placements
- **Keyword Links**: Set up affiliate links that automatically replace keywords in articles
- **Bulk Import**: Import multiple articles from ZIP files

### Admin URLs

- **Dashboard**: `/admin`
- **Articles**: `/admin/articles`
- **New Article**: `/admin/articles/new`
- **Edit Article**: `/admin/articles/[id]/edit`
- **Ads**: `/admin/ads`
- **Keywords**: `/admin/keywords`
- **Bulk Import**: `/admin/import`

### Security Notes

- Only authenticated users can access admin routes
- User roles are stored in the database (default: "user", admin: "admin")
- Sessions are stored in the database for security
- All admin routes are protected by middleware

### Troubleshooting

1. **Can't access admin**: Make sure you've run the database migrations
2. **Google sign-in not working**: Check your Google OAuth credentials
3. **Email not sending**: Verify your email server configuration
4. **Database errors**: Ensure your Supabase connection is working

### Next Steps

After setting up admin access:

1. Create your first article
2. Set up some keyword links for affiliate marketing
3. Upload ad creatives
4. Import existing content using the bulk importer

For detailed feature documentation, see the main CMS documentation. 