# 🏗️ Men's Hub - Complete Architecture Reference

## 📌 **PIN THIS DOCUMENT** - Complete System Architecture

> **IMPORTANT:** This document defines the COMPLETE architecture. Refer to this to avoid confusion between Prisma and Supabase.

---

## 🗄️ **DATABASE ARCHITECTURE**

### **PRIMARY DATABASE: Supabase PostgreSQL**
**ALL data is stored in Supabase. NO Prisma for data storage.**

```
┌─────────────────────────────────────────────────┐
│                 SUPABASE DATABASE               │
├─────────────────────────────────────────────────┤
│ 📄 articles         - All article content      │
│ 📧 newsletter_subs   - Email subscribers       │
│ 💬 comments         - Article comments         │
│ 🔗 keywords         - Affiliate link keywords  │
│ 📊 keyword_clicks   - Click tracking data     │
│ ⚙️  site_settings   - App configuration       │
└─────────────────────────────────────────────────┘
```

### **Supabase Tables Structure**
```sql
-- Articles (Main content)
articles {
  id: UUID,
  title: TEXT,
  slug: TEXT UNIQUE,
  content: TEXT,
  excerpt: TEXT,
  category: TEXT,
  status: 'draft' | 'published',
  featured_image: TEXT,
  tags: TEXT[],
  author: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP,
  published_at: TIMESTAMP
}

-- Newsletter Subscribers
newsletter_subscribers {
  id: UUID,
  name: TEXT,
  email: TEXT UNIQUE,
  subscribed_at: TIMESTAMP,
  is_active: BOOLEAN
}

-- Comments System
comments {
  id: UUID,
  article_id: TEXT,
  user_id: UUID,
  user_email: TEXT,
  user_name: TEXT,
  content: TEXT,
  created_at: TIMESTAMP
}

-- Affiliate Keywords
keywords {
  id: UUID,
  keyword: TEXT,
  affiliate_url: TEXT,
  category: TEXT,
  max_hits_per_page: INTEGER,
  status: TEXT,
  weight: INTEGER,
  total_hits: INTEGER,
  revenue: DECIMAL
}
```

---

## 🔐 **AUTHENTICATION ARCHITECTURE**

### **PRIMARY AUTH: Supabase Auth**
**NO NextAuth.js. Everything uses Supabase.**

```
┌─────────────────────────────────────────────────┐
│                SUPABASE AUTH                    │
├─────────────────────────────────────────────────┤
│ 🔑 Magic Link Email Authentication              │
│ 👥 User Management                              │
│ 🛡️  Row Level Security (RLS)                   │
│ 📧 Email Verification                           │
└─────────────────────────────────────────────────┘
```

### **Admin Access Control**
```typescript
// Admin Email Whitelist (in code)
ADMIN_EMAILS = [
  'admin@menshealth.com',
  'editor@menshealth.com', 
  'menshb@hqoffshore.com',
  'admin@menshb.com'
]

// RLS Policy (in Supabase)
CREATE POLICY "admin_access" ON articles
FOR ALL USING (
  auth.jwt() ->> 'email' IN (
    'menshb@hqoffshore.com',
    'admin@menshb.com'
  )
);
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Deployment Flow**
```
Local Development
       ↓
   Git Commit
       ↓
   Push to GitHub
       ↓
Vercel Auto-Deploy (Production)
       ↓
Live Site: www.menshb.com
```

### **Environment Variables (Vercel)**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vopntrgtkefstqbzsmot.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Email Control
ADMIN_EMAIL_1=menshb@hqoffshore.com
ADMIN_EMAIL_2=admin@menshb.com

# Optional Integrations
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLAUDE_API_KEY=your-claude-key
```

---

## 🏗️ **APPLICATION ARCHITECTURE**

### **Frontend Framework**
```
Next.js 13 (App Router) + TypeScript
├── app/
│   ├── page.tsx                 # Homepage
│   ├── articles/[slug]/         # Article pages & categories
│   ├── admin/                   # Admin dashboard
│   └── api/                     # API routes
├── components/
│   ├── articles/                # Article components
│   ├── ui/                      # UI components
│   └── layout/                  # Layout components
└── lib/
    ├── supabase-client.ts       # Supabase connection
    ├── articles-db.ts           # Article database functions
    ├── supabase-auth.ts         # Authentication functions
    └── data.ts                  # Data fetching & caching
```

### **Data Flow Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   SUPABASE      │    │   VERCEL        │
│   (Next.js)     │◄──►│   (Database)    │    │   (Hosting)     │
│                 │    │                 │    │                 │
│ • React Pages   │    │ • Articles      │    │ • Auto Deploy  │
│ • Components    │    │ • Auth Users    │    │ • Env Variables │
│ • API Routes    │    │ • Newsletter    │    │ • Edge Compute  │
│ • Admin Panel   │    │ • Comments      │    │ • Global CDN    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📱 **FEATURES ARCHITECTURE**

### **Core Features**
```
🏠 PUBLIC WEBSITE
├── Homepage with featured articles
├── Category pages (nutrition, fitness, health, etc.)
├── Individual article pages
├── Search functionality
├── Newsletter subscription
└── Comment system

🔧 ADMIN DASHBOARD (/admin)
├── Articles CRUD (Create, Read, Update, Delete)
├── Bulk CSV/HTML import system
├── Keyword management (affiliate links)
├── Ad management system
├── Newsletter subscriber management
└── Site settings

📊 CONTENT MANAGEMENT
├── Rich text editor (Tiptap)
├── Image upload (Cloudinary)
├── SEO optimization
├── Auto-generated slugs
└── Content enhancement (Claude AI)
```

### **API Routes Structure**
```
/api/
├── admin/
│   ├── articles/           # Article CRUD
│   ├── import/            # Bulk import system
│   ├── keywords/          # Affiliate keywords
│   └── ads/               # Ad management
├── newsletter/            # Newsletter subscription
├── comments/              # Comment system
├── search/                # Article search
└── debug/                 # Development debugging
```

---

## 🔄 **DATA ACCESS PATTERNS**

### **Frontend Data Access**
```typescript
// ✅ CORRECT: Use Supabase client
import { supabase } from '@/lib/supabase-client'

// Articles
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')

// Newsletter
const { error } = await supabase
  .from('newsletter_subscribers')
  .insert([{ name, email }])
```

### **Admin Data Access**
```typescript
// ✅ CORRECT: Use articles-db.ts functions
import { getAllArticles, createArticle } from '@/lib/articles-db'

// Get articles
const { data, error } = await getAllArticles()

// Create article
const { data, error } = await createArticle(articleData)
```

### **❌ NEVER USE PRISMA FOR DATA**
```typescript
// ❌ WRONG: Don't use Prisma for articles
import { prisma } from '@/lib/prisma'  // DON'T USE THIS

// ❌ This is WRONG:
const articles = await prisma.article.findMany()  // DON'T DO THIS
```

---

## 🛠️ **DEVELOPMENT WORKFLOW**

### **Local Development**
```bash
# 1. Clone repository
git clone <repo-url>
cd alphamalettech

# 2. Install dependencies  
npm install

# 3. Set up environment
cp .env.example .env.local
# Add Supabase credentials

# 4. Run development server
npm run dev
```

### **Database Setup**
```bash
# 1. Go to Supabase Dashboard
# 2. Open SQL Editor
# 3. Run: docs/supabase-articles-table.sql
# 4. Run: docs/supabase-setup.sql
```

### **Deployment**
```bash
# 1. Commit changes
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys
# ✅ Live at: https://www.menshb.com
```

---

## 🔍 **TROUBLESHOOTING REFERENCE**

### **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| Articles not showing | Missing articles table | Run `supabase-articles-table.sql` |
| Import failing | Wrong database method | Use Supabase, not Prisma |
| Auth not working | Wrong provider | Use Supabase Auth, not NextAuth |
| 404 on magic links | Wrong callback URL | Check `/auth/callback` exists |
| Admin access denied | Email not whitelisted | Add email to `ADMIN_EMAILS` |

### **Debug Commands**
```bash
# Check articles in database
curl https://www.menshb.com/api/debug/articles

# Refresh article cache
curl -X POST https://www.menshb.com/api/debug/refresh-cache

# Check deployment status
vercel --prod
```

---

## 📋 **ARCHITECTURE CHECKLIST**

### **✅ CONFIRMED ARCHITECTURE**
- [x] **Database:** Supabase PostgreSQL (NOT Prisma)
- [x] **Authentication:** Supabase Auth (NOT NextAuth.js)
- [x] **Deployment:** GitHub → Vercel (Automatic)
- [x] **Frontend:** Next.js 13 + TypeScript
- [x] **Articles:** Stored in Supabase `articles` table
- [x] **Newsletter:** Stored in Supabase `newsletter_subscribers` table
- [x] **Comments:** Stored in Supabase `comments` table
- [x] **Admin:** Protected by Supabase Auth + email whitelist

### **❌ NOT USED IN THIS PROJECT**
- [ ] ~~Prisma for data storage~~ (Only for schema reference)
- [ ] ~~NextAuth.js~~ (Replaced with Supabase Auth)
- [ ] ~~External database~~ (Everything in Supabase)
- [ ] ~~Manual deployment~~ (Auto-deploy via GitHub)

---

## 🎯 **KEY REMINDERS**

1. **ALL DATA → SUPABASE** (articles, newsletter, comments, keywords)
2. **ALL AUTH → SUPABASE** (magic links, user management, RLS)
3. **ALL DEPLOY → GITHUB PUSH** (auto-deploys to Vercel)
4. **ADMIN ACCESS → EMAIL WHITELIST** (hardcoded in multiple places)
5. **NO PRISMA FOR DATA** (only for schema reference if needed)

---

**🔗 Live URLs:**
- **Public Site:** https://www.menshb.com
- **Admin Dashboard:** https://www.menshb.com/admin
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard 