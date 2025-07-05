'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RedditSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [defaultSubreddit, setDefaultSubreddit] = useState('MensHB')
  const [result, setResult] = useState<any>(null)

  const handleSave = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/public/update-reddit-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_subreddit: defaultSubreddit })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        alert('Settings saved successfully!')
      }
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/social-marketing">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Reddit Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configure Reddit Settings</CardTitle>
          <CardDescription>
            Set your default subreddit and other Reddit-specific options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Default Subreddit</label>
            <input
              type="text"
              value={defaultSubreddit}
              onChange={(e) => setDefaultSubreddit(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="MensHB"
            />
            <p className="text-xs text-gray-500 mt-1">
              Without r/ prefix. This is where articles will be posted by default.
            </p>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={loading || !defaultSubreddit}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          
          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result.success ? (
                <p>✅ {result.message}</p>
              ) : (
                <p>❌ Error: {result.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/admin/social-marketing/test-post">
            <Button variant="outline" className="w-full">
              Test Manual Post
            </Button>
          </Link>
          <Link href="/admin/social-marketing">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}