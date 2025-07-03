// Google Analytics gtag type declarations
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: {
        page_title?: string
        page_location?: string
        page_path?: string
        utm_source?: string
        utm_medium?: string
        utm_campaign?: string
        keyword?: string
        [key: string]: any
      }
    ) => void
    dataLayer?: any[]
  }
}

export {}