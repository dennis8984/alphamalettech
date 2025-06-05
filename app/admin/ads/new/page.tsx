'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Upload, Image } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createAd, type Ad } from '@/lib/ads-db'

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

export default function NewAdPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [ad, setAd] = useState<Omit<Ad, 'id' | 'created_at' | 'updated_at' | 'impressions' | 'clicks' | 'ctr'>>({
    name: '',
    placement: 'header',
    size: '',
    status: 'active',
    target_url: '',
    image_url: '',
    weight: 100,
    // Pop-under specific settings
    popunder_settings: {
      trigger_after_views: 3,
      frequency_days: 7,
      user_interaction_required: false,
      delay_seconds: 2
    }
  })

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

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

      console.log('📊 Creating new ad...', ad.name)
      
      const adData = {
        name: ad.name,
        placement: ad.placement as Ad['placement'],
        size: ad.placement === 'pop-under' ? 'fullscreen' : ad.size,
        target_url: ad.target_url,
        image_url: ad.image_url || undefined,
        weight: ad.weight,
        status: ad.status,
        ...(ad.placement === 'pop-under' && {
          popunder_settings: ad.popunder_settings
        })
      }
      
      const { data, error } = await createAd(adData)

      if (error) {
        console.error('❌ Create failed:', error)
        alert(`Failed to create ad: ${error}`)
        return
      }

      console.log('✅ Ad created successfully!')
      alert('Ad created successfully!')
      
      // Redirect to ads list
      router.push('/admin/ads')
      
    } catch (err) {
      console.error('💥 Unexpected create error:', err)
      alert('An unexpected error occurred while creating the ad')
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

  const handlePopunderSettingChange = (field: string, value: any) => {
    setAd(prev => ({
      ...prev,
      popunder_settings: {
        trigger_after_views: prev.popunder_settings?.trigger_after_views || 3,
        frequency_days: prev.popunder_settings?.frequency_days || 7,
        user_interaction_required: prev.popunder_settings?.user_interaction_required || false,
        delay_seconds: prev.popunder_settings?.delay_seconds || 2,
        [field]: value
      }
    }))
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
            <h1 className="text-3xl font-bold">Create New Ad</h1>
            <p className="text-muted-foreground">
              Add a new ad placement to your website
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Creating...' : 'Create Ad'}
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

          {/* Ad Size Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Mobile Ad Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">320×50</span>
                  <span className="text-muted-foreground">Mobile Banner</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">320×100</span>
                  <span className="text-muted-foreground">Large Banner</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">300×250</span>
                  <span className="text-muted-foreground">Medium Rectangle</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Sizes optimized for mobile viewing and high CTR performance.
              </p>
            </CardContent>
          </Card>

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