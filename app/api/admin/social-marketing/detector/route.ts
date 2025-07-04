import { NextRequest, NextResponse } from 'next/server'
import { getArticleDetector } from '@/lib/article-detector'
import { getSocialQueue } from '@/lib/social-queue'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    
    const detector = getArticleDetector()
    const queue = getSocialQueue()

    switch (action) {
      case 'start':
        await detector.startMonitoring(5) // 5 minute intervals
        queue.startProcessing(60) // Process every minute
        return NextResponse.json({ success: true, message: 'Automation started' })
        
      case 'stop':
        detector.stopMonitoring()
        queue.stopProcessing()
        return NextResponse.json({ success: true, message: 'Automation stopped' })
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Detector control error:', error)
    return NextResponse.json(
      { error: 'Failed to control detector' },
      { status: 500 }
    )
  }
}