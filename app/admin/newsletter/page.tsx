'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getNewsletterSubscribers, type NewsletterSubscriber } from '@/lib/supabase-database'
import { Mail, Users, Calendar, Download } from 'lucide-react'

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    setIsLoading(true)
    const result = await getNewsletterSubscribers()
    
    if (result.success && result.subscribers) {
      setSubscribers(result.subscribers)
      setError(null)
    } else {
      setError(result.error || 'Failed to load subscribers')
    }
    
    setIsLoading(false)
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Subscribed Date', 'Status'],
      ...subscribers.map(sub => [
        sub.name,
        sub.email,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Loading subscribers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
        <p className="text-gray-600">Manage your Men's Hub newsletter subscriber list</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button 
              onClick={loadSubscribers} 
              className="mt-2"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active newsletter subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(sub => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(sub.subscribed_at) > weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New subscribers this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.length > 0 
                ? Math.round((subscribers.filter(sub => sub.is_active).length / subscribers.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active subscription rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Subscriber List</h2>
        <div className="space-x-2">
          <Button onClick={loadSubscribers} variant="outline">
            Refresh
          </Button>
          <Button onClick={exportToCSV} className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Subscribed</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{subscriber.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600">{subscriber.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(subscriber.subscribed_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        subscriber.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {subscribers.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No newsletter subscribers yet</p>
                <p className="text-sm text-gray-400">Subscribers will appear here once people sign up</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📋 How to Use This Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Email Marketing</h4>
            <p className="text-sm text-gray-600">
              Export the CSV to import subscribers into your email marketing platform (Mailchimp, ConvertKit, etc.)
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Analytics</h4>
            <p className="text-sm text-gray-600">
              Track growth trends and subscription rates to optimize your content strategy
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Engagement</h4>
            <p className="text-sm text-gray-600">
              Use subscriber data to personalize content and improve community engagement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 