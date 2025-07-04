import { NextRequest, NextResponse } from 'next/server'
import { getArticleDetector } from '@/lib/article-detector'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const detector = getArticleDetector()
    const status = detector.getStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error('Detector status error:', error)
    return NextResponse.json(
      { error: 'Failed to get detector status' },
      { status: 500 }
    )
  }
}