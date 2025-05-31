'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, Chrome } from 'lucide-react'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const setAuthProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    setAuthProviders()
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn('email', { 
        email, 
        callbackUrl: '/admin',
        redirect: true 
      })
    } catch (error) {
      console.error('Email sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/admin',
        redirect: true 
      })
    } catch (error) {
      console.error('Google sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
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
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <Separator className="my-4" />

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
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send magic link
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            A magic link will be sent to your email
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 