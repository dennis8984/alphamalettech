'use client'

import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, AlertCircle } from 'lucide-react'

// Force this page to be dynamic (not statically generated)
export const dynamic = 'force-dynamic'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      })
      
      if (result?.error) {
        if (result.error === 'AccessDenied') {
          setMessage('Access denied. Your email is not authorized for admin access.')
        } else {
          setMessage(`Sign in failed: ${result.error}`)
        }
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await signIn('google', {
        callbackUrl,
        redirect: false,
      })
      
      if (result?.error) {
        if (result.error === 'AccessDenied') {
          setMessage('Access denied. Your Google account is not authorized for admin access.')
        } else {
          setMessage(`Google sign in failed: ${result.error}`)
        }
        setIsSuccess(false)
        setIsLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (error) {
      setMessage('Google sign in failed. Please try again.')
      setIsSuccess(false)
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
              HUB
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
            HUB
          </CardTitle>
          <CardDescription>
            Admin Dashboard - Sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <React.Fragment>
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-gray-500">Or</span>
                </div>
              </div>
            </React.Fragment>
          )}

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
                placeholder="Enter your admin email"
                required
              />
            </div>
            
            {message && (
              <div className={`text-sm flex items-center gap-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {!isSuccess && <AlertCircle className="h-4 w-4" />}
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
            Only authorized admin emails can access this area
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 