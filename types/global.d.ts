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

export {} 