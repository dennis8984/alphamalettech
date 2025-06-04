# 🚀 Deployment Guide - Men's Health CMS

## Quick Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Claude AI integration and security fixes"
git push origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js and deploy

### 3. Environment Variables
Add these in your Vercel dashboard under **Settings > Environment Variables**:

#### Required Variables
```bash
# Database (Supabase/Railway/PlanetScale)
DATABASE_URL="postgresql://username:password@localhost:5432/menshealth"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yourdomain.vercel.app"

# Admin Security (ADD YOUR EMAILS HERE)
ADMIN_EMAIL_1="admin@yourdomain.com"
ADMIN_EMAIL_2="editor@yourdomain.com"
ADMIN_EMAIL_3="another-admin@yourdomain.com"

# Claude AI (GET FROM ANTHROPIC)
CLAUDE_API_KEY="your-claude-api-key-from-anthropic"
```

#### Optional Variables
```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Provider (for magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## 🔑 Getting API Keys

### Claude AI API Key
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up/Login
3. Go to **API Keys** 
4. Create new key
5. Copy and add to Vercel environment variables

### Database Setup (Supabase Recommended)
1. Visit [supabase.com](https://supabase.com)
2. Create new project
3. Go to **Settings > Database**
4. Copy **Connection string** 
5. Add as `DATABASE_URL`

---

## ✅ Post-Deployment Checklist

### 1. Test Admin Access
- Go to `https://yourdomain.vercel.app/admin`
- Try logging in with admin email
- Verify unauthorized emails are blocked

### 2. Test Claude AI Integration
- Create/edit article in admin
- Enable "Use Claude AI" option
- Verify content is enhanced with Men's Health style

### 3. Test Bulk Operations
- Go to admin articles page
- Select multiple articles
- Test bulk delete functionality

### 4. Run Database Seed (Optional)
```bash
# On Vercel, this runs automatically
npx prisma db push
npx tsx scripts/seed.ts
```

---

## 🛠️ Build Configuration

Your `package.json` build script handles everything:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

Vercel will automatically:
- Install dependencies
- Generate Prisma client
- Build Next.js app
- Deploy to CDN

---

## 🔐 Security Notes

### Admin Access
- ✅ Only whitelisted emails can access admin
- ✅ Unauthorized attempts are logged
- ✅ Sessions are secure and database-backed

### API Keys
- ✅ All environment variables are encrypted on Vercel
- ✅ Never commit API keys to Git
- ✅ Rotate keys regularly

### Database
- ✅ Use connection pooling in production
- ✅ Enable row-level security if using Supabase
- ✅ Regular backups recommended

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor Core Web Vitals
- Track deployment status

### Error Tracking
- Check Vercel function logs
- Monitor Claude API usage
- Watch for failed authentications

---

## 🚨 Troubleshooting

### Common Issues

**"Cannot connect to database"**
```bash
# Check DATABASE_URL format
postgresql://user:pass@host:port/db?sslmode=require
```

**"Claude API failed"**
```bash
# Verify API key is correct
# Check Anthropic console for usage limits
# Ensure CLAUDE_API_KEY is set in Vercel
```

**"Admin access denied"**
```bash
# Verify email is in ADMIN_EMAIL_1/2/3
# Check exact email format (case sensitive)
# Ensure NEXTAUTH_SECRET is set
```

**"Build failed"**
```bash
# Check Vercel build logs
# Verify all required environment variables are set
# Ensure Prisma schema is valid
```

---

## 🎉 Features Deployed

### ✅ Completed
- **Admin Security**: Email whitelist protection
- **Claude AI**: Content enhancement with Men's Health style
- **Bulk Delete**: Mass article management
- **Rich Editor**: Tiptap with image/video support
- **SEO Optimization**: Meta tags, JSON-LD, sitemaps
- **Responsive Design**: Mobile-first approach

### 🔄 Ready to Use
- Article CRUD with MDX storage
- Keyword affiliate linking
- Ad management system
- Bulk content importer
- Dark mode toggle
- Infinite scroll homepage

---

Your Men's Health CMS is now production-ready with enterprise-grade security and AI-powered content enhancement! 🚀 