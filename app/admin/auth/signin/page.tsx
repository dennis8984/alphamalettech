'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, AlertCircle } from 'lucide-react'
import { signInWithEmail } from '@/lib/supabase-auth'

// Admin email whitelist - only these emails can access admin
const ADMIN_EMAILS = [
  'admin@menshealth.com',
  'editor@menshealth.com',
  'menshb@hqoffshore.com', // Primary admin email
  'admin@menshb.com',
  // Add your admin emails here
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_1,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_2,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_3,
].filter(Boolean) as string[]

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      // Check if email is in admin whitelist
      if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        setMessage('Access denied. Your email is not authorized for admin access.')
        setIsLoading(false)
        return
      }

      const { data, error } = await signInWithEmail(email)
      
      if (error) {
        setMessage(error.message || 'Failed to send magic link')
        setIsSuccess(false)
      } else {
        setMessage('Magic link sent! Check your email and click the link to sign in.')
        setIsSuccess(true)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setMessage('Something went wrong. Please try again.')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="bg-red-600 text-white px-2 py-1 mr-2">MEN'S</span>
            HUB Admin
          </CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-md flex items-start ${
              isSuccess 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                {message}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Only authorized email addresses can access the admin panel.
              <br />
              Check your email for the magic link to sign in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 