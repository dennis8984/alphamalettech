import { NextRequest, NextResponse } from 'next/server'
import { getSocialQueue } from '@/lib/social-queue'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queue = getSocialQueue()
    const status = await queue.getQueueStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error('Queue status error:', error)
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    )
  }
}