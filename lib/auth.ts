import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Admin email whitelist - only these emails can access admin
const ADMIN_EMAILS = [
  'admin@menshealth.com',
  'editor@menshealth.com',
  'admin@menshb.com',
  'dennis8984@gmail.com', // GitHub username suggests this might be your email
  'dennis.8984@gmail.com',
  'admin@alphamalettech.com',
  // Add your admin emails here
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2,
  process.env.ADMIN_EMAIL_3,
].filter(Boolean) as string[]

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/admin/auth/signin',
    error: '/admin/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile, email }) {
      const userEmail = user.email?.toLowerCase()
      
      // Check if user email is in admin whitelist
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        console.log(`🚨 Unauthorized admin access attempt: ${userEmail}`)
        return false // Deny access
      }
      
      // Update user role to admin if they're in whitelist
      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        try {
          await prisma.user.upsert({
            where: { email: userEmail },
            update: { role: 'admin' },
            create: {
              email: userEmail,
              name: user.name || 'Admin User',
              role: 'admin'
            }
          })
        } catch (error) {
          console.error('Error updating user role:', error)
        }
      }
      
      return true
    },
    async session({ session, user }: { session: any; user: any }) {
      if (session.user) {
        session.user.id = user.id
        // Add role to session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })
        session.user.role = dbUser?.role || 'user'
      }
      return session
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
} 