'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Upload, Image, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getAd, updateAd, type Ad } from '@/lib/ads-db'

const adSizes = [
  { value: '320x50', label: '320 × 50 - Mobile Leaderboard' },
  { value: '320x100', label: '320 × 100 - Large Mobile Leaderboard' },
  { value: '300x250', label: '300 × 250 - Medium Rectangle' },
  { value: '300x50', label: '300 × 50 - Small Mobile Banner' },
  { value: '336x280', label: '336 × 280 - Large Rectangle' },
]

const placements = [
  { value: 'header', label: 'Header', description: 'Top of page, high visibility' },
  { value: 'mobile-leaderboard', label: 'Mobile Leaderboard', description: 'Below header, mobile optimized' },
  { value: 'mid-article', label: 'Mid-Article', description: 'Within article content' },
  { value: 'sidebar', label: 'Sidebar', description: 'Side of content (desktop)' },
  { value: 'bottom-banner', label: 'Bottom Banner', description: 'Bottom of article' },
  { value: 'footer', label: 'Footer', description: 'Page footer' },
]

export default function EditAdPage() {
  const params = useParams()
  const router = useRouter()
  const adId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [ad, setAd] = useState<Omit<Ad, 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'ctr'>>({
    id: '',
    name: '',
    placement: 'header',
    size: '',
    status: 'active',
    target_url: '',
    image_url: '',
    weight: 100
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Load ad data
  useEffect(() => {
    const loadAd = async () => {
      if (!adId) return
      
      console.log('📊 Loading ad for editing:', adId)
      
      const { data, error } = await getAd(adId)
      
      if (error) {
        console.error('❌ Failed to load ad:', error)
        setNotFound(true)
        setLoading(false)
        return
      }
      
      if (data) {
        setAd({
          id: data.id,
          name: data.name,
          placement: data.placement,
          size: data.size,
          status: data.status,
          target_url: data.target_url,
          image_url: data.image_url || '',
          weight: data.weight
        })
        console.log('✅ Ad loaded for editing')
      } else {
        setNotFound(true)
      }
      
      setLoading(false)
    }

    loadAd()
  }, [adId])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Validate required fields
      if (!ad.name.trim()) {
        alert('Please enter an ad name')
        return
      }
      
      if (!ad.placement) {
        alert('Please select a placement')
        return
      }
      
      if (!ad.size) {
        alert('Please select an ad size')
        return
      }
      
      if (!ad.target_url.trim()) {
        alert('Please enter a target URL')
        return
      }

      console.log('📊 Updating ad...', ad.name)
      
      const { data, error } = await updateAd(adId, ad)

      if (error) {
        console.error('❌ Update failed:', error)
        alert(`Failed to update ad: ${error}`)
        return
      }

      console.log('✅ Ad updated successfully!')
      alert('Ad updated successfully!')
      
      // Redirect to ads list
      router.push('/admin/ads')
      
    } catch (err) {
      console.error('💥 Unexpected update error:', err)
      alert('An unexpected error occurred while updating the ad')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      console.log('📸 Uploading ad creative...', file.name)
      
      // For now, create a mock URL - replace with actual Supabase upload
      const mockUrl = URL.createObjectURL(file)
      
      setAd(prev => ({ ...prev, image_url: mockUrl }))
      console.log('✅ Image uploaded successfully!')
      
      alert('Image uploaded successfully! (Using mock URL for demo)')

    } catch (err) {
      console.error('💥 Upload error:', err)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading ad...</p>
          </div>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/ads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ads
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ad Not Found</h2>
              <p className="text-gray-600 mb-4">The ad you're looking for doesn't exist or has been deleted.</p>
              <Link href="/admin/ads">
                <Button>Return to Ads</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/ads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ads
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Ad</h1>
            <p className="text-muted-foreground">
              Update ad settings and performance
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Updating...' : 'Update Ad'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ad Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Ad Name *</Label>
                <Input
                  id="name"
                  value={ad.name}
                  onChange={(e) => setAd(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Protein Powder Banner"
                />
              </div>
              
              <div>
                <Label htmlFor="target_url">Target URL *</Label>
                <Input
                  id="target_url"
                  value={ad.target_url}
                  onChange={(e) => setAd(prev => ({ ...prev, target_url: e.target.value }))}
                  placeholder="https://example.com/product"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placement">Placement *</Label>
                  <Select 
                    value={ad.placement} 
                    onValueChange={(value: Ad['placement']) => setAd(prev => ({ ...prev, placement: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {placements.map((placement) => (
                        <SelectItem key={placement.value} value={placement.value}>
                          <div>
                            <div className="font-medium">{placement.label}</div>
                            <div className="text-xs text-muted-foreground">{placement.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size">Ad Size *</Label>
                  <Select value={ad.size} onValueChange={(value) => setAd(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {adSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (Priority)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="1"
                    max="100"
                    value={ad.weight}
                    onChange={(e) => setAd(prev => ({ ...prev, weight: parseInt(e.target.value) || 100 }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher weight = higher priority (1-100)
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={ad.status} 
                    onValueChange={(value: Ad['status']) => setAd(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ad Creative */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Creative</CardTitle>
            </CardHeader>
            <CardContent>
              {ad.image_url ? (
                <div className="space-y-2">
                  <img src={ad.image_url} alt="Ad Creative" className="w-full rounded-lg border" />
                  <Button variant="outline" size="sm" className="w-full" onClick={handleImageUpload}>
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">No creative uploaded</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleImageUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Creative'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Stats */}
          {ad.id && (
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Impressions:</span>
                  <span className="font-medium">45,670</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Clicks:</span>
                  <span className="font-medium">1,543</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CTR:</span>
                  <span className="font-medium text-green-600">3.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Weight:</span>
                  <span className="font-medium">{ad.weight}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {ad.size && (
            <Card>
              <CardHeader>
                <CardTitle>Size Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div 
                    className="border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mx-auto"
                    style={{
                      width: `${parseInt(ad.size.split('x')[0])}px`,
                      height: `${parseInt(ad.size.split('x')[1])}px`,
                      maxWidth: '100%'
                    }}
                  >
                    <span className="text-sm text-gray-500">{ad.size}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Actual size preview
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 