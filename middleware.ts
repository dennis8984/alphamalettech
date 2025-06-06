import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Allow access to admin routes only for admin users
    const token = req.nextauth.token
    
    if (req.nextUrl.pathname.startsWith('/admin') && 
        !req.nextUrl.pathname.startsWith('/admin/auth/')) {
      
      // Check if user has admin role
      if (!token || token.role !== 'admin') {
        // Redirect to access denied error page
        const url = req.nextUrl.clone()
        url.pathname = '/admin/auth/error'
        url.searchParams.set('error', 'AccessDenied')
        return Response.redirect(url)
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/admin/auth/')) {
          return true
        }
        
        // For other admin routes, require token with admin role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token && token.role === 'admin'
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
} 