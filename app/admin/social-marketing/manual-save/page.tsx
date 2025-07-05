'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ManualSavePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [credentials, setCredentials] = useState({
    client_id: '',
    client_secret: '',
    refresh_token: '',
    user_agent: 'MensHealthBot/1.0'
  })

  const handleSave = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/social-marketing/credentials/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'reddit',
          credentials
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        alert('Credentials saved successfully!')
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
        <h1 className="text-2xl font-bold">Manual Reddit Credentials Save</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reddit Credentials</CardTitle>
          <CardDescription>
            Manually save your Reddit credentials if the automatic save isn't working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client ID</label>
            <input
              type="text"
              value={credentials.client_id}
              onChange={(e) => setCredentials({...credentials, client_id: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Your Reddit Client ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Client Secret</label>
            <input
              type="password"
              value={credentials.client_secret}
              onChange={(e) => setCredentials({...credentials, client_secret: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Your Reddit Client Secret"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Refresh Token</label>
            <textarea
              value={credentials.refresh_token}
              onChange={(e) => setCredentials({...credentials, refresh_token: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              placeholder="Your Reddit Refresh Token"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">User Agent</label>
            <input
              type="text"
              value={credentials.user_agent}
              onChange={(e) => setCredentials({...credentials, user_agent: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="MensHealthBot/1.0 by /u/YourUsername"
            />
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={loading || !credentials.client_id || !credentials.client_secret || !credentials.refresh_token}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Credentials'}
          </Button>
          
          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}