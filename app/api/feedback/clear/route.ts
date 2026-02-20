import { NextRequest, NextResponse } from 'next/server'
import { clearAllFeedback } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    await clearAllFeedback()
    
    return NextResponse.json(
      { success: true, message: 'All feedback data cleared' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error clearing feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}