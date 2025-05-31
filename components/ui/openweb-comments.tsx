'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase-client'
import { createComment, getComments, type Comment } from '@/lib/supabase-database'

interface CommentsProps {
  articleId: string
  articleTitle: string
  articleUrl: string
}

export function OpenWebComments({ articleId, articleTitle, articleUrl }: CommentsProps) {
  const commentsRef = useRef<HTMLDivElement>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [isPostingComment, setIsPostingComment] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
      setIsLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Load comments when component mounts or articleId changes
    const loadComments = async () => {
      const result = await getComments(articleId)
      if (result.success && result.comments) {
        setComments(result.comments)
      }
    }

    loadComments()
  }, [articleId])

  const handlePostComment = async (content: string) => {
    if (!user || !content.trim()) return

    setIsPostingComment(true)
    
    try {
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'
      
      const result = await createComment(
        articleId,
        content.trim(),
        user.email,
        userName
      )

      if (result.success && result.comment) {
        // Add new comment to the top of the list
        setComments(prev => [result.comment!, ...prev])
        
        // Clear the textarea
        const textarea = document.getElementById('comment-textarea') as HTMLTextAreaElement
        if (textarea) {
          textarea.value = ''
        }
        
        // Show success message
        alert('Comment posted successfully!')
      } else {
        alert(`Failed to post comment: ${result.error}`)
      }
    } catch (error) {
      console.error('Comment posting error:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsPostingComment(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const commentDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600', 
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600'
    ]
    const hash = email.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  useEffect(() => {
    // Show comments interface based on auth status
    const showCommentsInterface = () => {
      if (!commentsRef.current) return

      if (user) {
        // Show real commenting interface for authenticated users
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous'
        
        commentsRef.current.innerHTML = `
          <div class="space-y-6">
            <!-- Comment Form -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4">Welcome back, ${userName}!</h3>
              <div class="bg-white rounded-lg p-4 border">
                <textarea 
                  id="comment-textarea"
                  placeholder="Share your thoughts about this article..."
                  class="w-full h-24 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                ></textarea>
                <div class="flex justify-between items-center mt-3">
                  <span class="text-sm text-gray-500">
                    💬 Logged in as <strong>${user.email}</strong>
                  </span>
                  <div class="space-x-2">
                    <button id="sign-out-btn" class="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm">
                      Sign Out
                    </button>
                    <button id="post-comment-btn" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Real Comments -->
            <div class="space-y-4" id="comments-list">
              ${comments.map(comment => `
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <div class="flex items-center mb-3">
                    <div class="w-10 h-10 bg-gradient-to-r ${getAvatarColor(comment.user_email)} rounded-full flex items-center justify-center text-white font-bold">
                      ${getAvatarInitials(comment.user_name)}
                    </div>
                    <div class="ml-3">
                      <div class="font-semibold text-gray-900">${comment.user_name}</div>
                      <div class="text-sm text-gray-500">${formatTimeAgo(comment.created_at)}</div>
                    </div>
                  </div>
                  <p class="text-gray-700 leading-relaxed">
                    ${comment.content}
                  </p>
                </div>
              `).join('')}
            </div>

            ${comments.length === 0 ? `
              <div class="text-center py-8 text-gray-500">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ` : ''}
          </div>
        `
      } else {
        // Show login prompt for non-authenticated users with sample comments
        commentsRef.current.innerHTML = `
          <div class="space-y-6">
            <!-- Comment Form -->
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4">Join the Discussion</h3>
              <div class="bg-white rounded-lg p-4 border">
                <textarea 
                  id="comment-textarea"
                  placeholder="Share your thoughts about this article..."
                  class="w-full h-24 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
                ></textarea>
                <div class="flex justify-between items-center mt-3">
                  <span class="text-sm text-gray-500">
                    💬 <button id="signin-link" class="text-red-600 hover:text-red-700 underline cursor-pointer font-medium">Sign in</button> to join the conversation
                  </span>
                  <button id="post-comment-btn" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            <!-- Real Comments + Sample Comments -->
            <div class="space-y-4">
              ${comments.map(comment => `
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <div class="flex items-center mb-3">
                    <div class="w-10 h-10 bg-gradient-to-r ${getAvatarColor(comment.user_email)} rounded-full flex items-center justify-center text-white font-bold">
                      ${getAvatarInitials(comment.user_name)}
                    </div>
                    <div class="ml-3">
                      <div class="font-semibold text-gray-900">${comment.user_name}</div>
                      <div class="text-sm text-gray-500">${formatTimeAgo(comment.created_at)}</div>
                    </div>
                  </div>
                  <p class="text-gray-700 leading-relaxed">
                    ${comment.content}
                  </p>
                  <div class="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                    <button class="flex items-center hover:text-red-600 transition-colors like-btn">
                      <span class="mr-1">👍</span> Like
                    </button>
                    <button class="hover:text-red-600 transition-colors reply-btn">Reply</button>
                  </div>
                </div>
              `).join('')}

              ${comments.length === 0 ? `
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
                    <button class="flex items-center hover:text-red-600 transition-colors like-btn">
                      <span class="mr-1">👍</span> 12
                    </button>
                    <button class="hover:text-red-600 transition-colors reply-btn">Reply</button>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `
      }
    }

    if (!isLoading) {
      showCommentsInterface()
      
      // Add event listeners after content is loaded
      setTimeout(() => {
        if (user) {
          // Authenticated user event listeners
          const signOutBtn = document.getElementById('sign-out-btn')
          const postBtn = document.getElementById('post-comment-btn')
          
          if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
              await supabase.auth.signOut()
              // User state will update via auth state listener
            })
          }
          
          if (postBtn) {
            postBtn.addEventListener('click', () => {
              const textarea = document.getElementById('comment-textarea') as HTMLTextAreaElement
              if (textarea && textarea.value.trim()) {
                handlePostComment(textarea.value.trim())
              } else {
                alert('Please write a comment first!')
              }
            })
          }

          // Enable Enter key to post
          const textarea = document.getElementById('comment-textarea')
          if (textarea) {
            textarea.addEventListener('keydown', (e: KeyboardEvent) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                const content = (e.target as HTMLTextAreaElement).value.trim()
                if (content) {
                  handlePostComment(content)
                }
              }
            })
          }
        } else {
          // Non-authenticated user event listeners
          const signinLink = document.getElementById('signin-link')
          const textarea = document.getElementById('comment-textarea')
          const postBtn = document.getElementById('post-comment-btn')
          
          if (signinLink) {
            signinLink.addEventListener('click', () => setShowLoginModal(true))
          }
          
          if (textarea) {
            textarea.addEventListener('click', () => setShowLoginModal(true))
            textarea.addEventListener('focus', () => setShowLoginModal(true))
          }
          
          if (postBtn) {
            postBtn.addEventListener('click', () => setShowLoginModal(true))
          }

          // Like and reply buttons
          const likeBtns = document.querySelectorAll('.like-btn')
          const replyBtns = document.querySelectorAll('.reply-btn')
          
          likeBtns.forEach(btn => {
            btn.addEventListener('click', () => setShowLoginModal(true))
          })
          
          replyBtns.forEach(btn => {
            btn.addEventListener('click', () => setShowLoginModal(true))
          })
        }
      }, 100)
    }

  }, [user, isLoading, comments])

  const LoginModal = () => {
    if (!showLoginModal) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h3>
            <p className="text-gray-600 mb-6">
              Sign in to share your thoughts, like comments, and connect with other readers.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.open('/subscribe', '_blank')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Sign In / Register
              </button>
              
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Continue Reading
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Join Men's Hub community to engage with articles and connect with fellow readers
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Comments</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Loading comments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Comments ({comments.length})</h2>
      <div 
        ref={commentsRef}
        className="min-h-[200px]"
      />
      <LoginModal />
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