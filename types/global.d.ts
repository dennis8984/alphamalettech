// Global type declarations for the project

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      GOOGLE_CLIENT_ID?: string
      GOOGLE_CLIENT_SECRET?: string
      EMAIL_SERVER_HOST?: string
      EMAIL_SERVER_PORT?: string
      EMAIL_SERVER_USER?: string
      EMAIL_SERVER_PASSWORD?: string
      EMAIL_FROM?: string
      ADMIN_EMAIL_1?: string
      ADMIN_EMAIL_2?: string
      ADMIN_EMAIL_3?: string
      CLAUDE_API_KEY?: string
      CLOUDINARY_CLOUD_NAME?: string
      CLOUDINARY_API_KEY?: string
      CLOUDINARY_API_SECRET?: string
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

// NextAuth type extensions
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }

  interface User {
    id: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}

export {} 