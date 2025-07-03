import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paths } = body

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json(
        { error: 'Invalid paths provided' },
        { status: 400 }
      )
    }

    // Revalidate each path
    for (const path of paths) {
      try {
        revalidatePath(path)
        console.log(`Revalidated: ${path}`)
      } catch (error) {
        console.error(`Failed to revalidate ${path}:`, error)
      }
    }

    return NextResponse.json({ 
      message: 'Paths revalidated successfully',
      paths 
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate paths' },
      { status: 500 }
    )
  }
}