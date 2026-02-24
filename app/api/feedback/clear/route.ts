import { NextRequest, NextResponse } from 'next/server'
import { clearAllFeedback, clearFeedbackByDate } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')

    if (date) {
      await clearFeedbackByDate(date)
      return NextResponse.json(
        { success: true, message: `Feedback data cleared for date ${date}` },
        { status: 200 }
      )
    } else {
      await clearAllFeedback()
      return NextResponse.json(
        { success: true, message: 'All feedback data cleared' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error clearing feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}