'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Check, Star, Users, BookOpen, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { subscribeToNewsletter } from '@/lib/supabase-client'

export default function SubscribePage() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      setStatus('error')
      setMessage('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setStatus('idle')

    try {
      const result = await subscribeToNewsletter(formData.name, formData.email)

      if (result.success) {
        setStatus('success')
        setMessage(result.message)
        setFormData({ name: '', email: '' })
      } else {
        setStatus('error')
        setMessage(result.error)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear status when user starts typing
    if (status !== 'idle') {
      setStatus('idle')
      setMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center mb-6">
            <span className="text-3xl font-bold">
              <span className="bg-red-600 text-white px-3 py-2 mr-2">MEN'S</span>
              HUB
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join the Men's Hub Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get exclusive access to premium content, join discussions, and connect with like-minded men on their fitness journey.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Premium Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access exclusive articles, workout guides, and nutrition plans from certified experts.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Join Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Comment on articles, share your progress, and get advice from the community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Community Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with thousands of men sharing their fitness, health, and lifestyle journeys.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Signup Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Signup Form */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">Get Started Today</CardTitle>
              <p className="text-gray-600">Join thousands of men transforming their lives</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Messages */}
              {status === 'success' && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800">{message}</p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-lg py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Magic Link...' : 'Join Men\'s Hub Community'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">Or sign in with</p>
                <div className="space-y-2">
                  <Link href="/admin/auth/signin">
                    <Button variant="outline" className="w-full">
                      Admin Sign In
                    </Button>
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                By joining, you agree to our Terms of Service and Privacy Policy. 
                You can unsubscribe at any time.
              </p>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">What You'll Get:</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500 mt-1" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Magic Link Login</h4>
                  <p className="text-gray-600">No passwords needed! Get a secure login link sent directly to your email.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500 mt-1" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Comment & Engage</h4>
                  <p className="text-gray-600">Share your thoughts on articles, ask questions, and connect with the community.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500 mt-1" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Exclusive Content</h4>
                  <p className="text-gray-600">Access member-only articles, workout plans, and expert interviews.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-500 mt-1" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Community Support</h4>
                  <p className="text-gray-600">Get motivation, advice, and support from thousands of like-minded men.</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="text-sm font-medium text-gray-900">4.9/5 from 2,000+ members</span>
              </div>
              <p className="text-gray-700 italic">
                "Men's Hub has completely transformed my approach to fitness and health. The community support is incredible!"
              </p>
              <p className="text-sm text-gray-600 mt-2">- Mike Johnson, Member since 2023</p>
            </div>
          </div>
        </div>

        {/* Back to Article Link */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.history.back()} 
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ← Back to Article
          </button>
        </div>
      </div>
    </div>
  )
} 