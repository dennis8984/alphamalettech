'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Search, Edit, Trash2, Link as LinkIcon, ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { 
  getKeywords, 
  getKeywordStats, 
  createKeyword, 
  updateKeyword, 
  deleteKeyword,
  type Keyword,
  type CreateKeywordData,
  type KeywordStats
} from '@/lib/supabase-keywords'

const categories = [
  'Supplements',
  'Fitness', 
  'Nutrition',
  'Health',
  'Style',
  'General'
]

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [stats, setStats] = useState<KeywordStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
  const [newKeyword, setNewKeyword] = useState<CreateKeywordData>({
    keyword: '',
    affiliate_url: '',
    category: 'General',
    max_hits_per_page: 3,
    weight: 100
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Load keywords and stats in parallel
    const [keywordsResult, statsResult] = await Promise.all([
      getKeywords(),
      getKeywordStats()
    ])
    
    if (keywordsResult.success && keywordsResult.keywords) {
      setKeywords(keywordsResult.keywords)
    } else {
      console.error('Failed to load keywords:', keywordsResult.error)
    }
    
    if (statsResult.success && statsResult.stats) {
      setStats(statsResult.stats)
    } else {
      console.error('Failed to load stats:', statsResult.error)
    }
    
    setLoading(false)
  }

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
      'Health': 'bg-purple-500',
      'Style': 'bg-pink-500',
      'General': 'bg-gray-500'
    }
    return (
      <Badge variant="outline" className={`${colors[category as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {category}
      </Badge>
    )
  }

  const handleAddKeyword = async () => {
    if (!newKeyword.keyword || !newKeyword.affiliate_url) {
      alert('Please fill in all required fields')
      return
    }

    const result = await createKeyword(newKeyword)
    
    if (result.success && result.keyword) {
      setKeywords(prev => [result.keyword!, ...prev])
      setNewKeyword({
        keyword: '',
        affiliate_url: '',
        category: 'General',
        max_hits_per_page: 3,
        weight: 100
      })
      setShowAddDialog(false)
      loadData() // Refresh stats
    } else {
      alert(`Failed to create keyword: ${result.error}`)
    }
  }

  const handleEditKeyword = async () => {
    if (!editingKeyword) return

    const result = await updateKeyword(editingKeyword.id, {
      keyword: editingKeyword.keyword,
      affiliate_url: editingKeyword.affiliate_url,
      category: editingKeyword.category,
      max_hits_per_page: editingKeyword.max_hits_per_page,
      weight: editingKeyword.weight,
      status: editingKeyword.status
    })
    
    if (result.success && result.keyword) {
      setKeywords(prev => prev.map(k => k.id === editingKeyword.id ? result.keyword! : k))
      setEditingKeyword(null)
      setShowEditDialog(false)
      loadData() // Refresh stats
    } else {
      alert(`Failed to update keyword: ${result.error}`)
    }
  }

  const handleDeleteKeyword = async (id: string, keyword: string) => {
    if (!confirm(`Are you sure you want to delete "${keyword}"? This will also delete all click tracking data.`)) {
      return
    }

    const result = await deleteKeyword(id)
    
    if (result.success) {
      setKeywords(prev => prev.filter(k => k.id !== id))
      loadData() // Refresh stats
    } else {
      alert(`Failed to delete keyword: ${result.error}`)
    }
  }

  const openEditDialog = (keyword: Keyword) => {
    setEditingKeyword({ ...keyword })
    setShowEditDialog(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading keywords...</p>
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Keyword
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Keyword</DialogTitle>
                  <DialogDescription>
                    Create a new affiliate keyword link that will be automatically inserted into articles.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="keyword">Keyword *</Label>
                    <Input
                      id="keyword"
                      placeholder="e.g., protein powder"
                      value={newKeyword.keyword}
                      onChange={(e) => setNewKeyword(prev => ({ ...prev, keyword: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Affiliate URL *</Label>
                    <Input
                      id="url"
                      placeholder="https://affiliate.example.com/product?ref=your-id"
                      value={newKeyword.affiliate_url}
                      onChange={(e) => setNewKeyword(prev => ({ ...prev, affiliate_url: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newKeyword.category} onValueChange={(value) => setNewKeyword(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="maxHits">Max Per Page</Label>
                      <Input
                        id="maxHits"
                        type="number"
                        min="1"
                        max="10"
                        value={newKeyword.max_hits_per_page}
                        onChange={(e) => setNewKeyword(prev => ({ ...prev, max_hits_per_page: parseInt(e.target.value) || 3 }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight (Priority)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="1"
                      max="100"
                      value={newKeyword.weight}
                      onChange={(e) => setNewKeyword(prev => ({ ...prev, weight: parseInt(e.target.value) || 100 }))}
                    />
                    <p className="text-xs text-muted-foreground">Higher weight = higher priority (1-100)</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddKeyword}>Add Keyword</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <div className="text-2xl font-bold">{stats?.total_keywords || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.active_keywords || 0} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_clicks?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">All time clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Total affiliate revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Per Click</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avg_ctr?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Revenue per click</p>
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
                      {searchQuery ? 'No keywords found matching your search' : 'No keywords found. Add your first keyword!'}
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
                            {keyword.affiliate_url}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(keyword.affiliate_url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{keyword.max_hits_per_page}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(keyword.status)}</TableCell>
                      <TableCell className="font-medium">{keyword.total_hits.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-green-600">${keyword.revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(keyword)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDeleteKeyword(keyword.id, keyword.keyword)}
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Keyword</DialogTitle>
            <DialogDescription>
              Update the keyword and its affiliate link settings.
            </DialogDescription>
          </DialogHeader>
          {editingKeyword && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-keyword">Keyword *</Label>
                <Input
                  id="edit-keyword"
                  value={editingKeyword.keyword}
                  onChange={(e) => setEditingKeyword(prev => prev ? ({ ...prev, keyword: e.target.value }) : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-url">Affiliate URL *</Label>
                <Input
                  id="edit-url"
                  value={editingKeyword.affiliate_url}
                  onChange={(e) => setEditingKeyword(prev => prev ? ({ ...prev, affiliate_url: e.target.value }) : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingKeyword.category} 
                    onValueChange={(value) => setEditingKeyword(prev => prev ? ({ ...prev, category: value }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingKeyword.status} 
                    onValueChange={(value: 'active' | 'paused' | 'expired') => setEditingKeyword(prev => prev ? ({ ...prev, status: value }) : null)}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxHits">Max Per Page</Label>
                  <Input
                    id="edit-maxHits"
                    type="number"
                    min="1"
                    max="10"
                    value={editingKeyword.max_hits_per_page}
                    onChange={(e) => setEditingKeyword(prev => prev ? ({ ...prev, max_hits_per_page: parseInt(e.target.value) || 3 }) : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-weight">Weight</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    min="1"
                    max="100"
                    value={editingKeyword.weight}
                    onChange={(e) => setEditingKeyword(prev => prev ? ({ ...prev, weight: parseInt(e.target.value) || 100 }) : null)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Performance</Label>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Total Hits: {editingKeyword.total_hits.toLocaleString()}</span>
                  <span>Revenue: ${editingKeyword.revenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditKeyword}>Update Keyword</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 