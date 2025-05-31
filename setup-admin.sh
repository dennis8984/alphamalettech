#!/bin/bash

echo "🚀 Setting up Admin System for Men's Health Clone"
echo "================================================="

# Step 1: Install required packages
echo "📦 Installing required packages..."
npm install next-auth @next-auth/prisma-adapter prisma @prisma/client @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-video bcryptjs @types/bcryptjs

if [ $? -ne 0 ]; then
    echo "❌ npm install failed. Trying with yarn..."
    yarn add next-auth @next-auth/prisma-adapter prisma @prisma/client @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-video bcryptjs @types/bcryptjs
fi

# Step 2: Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Step 3: Push database schema to Supabase
echo "🌐 Pushing database schema to Supabase..."
npx prisma db push

# Step 4: Success message
echo "✅ Admin system setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Add environment variables to Vercel dashboard"
echo "2. Deploy to Vercel"
echo "3. Access admin at https://your-domain.vercel.app/admin"
echo ""
echo "📖 For detailed instructions, see docs/admin-access.md" 