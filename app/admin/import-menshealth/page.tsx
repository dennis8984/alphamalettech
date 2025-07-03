'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const FITNESS_ARTICLES = [
  'https://www.menshealth.com/fitness/a64705624/abs-workouts/',
  'https://www.menshealth.com/fitness/a64609038/working-out-after-becoming-a-dad/',
  'https://www.menshealth.com/fitness/a64743545/workout-in-jeans/',
  'https://www.menshealth.com/fitness/a64460865/strength-the-arnold-2025/',
  'https://www.menshealth.com/fitness/a64773165/rotational-power-exercises/'
]

export default function ImportMensHealthPage() {
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [selectedCategory] = useState('fitness')

  const handleImport = async () => {
    setImporting(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/import/menshealth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: FITNESS_ARTICLES,
          category: selectedCategory
        })
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Import error:', error)
      setResults({
        success: false,
        error: 'Import failed. Check console for details.'
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Import from Men's Health</h1>
          <p className="text-muted-foreground">
            Import and enhance articles from Men's Health website
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Fitness Articles</CardTitle>
          <CardDescription>
            This will import 5 fitness articles from Men's Health, rewrite them with Claude AI for originality, and publish them to your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Articles to Import:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                {FITNESS_ARTICLES.map((url, index) => (
                  <li key={index}>
                    {index + 1}. {url.split('/').slice(-2, -1)[0].replace(/-/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Articles will be completely rewritten by Claude AI</li>
                <li>• Original images will be preserved</li>
                <li>• Process takes about 2-3 minutes</li>
                <li>• Ensure CLAUDE_API_KEY is set in environment</li>
              </ul>
            </div>

            <Button 
              onClick={handleImport} 
              disabled={importing}
              className="w-full"
              size="lg"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing Articles...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Import 5 Fitness Articles
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-lg ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-semibold mb-2 ${results.success ? 'text-green-900' : 'text-red-900'}`}>
                    {results.success ? '✅ Import Complete' : '❌ Import Failed'}
                  </h3>
                  {results.success && (
                    <div className="text-sm text-green-700">
                      <p>Total Processed: {results.totalProcessed}</p>
                      <p>Successful: {results.successCount}</p>
                      <p>Failed: {results.errorCount}</p>
                    </div>
                  )}
                  {results.error && (
                    <p className="text-sm text-red-700">{results.error}</p>
                  )}
                </div>

                {results.results && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Import Results:</h3>
                    {results.results.map((result: any, index: number) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg text-sm ${
                          result.status === 'success' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{result.title || result.url}</p>
                            {result.status === 'success' && (
                              <p className="text-xs mt-1">
                                Article ID: {result.articleId} • {result.wordCount} words
                              </p>
                            )}
                            {result.error && (
                              <p className="text-xs mt-1">{result.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results.success && results.successCount > 0 && (
                  <div className="mt-4">
                    <Link href="/admin/articles">
                      <Button variant="outline" className="w-full">
                        View Imported Articles
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}