'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TestPostPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: 'Test Post: Transform Your Fitness Journey',
    content: `Hey r/fitness! 

Just wanted to share some science-backed tips that have really helped me and my clients achieve better results:

1. **Progressive Overload** - The key to muscle growth
2. **Proper Nutrition** - You can't out-train a bad diet
3. **Recovery** - Where the magic happens

Check out our detailed guide at Men's Health Blog for more evidence-based fitness advice!

What strategies have worked best for you?`,
    subreddit: 'MensHB' // Your subreddit
  })

  const handlePost = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/public/test-reddit-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        alert('Posted successfully! Check the result below.')
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
        <h1 className="text-2xl font-bold">Test Reddit Post</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Reddit Post Test</CardTitle>
          <CardDescription>
            Test posting to Reddit. Start with r/test before posting to real subreddits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subreddit</label>
            <input
              type="text"
              value={formData.subreddit}
              onChange={(e) => setFormData({...formData, subreddit: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="test"
            />
            <p className="text-xs text-gray-500 mt-1">
              Without r/ prefix. Use "test" for safe testing.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Post title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              rows={10}
              placeholder="Post content (markdown supported)"
            />
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Test with r/test first to ensure everything works</li>
              <li>• Check subreddit rules before posting</li>
              <li>• Avoid promotional language in fitness/health subreddits</li>
              <li>• Some subreddits require karma or account age</li>
            </ul>
          </div>
          
          <Button 
            onClick={handlePost} 
            disabled={loading || !formData.title || !formData.content || !formData.subreddit}
            className="w-full"
          >
            {loading ? 'Posting...' : 'Post to Reddit'}
          </Button>
          
          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result.success ? (
                <div>
                  <p className="font-semibold">✅ {result.message}</p>
                  {result.url && (
                    <p className="mt-2">
                      View post: <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {result.url}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-semibold">❌ Error: {result.error}</p>
                  {result.details && (
                    <pre className="mt-2 text-xs">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Suggested Subreddits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Safe Testing:</strong> test, test_post</p>
            <p><strong>Fitness:</strong> fitness, bodyweightfitness, weightroom, naturalbodybuilding</p>
            <p><strong>Health:</strong> HealthyFood, nutrition, supplements</p>
            <p><strong>Men's Interest:</strong> malelifestyle, AskMen</p>
            <p className="text-gray-500 mt-3">
              Always read subreddit rules first. Many have strict anti-promotion policies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}