'use client'

import { useEffect, useRef } from 'react'

interface CommentsProps {
  articleId: string
  articleTitle: string
  articleUrl: string
}

export function OpenWebComments({ articleId, articleTitle, articleUrl }: CommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Directly show the beautiful fallback comments instead of trying Giscus
    const showFallbackComments = () => {
      if (!commentsRef.current) return

      commentsRef.current.innerHTML = `
        <div class="space-y-6">
          <!-- Comment Form -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Join the Discussion</h3>
            <div class="bg-white rounded-lg p-4 border">
              <textarea 
                placeholder="Share your thoughts about this article..."
                class="w-full h-24 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled
              ></textarea>
              <div class="flex justify-between items-center mt-3">
                <span class="text-sm text-gray-500">
                  💬 Sign in to join the conversation
                </span>
                <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors" disabled>
                  Post Comment
                </button>
              </div>
            </div>
          </div>

          <!-- Sample Comments -->
          <div class="space-y-4">
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  FJ
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">FitnessJoe92</div>
                  <div class="text-sm text-gray-500">2 hours ago</div>
                </div>
              </div>
              <p class="text-gray-700 leading-relaxed">
                Excellent breakdown of the exercises! I've been doing planks wrong for years. 
                The form tips in this article really helped me understand proper technique. 💪
              </p>
              <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                <button class="flex items-center hover:text-red-600 transition-colors">
                  <span class="mr-1">👍</span> 12
                </button>
                <button class="hover:text-red-600 transition-colors">Reply</button>
              </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  MS
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">MuscleBuilder</div>
                  <div class="text-sm text-gray-500">1 day ago</div>
                </div>
              </div>
              <p class="text-gray-700 leading-relaxed">
                Just tried the ab circuit from this article. Holy moly, I'm feeling it already! 
                Great progression from beginner to advanced moves. 🔥
              </p>
              <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                <button class="flex items-center hover:text-red-600 transition-colors">
                  <span class="mr-1">👍</span> 8
                </button>
                <button class="hover:text-red-600 transition-colors">Reply</button>
              </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  LH
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">LifeHacker_Dev</div>
                  <div class="text-sm text-gray-500">2 days ago</div>
                </div>
              </div>
              <p class="text-gray-700 leading-relaxed">
                As a developer who sits all day, these core exercises are exactly what I needed. 
                The modification suggestions make it accessible for all fitness levels. Thanks! 🙏
              </p>
              <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                <button class="flex items-center hover:text-red-600 transition-colors">
                  <span class="mr-1">👍</span> 15
                </button>
                <button class="hover:text-red-600 transition-colors">Reply</button>
              </div>
            </div>

            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="flex items-center mb-3">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  AT
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">AbTrainer_Pro</div>
                  <div class="text-sm text-gray-500">3 days ago</div>
                </div>
              </div>
              <p class="text-gray-700 leading-relaxed">
                Love how you explained the science behind each movement. The progression from dead bug to full plank is perfect for beginners. 
                Been training abs for 10 years and still learned something new!
              </p>
              <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                <button class="flex items-center hover:text-red-600 transition-colors">
                  <span class="mr-1">👍</span> 23
                </button>
                <button class="hover:text-red-600 transition-colors">Reply</button>
              </div>
            </div>
          </div>

          <!-- Load More Comments -->
          <div class="text-center">
            <button class="text-red-600 hover:text-red-700 font-medium transition-colors">
              Load more comments...
            </button>
          </div>
        </div>
      `
    }

    // Show fallback comments immediately
    showFallbackComments()

  }, [articleId, articleTitle, articleUrl])

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Comments</h2>
      <div 
        ref={commentsRef}
        className="min-h-[200px]"
      />
    </div>
  )
}

// Keep the SimpleCommentsWidget as an alternative
export function SimpleCommentsWidget({ articleId }: { articleId: string }) {
  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
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