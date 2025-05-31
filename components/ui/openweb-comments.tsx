'use client'

import { useEffect, useRef } from 'react'

interface OpenWebCommentsProps {
  articleId: string
  articleTitle: string
  articleUrl: string
}

export function OpenWebComments({ articleId, articleTitle, articleUrl }: OpenWebCommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return
    initialized.current = true

    // Load OpenWeb script if not already loaded
    const loadOpenWebScript = () => {
      if (document.getElementById('openweb-script')) {
        initializeComments()
        return
      }

      const script = document.createElement('script')
      script.id = 'openweb-script'
      script.src = 'https://cdn.openwebcdn.com/sdk/spot.js'
      script.async = true
      script.onload = () => {
        console.log('✅ OpenWeb script loaded')
        initializeComments()
      }
      script.onerror = () => {
        console.error('❌ Failed to load OpenWeb script')
      }
      document.head.appendChild(script)
    }

    const initializeComments = () => {
      // Check if OpenWeb SDK is available
      if (typeof window !== 'undefined' && (window as any).OpenWeb) {
        const OpenWeb = (window as any).OpenWeb

        // Initialize OpenWeb comments
        try {
          OpenWeb.initComments({
            spotId: 'sp_menshb_001', // Replace with your actual OpenWeb Spot ID
            article: {
              id: articleId,
              title: articleTitle,
              url: articleUrl,
              publishedDate: new Date().toISOString(),
              tags: ['mens-health', 'fitness', 'nutrition'],
              category: 'Health & Fitness'
            },
            callbacks: {
              onReady: () => {
                console.log('✅ OpenWeb comments initialized')
              },
              onCommentPosted: (comment: any) => {
                console.log('💬 New comment posted:', comment)
              },
              onError: (error: any) => {
                console.error('❌ OpenWeb error:', error)
              }
            }
          })
        } catch (err) {
          console.error('💥 Error initializing OpenWeb:', err)
          showFallbackComments()
        }
      } else {
        console.error('❌ OpenWeb SDK not available')
        showFallbackComments()
      }
    }

    const showFallbackComments = () => {
      if (commentsRef.current) {
        commentsRef.current.innerHTML = `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 class="text-lg font-semibold mb-2">Comments</h3>
            <p class="text-gray-600 mb-4">Join the conversation about this article.</p>
            <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Sign in to comment
            </button>
          </div>
        `
      }
    }

    // Load the script
    loadOpenWebScript()

  }, [articleId, articleTitle, articleUrl])

  return (
    <div className="mt-8">
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        
        {/* OpenWeb comments container */}
        <div 
          ref={commentsRef}
          id="ow-comments"
          className="min-h-[400px]"
        />
        
        {/* Loading placeholder */}
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-gray-500">
            Loading comments...
          </div>
        </div>
      </div>
    </div>
  )
}

// Alternative: Simple embedded comments widget
export function SimpleCommentsWidget({ articleId }: { articleId: string }) {
  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Join the Discussion</h3>
          <p className="text-gray-600 mb-4">
            Share your thoughts and connect with other readers.
          </p>
          
          {/* Comment form */}
          <div className="bg-white rounded-lg p-4 border">
            <textarea 
              placeholder="Share your thoughts..."
              className="w-full h-24 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                Sign in to post a comment
              </span>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                Post Comment
              </button>
            </div>
          </div>
          
          {/* Sample comments */}
          <div className="mt-6 space-y-4 text-left">
            <div className="bg-white p-4 rounded border">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  J
                </div>
                <div className="ml-3">
                  <div className="font-semibold">John D.</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <p className="text-gray-700">
                Great article! Really helpful tips for my workout routine.
              </p>
            </div>
            
            <div className="bg-white p-4 rounded border">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  M
                </div>
                <div className="ml-3">
                  <div className="font-semibold">Mike S.</div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
              </div>
              <p className="text-gray-700">
                Thanks for sharing this. Going to try these exercises tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 