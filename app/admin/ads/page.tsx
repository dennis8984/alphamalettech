'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Upload, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getAllAds, deleteAd, type Ad } from '@/lib/ads-db'

export default function AdsPage() {
  const router = useRouter()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [popunderEnabled, setPopunderEnabled] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Load ads and popunder settings
  useEffect(() => {
    const loadData = async () => {
      console.log('📊 Loading ads and settings...')
      
      // Load ads
      const { data, error } = await getAllAds()
      
      if (error) {
        console.error('❌ Failed to load ads:', error)
        alert(`Failed to load ads: ${error}`)
        return
      }
      
      if (data) {
        setAds(data)
        console.log('✅ Ads loaded:', data.length)
      }

      // Load popunder settings
      try {
        const response = await fetch('/api/admin/popunder-settings/simple')
        if (response.ok) {
          const settingsData = await response.json()
          setPopunderEnabled(settingsData.enabled || false)
          console.log('✅ Popunder settings loaded:', settingsData.enabled)
        }
      } catch (error) {
        console.error('❌ Failed to load popunder settings:', error)
      }
      
      setLoading(false)
    }

    loadData()
  }, [])

  // Handle popunder toggle
  const handlePopunderToggle = async (enabled: boolean) => {
    setSavingSettings(true)
    
    try {
      const response = await fetch('/api/admin/popunder-settings/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        const result = await response.json()
        setPopunderEnabled(enabled)
        console.log('✅ Popunder settings saved:', result)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('❌ Failed to save popunder settings:', error)
      alert(`Failed to save popunder settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setSavingSettings(false)
  }

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
      'mid-article': 'bg-orange-500',
      footer: 'bg-gray-500',
      'mobile-leaderboard': 'bg-indigo-500',
      'bottom-banner': 'bg-pink-500',
      'pop-under': 'bg-red-500'
    }
    return (
      <Badge variant="outline" className={`${colors[placement as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {placement === 'pop-under' ? 'Pop-Under' : placement.charAt(0).toUpperCase() + placement.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  const handleViewAd = (ad: Ad) => {
    // Open ad target URL in new tab
    if (ad.target_url) {
      window.open(ad.target_url, '_blank')
    }
  }

  const handleEditAd = (adId: string) => {
    router.push(`/admin/ads/edit/${adId}`)
  }

  const handleDeleteAd = async (adId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      console.log('🗑️ Deleting ad:', adId)
      
      const { success, error } = await deleteAd(adId)
      
      if (error) {
        console.error('❌ Delete failed:', error)
        alert(`Failed to delete ad: ${error}`)
        return
      }
      
      if (success) {
        // Remove from local state
        setAds(prev => prev.filter(ad => ad.id !== adId))
        console.log('✅ Ad deleted successfully')
        alert('Ad deleted successfully!')
      }
    }
  }

  const handleNewAd = () => {
    router.push('/admin/ads/new')
  }

  const handleUploadCreative = () => {
    // Future: Implement bulk creative upload
    alert('Bulk creative upload feature coming soon!')
  }

  // Calculate totals for performance overview
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0)
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0)
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading ads...</p>
          </div>
        </div>
      </div>
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

      {/* Popunder Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Popunder Ad Settings
          </CardTitle>
          <CardDescription>
            Control when popunder ads are displayed to visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Enable Popunder Ads</h4>
              <p className="text-sm text-muted-foreground">
                {popunderEnabled 
                  ? "Popunder ads are currently enabled and will show to visitors" 
                  : "Popunder ads are currently disabled"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {savingSettings && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              )}
              <Switch
                checked={popunderEnabled}
                onCheckedChange={handlePopunderToggle}
                disabled={savingSettings}
              />
            </div>
          </div>
          {popunderEnabled && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Popunder ads are active. They will display based on the settings configured in your popunder ad campaigns.
              </p>
            </div>
          )}
          {!popunderEnabled && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                🚫 Popunder ads are disabled. No popunder ads will show regardless of campaign settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Button variant="outline" onClick={handleUploadCreative}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Creative
              </Button>
              <Button onClick={handleNewAd}>
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
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCTR.toFixed(2)}%</div>
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
                      {searchQuery ? 'No ads found matching your search' : 'No ads found. Create your first ad!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{ad.name}</div>
                          <div className="text-sm text-muted-foreground">{ad.target_url}</div>
                          {ad.placement === 'pop-under' && ad.popunder_settings && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <div>Triggers after {ad.popunder_settings.trigger_after_views} page views</div>
                              <div>Shows every {ad.popunder_settings.frequency_days} days</div>
                              {ad.popunder_settings.delay_seconds > 0 && (
                                <div>Delay: {ad.popunder_settings.delay_seconds}s</div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPlacementBadge(ad.placement)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ad.placement === 'pop-under' ? 'Fullscreen' : ad.size}
                        </Badge>
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewAd(ad)}
                            title="Visit ad URL"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditAd(ad.id!)}
                            title="Edit ad"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAd(ad.id!, ad.name)}
                            title="Delete ad"
                          >
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