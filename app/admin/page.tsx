'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Images, 
  Link2, 
  Upload,
  PlusCircle,
  BarChart3
} from 'lucide-react'
import { getCurrentUser, signOut } from '@/lib/supabase-auth'

// Admin email whitelist - only these emails can access admin
const ADMIN_EMAILS = [
  'admin@menshealth.com',
  'editor@menshealth.com',
  'menshb@hqoffshore.com', // Primary admin email
  'admin@menshb.com',
  // Add your admin emails here
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_3,
].filter(Boolean) as string[]

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const { user: currentUser, error } = await getCurrentUser()
      
      if (error || !currentUser) {
        console.log('No user found, redirecting to signin')
        router.push('/admin/auth/signin')
        return
      }

      // Check if user email is in admin whitelist
      const userEmail = currentUser.email?.toLowerCase()
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        console.log('User not authorized:', userEmail)
        router.push('/admin/auth/signin')
        return
      }

      setUser(currentUser)
      setIsAuthorized(true)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/auth/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/admin/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="bg-red-600 text-white px-2 py-1 mr-2">MEN'S</span>
                HUB Admin
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.user_metadata?.name || user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
              <Images className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                4 placements active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Keyword Links</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12 this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Articles Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/articles">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                  Create, edit, and manage your articles with our rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Manage Articles
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Ad Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/ads">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Images className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Ads</CardTitle>
                <CardDescription>
                  Manage ad placements, upload creatives, and track performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Manage Ads
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Keyword Links */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/keywords">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Link2 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Keyword Links</CardTitle>
                <CardDescription>
                  Set up affiliate links that automatically replace keywords in articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Manage Keywords
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Bulk Import */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/import">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>
                  Import multiple articles from ZIP files with HTML or Markdown content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Articles
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Marketing Tools Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketing Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Google Ads Campaign Generator */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200">
              <Link href="/admin/google-ads">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-red-600 font-bold text-sm">GA</div>
                  </div>
                  <CardTitle>Google Ads Campaigns</CardTitle>
                  <CardDescription>
                    Automatically generate Google Ads campaigns for your published articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Campaigns
                  </Button>
                </CardContent>
              </Link>
            </Card>

            {/* Facebook Ads (Coming Soon) */}
            <Card className="opacity-50">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600 font-bold text-sm">FB</div>
                </div>
                <CardTitle>Facebook Ads</CardTitle>
                <CardDescription>
                  Create Facebook ad campaigns for your content (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* Email Marketing */}
            <Card className="opacity-50">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-indigo-600 font-bold text-sm">📧</div>
                </div>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>
                  Send newsletter campaigns to your subscribers (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 