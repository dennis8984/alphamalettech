'use client'

import { useState } from 'react'
import { signInWithEmail } from '@/lib/supabase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await signInWithEmail(email)
      
      if (error) {
        setMessage(error.message)
        setIsSuccess(false)
      } else {
        setMessage('Check your email for the magic link!')
        setIsSuccess(true)
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              <span className="bg-red-600 text-white px-2 py-1 mr-1">MEN'S</span>
              HEALTH
            </CardTitle>
            <CardDescription>
              Check Your Email
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Magic link sent!</h3>
              <p className="text-sm text-gray-600 mt-2">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Click the link in your email to sign in to the admin dashboard.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsSuccess(false)
                setEmail('')
                setMessage('')
              }}
              variant="outline"
              className="w-full"
            >
              Send Another Link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            <span className="bg-red-600 text-white px-2 py-1 mr-1">MEN'S</span>
            HEALTH
          </CardTitle>
          <CardDescription>
            Admin Dashboard - Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Sign In */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            {message && (
              <div className={`text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Send magic link'}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            A magic link will be sent to your email via Supabase
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 