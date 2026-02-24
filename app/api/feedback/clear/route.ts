import { NextRequest, NextResponse } from 'next/server'
import { clearAllFeedback, clearFeedbackByDate } from '@/lib/database'
import { z } from 'zod'

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const dateParam = url.searchParams.get('date')

    // Validate date param if provided
    if (dateParam) {
      const validation = dateParamSchema.safeParse(dateParam)
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        )
      }
    }

    if (dateParam) {
      await clearFeedbackByDate(dateParam)
      return NextResponse.json(
        { success: true, message: `Feedback data cleared for date ${dateParam}` },
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