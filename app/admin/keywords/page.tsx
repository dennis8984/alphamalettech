'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Search, Edit, Trash2, Link as LinkIcon, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Mock data for keyword links
const mockKeywords = [
  {
    id: '1',
    keyword: 'protein powder',
    affiliateUrl: 'https://affiliate.example.com/protein-powder?ref=menshb',
    maxHitsPerPage: 3,
    status: 'active',
    totalHits: 1247,
    revenue: '$342.50',
    createdAt: '2024-01-15',
    category: 'Supplements'
  },
  {
    id: '2',
    keyword: 'workout equipment',
    affiliateUrl: 'https://amazon.com/workout-gear?tag=menshb-20',
    maxHitsPerPage: 2,
    status: 'active',
    totalHits: 892,
    revenue: '$156.80',
    createdAt: '2024-01-12',
    category: 'Fitness'
  },
  {
    id: '3',
    keyword: 'testosterone booster',
    affiliateUrl: 'https://affiliate.example.com/test-boost?ref=menshb',
    maxHitsPerPage: 1,
    status: 'paused',
    totalHits: 534,
    revenue: '$89.30',
    createdAt: '2024-01-10',
    category: 'Supplements'
  },
  {
    id: '4',
    keyword: 'meal prep containers',
    affiliateUrl: 'https://amazon.com/meal-prep?tag=menshb-20',
    maxHitsPerPage: 2,
    status: 'active',
    totalHits: 345,
    revenue: '$67.20',
    createdAt: '2024-01-08',
    category: 'Nutrition'
  },
]

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState(mockKeywords)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredKeywords = keywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
    keyword.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Supplements': 'bg-blue-500',
      'Fitness': 'bg-green-500',
      'Nutrition': 'bg-orange-500',
      'Health': 'bg-purple-500'
    }
    return (
      <Badge variant="outline" className={`${colors[category as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {category}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Manage Keywords</h1>
          <p className="text-muted-foreground">
            Set up affiliate links that automatically replace keywords in articles
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">How Keyword Linking Works</h3>
              <p className="text-sm text-blue-700">
                Keywords you add here will automatically be converted to affiliate links when they appear in your articles. 
                You can set a maximum number of links per page to avoid over-linking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Keyword
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keywords.length}</div>
            <p className="text-xs text-muted-foreground">4 active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,018</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$655.80</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Per Click</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.22</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Keywords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Links ({filteredKeywords.length})</CardTitle>
          <CardDescription>
            Manage all your affiliate keyword links and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Affiliate URL</TableHead>
                  <TableHead>Max Per Page</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Hits</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No keywords found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKeywords.map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">{keyword.keyword}</div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(keyword.category)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <span className="text-sm text-muted-foreground truncate">
                            {keyword.affiliateUrl}
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{keyword.maxHitsPerPage}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(keyword.status)}</TableCell>
                      <TableCell className="font-medium">{keyword.totalHits.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-green-600">{keyword.revenue}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 