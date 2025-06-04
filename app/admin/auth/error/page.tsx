'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthError() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'Your email address is not authorized to access the admin panel.',
          details: 'Only authorized administrators can access this area. If you believe this is an error, please contact the site administrator.'
        }
      case 'Configuration':
        return {
          title: 'Configuration Error',
          description: 'There was a problem with the authentication configuration.',
          details: 'Please contact the site administrator to resolve this issue.'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token was invalid or expired.',
          details: 'Please try signing in again with a fresh link.'
        }
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during sign in.',
          details: 'Please try again or contact support if the problem persists.'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          <span className="bg-red-600 text-white px-2 py-1 mr-2">MEN'S</span>
          HUB Admin
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">{errorInfo.title}</CardTitle>
            <CardDescription>{errorInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-700">{errorInfo.details}</p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/admin/auth/signin')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
            </div>

            {error === 'AccessDenied' && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Attempted access has been logged for security purposes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 