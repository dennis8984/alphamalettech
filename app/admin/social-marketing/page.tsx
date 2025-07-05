'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  BarChart3, 
  Settings, 
  RefreshCw,
  Share2,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SocialMediaSetupWizard from '@/components/social-marketing/setup-wizard'

interface SocialPost {
  id: string
  article_id: string
  platform: string
  content: string
  status: string
  posted_at: string
  post_url: string
  short_url: string
  error_message?: string
  article?: {
    title: string
    category: string
  }
  engagement?: {
    likes: number
    shares: number
    comments: number
    views: number
  }
  clicks?: number
}

interface PlatformStats {
  platform: string
  total_posts: number
  successful_posts: number
  failed_posts: number
  total_clicks: number
  total_engagement: number
  avg_ctr: number
}

interface QueueStatus {
  isProcessing: boolean
  pending: number
  processing: number
  completed: number
  failed: number
}

export default function SocialMarketingPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([])
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [detectorStatus, setDetectorStatus] = useState<any>(null)
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false)

  useEffect(() => {
    loadData()
    checkAutomationStatus()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadSocialPosts(),
        loadPlatformStats(),
        loadQueueStatus()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load social marketing data')
    } finally {
      setLoading(false)
    }
  }

  const loadSocialPosts = async () => {
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        article:articles(title, category),
        engagement:social_engagement(*),
        clicks:social_clicks(count)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setPosts(data.map(post => ({
        ...post,
        clicks: post.clicks?.[0]?.count || 0
      })))
    }
  }

  const loadPlatformStats = async () => {
    // This would be replaced with actual analytics API call
    const stats: PlatformStats[] = [
      {
        platform: 'facebook',
        total_posts: 45,
        successful_posts: 42,
        failed_posts: 3,
        total_clicks: 1230,
        total_engagement: 3450,
        avg_ctr: 2.8
      },
      {
        platform: 'twitter',
        total_posts: 68,
        successful_posts: 65,
        failed_posts: 3,
        total_clicks: 890,
        total_engagement: 2100,
        avg_ctr: 1.9
      },
      {
        platform: 'reddit',
        total_posts: 32,
        successful_posts: 30,
        failed_posts: 2,
        total_clicks: 2100,
        total_engagement: 5600,
        avg_ctr: 4.2
      },
      {
        platform: 'instagram',
        total_posts: 28,
        successful_posts: 26,
        failed_posts: 2,
        total_clicks: 450,
        total_engagement: 8900,
        avg_ctr: 1.2
      }
    ]
    setPlatformStats(stats)
  }

  const loadQueueStatus = async () => {
    try {
      const response = await fetch('/api/admin/social-marketing/queue-status')
      if (response.ok) {
        const status = await response.json()
        setQueueStatus(status)
      }
    } catch (error) {
      console.error('Error loading queue status:', error)
    }
  }

  const checkAutomationStatus = async () => {
    try {
      const response = await fetch('/api/admin/social-marketing/detector-status')
      if (response.ok) {
        const status = await response.json()
        setDetectorStatus(status)
        setIsAutomationEnabled(status.isRunning)
      }
    } catch (error) {
      console.error('Error checking automation status:', error)
    }
  }

  const toggleAutomation = async () => {
    try {
      const action = isAutomationEnabled ? 'stop' : 'start'
      const response = await fetch('/api/admin/social-marketing/detector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        setIsAutomationEnabled(!isAutomationEnabled)
        toast.success(`Automation ${action}ed successfully`)
        checkAutomationStatus()
      } else {
        throw new Error('Failed to toggle automation')
      }
    } catch (error) {
      toast.error('Failed to toggle automation')
    }
  }

  const retryPost = async (postId: string) => {
    try {
      const response = await fetch('/api/admin/social-marketing/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      })

      if (response.ok) {
        toast.success('Post queued for retry')
        loadData()
      } else {
        throw new Error('Failed to retry post')
      }
    } catch (error) {
      toast.error('Failed to retry post')
    }
  }

  const syncEngagement = async (postId: string) => {
    try {
      const response = await fetch('/api/admin/social-marketing/sync-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId })
      })

      if (response.ok) {
        toast.success('Engagement metrics updated')
        loadSocialPosts()
      } else {
        throw new Error('Failed to sync engagement')
      }
    } catch (error) {
      toast.error('Failed to sync engagement metrics')
    }
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      facebook: '📘',
      twitter: '🐦',
      reddit: '🤖',
      instagram: '📷'
    }
    return icons[platform] || '🌐'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Posted</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredPosts = posts.filter(post => {
    if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return false
    if (selectedStatus !== 'all' && post.status !== selectedStatus) return false
    return true
  })

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading social marketing data...</p>
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Social Media Marketing</h1>
          <p className="text-muted-foreground">
            Automated social media posting and engagement tracking
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="setup">Setup & Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {/* Automation Control */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={toggleAutomation}
              variant={isAutomationEnabled ? "destructive" : "default"}
            >
              {isAutomationEnabled ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Automation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Automation
                </>
              )}
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
        {/* Automation Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Status</CardTitle>
            {isAutomationEnabled ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAutomationEnabled ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {detectorStatus?.lastCheckTime ? 
                `Last check: ${new Date(detectorStatus.lastCheckTime).toLocaleTimeString()}` : 
                'Not running'
              }
            </p>
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueStatus?.pending || 0} Pending
            </div>
            <p className="text-xs text-muted-foreground">
              {queueStatus?.processing || 0} processing, {queueStatus?.failed || 0} failed
            </p>
          </CardContent>
        </Card>

        {/* Total Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformStats.reduce((sum, stat) => sum + stat.total_posts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        {/* Average CTR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(platformStats.reduce((sum, stat) => sum + stat.avg_ctr, 0) / platformStats.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>
          </div>

          {/* Platform Stats */}
          <Card className="mb-6">
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>
            Posting and engagement metrics by platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {platformStats.map((stat) => (
              <div key={stat.platform} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPlatformIcon(stat.platform)}</span>
                  <span className="font-semibold capitalize">{stat.platform}</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posts:</span>
                    <span>{stat.total_posts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Success:</span>
                    <span className="text-green-600">
                      {((stat.successful_posts / stat.total_posts) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clicks:</span>
                    <span>{stat.total_clicks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="font-semibold">{stat.avg_ctr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Social Posts</CardTitle>
              <CardDescription>
                Track performance and manage your social media posts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium line-clamp-1">
                        {post.article?.title || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {post.article?.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>
                    {post.posted_at ? 
                      new Date(post.posted_at).toLocaleDateString() : 
                      '-'
                    }
                  </TableCell>
                  <TableCell>
                    {post.engagement ? (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.engagement.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {post.engagement.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.engagement.comments}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.clicks || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {post.status === 'posted' && post.post_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(post.post_url, '_blank')}
                        >
                          View
                        </Button>
                      )}
                      {post.status === 'posted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncEngagement(post.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      )}
                      {post.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryPost(post.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </CardContent>
        </Card>
        </TabsContent>
        
        <TabsContent value="setup">
          <SocialMediaSetupWizard />
        </TabsContent>
      </Tabs>
    </div>
  )
}