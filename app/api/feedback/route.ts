import { NextRequest, NextResponse } from 'next/server'
import { saveFeedback } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { positive, negative, date, source } = body
    
    if (!positive || !negative || !date || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(positive) || !Array.isArray(negative)) {
      return NextResponse.json(
        { error: 'Positive and negative must be arrays' },
        { status: 400 }
      )
    }
    
    const feedbackData = {
      positive,
      negative,
      date,
      source
    }
    
    const id = await saveFeedback(feedbackData)
    
    return NextResponse.json(
      { success: true, id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}