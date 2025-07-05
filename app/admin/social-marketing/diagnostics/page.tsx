'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>({})

  const loadDiagnostics = async () => {
    setLoading(true)
    try {
      // Check recent articles
      const articlesRes = await fetch('/api/public/check-articles')
      const articles = await articlesRes.json()
      
      // Check social posts
      const postsRes = await fetch('/api/public/check-social-posts')
      const posts = await postsRes.json()
      
      // Check automation status
      const automationRes = await fetch('/api/public/start-automation')
      const automation = await automationRes.json()
      
      setData({
        articles,
        posts,
        automation,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Diagnostic error:', error)
      setData({ error: error.toString() })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDiagnostics()
  }, [])

  const triggerCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/public/trigger-article-check', {
        method: 'POST'
      })
      const result = await response.json()
      alert(result.message || 'Check triggered')
      await loadDiagnostics()
    } catch (error) {
      alert('Error triggering check')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/social-marketing">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Social Media Diagnostics</h1>
        <Button
          onClick={loadDiagnostics}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Automation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data.automation || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Articles (Last 5)</CardTitle>
            <CardDescription>These should trigger social posts when published</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data.articles || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Social Posts</CardTitle>
            <CardDescription>Posts created by the automation system</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data.posts || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={triggerCheck}
              disabled={loading}
              className="w-full"
            >
              Manually Trigger Article Check
            </Button>
            <p className="text-sm text-gray-600">
              This will check for published articles and create social posts for any that haven't been posted yet.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}