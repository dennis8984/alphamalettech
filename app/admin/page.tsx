'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session.status === 'loading') return // Still loading
    if (!session.data) {
      router.push('/admin/auth/signin')
      return
    }
  }, [session, router])

  if (session.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session.data) {
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
                HEALTH Admin
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {session.data.user?.name || session.data.user?.email}
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
                onClick={() => router.push('/api/auth/signout')}
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
      </main>
    </div>
  )
} 