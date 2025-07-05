import { NextRequest, NextResponse } from 'next/server'

// Store automation state in memory (in production, use Redis or database)
let automationState = {
  isRunning: false,
  lastCheck: null as Date | null,
  articlesProcessed: 0
}

export async function GET() {
  return NextResponse.json({
    isRunning: automationState.isRunning,
    lastCheck: automationState.lastCheck,
    articlesProcessed: automationState.articlesProcessed
  })
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'start') {
      if (automationState.isRunning) {
        return NextResponse.json({
          message: 'Automation is already running'
        })
      }
      
      automationState.isRunning = true
      automationState.lastCheck = new Date()
      
      // In a real implementation, this would start the article detector
      // For now, we'll just set the state
      console.log('Starting social media automation...')
      
      return NextResponse.json({
        success: true,
        message: 'Automation started',
        status: automationState
      })
      
    } else if (action === 'stop') {
      automationState.isRunning = false
      
      return NextResponse.json({
        success: true,
        message: 'Automation stopped',
        status: automationState
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      )
    }
    
  } catch (error: any) {
    console.error('Error controlling automation:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}