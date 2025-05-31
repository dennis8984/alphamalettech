'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Upload } from 'lucide-react'
import Link from 'next/link'

// Mock data for ads
const mockAds = [
  {
    id: '1',
    name: 'Protein Powder Banner',
    placement: 'header',
    size: '728x90',
    status: 'active',
    clicks: 1543,
    impressions: 45670,
    ctr: 3.4,
    targetUrl: 'https://example.com/protein',
    weight: 100,
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'Fitness App Sidebar',
    placement: 'sidebar',
    size: '300x250',
    status: 'active',
    clicks: 892,
    impressions: 23450,
    ctr: 3.8,
    targetUrl: 'https://example.com/fitness-app',
    weight: 80,
    createdAt: '2024-01-08'
  },
  {
    id: '3',
    name: 'Supplement Footer',
    placement: 'footer',
    size: '320x50',
    status: 'paused',
    clicks: 234,
    impressions: 12890,
    ctr: 1.8,
    targetUrl: 'https://example.com/supplements',
    weight: 60,
    createdAt: '2024-01-05'
  },
]

export default function AdsPage() {
  const [ads, setAds] = useState(mockAds)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAds = ads.filter(ad =>
    ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ad.placement.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getPlacementBadge = (placement: string) => {
    const colors = {
      header: 'bg-blue-500',
      sidebar: 'bg-purple-500',
      inline: 'bg-orange-500',
      footer: 'bg-gray-500'
    }
    return (
      <Badge variant="outline" className={`${colors[placement as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {placement.charAt(0).toUpperCase() + placement.slice(1)}
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
          <h1 className="text-3xl font-bold">Manage Ads</h1>
          <p className="text-muted-foreground">
            Manage ad placements, upload creatives, and track performance
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search ads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Creative
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Ad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82,010</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,669</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.25%</div>
            <p className="text-xs text-muted-foreground">+0.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Ads ({filteredAds.length})</CardTitle>
          <CardDescription>
            Manage all your ad placements and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No ads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{ad.name}</div>
                          <div className="text-sm text-muted-foreground">{ad.targetUrl}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlacementBadge(ad.placement)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ad.size}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(ad.status)}</TableCell>
                      <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                      <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${ad.ctr >= 3 ? 'text-green-600' : ad.ctr >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {ad.ctr}%
                        </span>
                      </TableCell>
                      <TableCell>{ad.weight}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
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