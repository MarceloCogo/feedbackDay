import { NextRequest, NextResponse } from 'next/server'
import { saveFeedback } from '@/lib/database'
import { z } from 'zod'

const feedbackSchema = z.object({
  positive: z.array(z.string()).min(1),
  negative: z.array(z.string()).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
  source: z.enum(['tablet', 'link'])
})

const allowedCategories = [
  'Dinâmica do dia',
  'Reuniões',
  'Comunicação',
  'Espaço de trabalho',
  'Foco / Produtividade',
  'Colaboração',
  'Nada a destacar hoje'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const validation = feedbackSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { positive, negative, date, source } = validation.data

    // Validate categories
    const allCategories = [...positive, ...negative]
    const invalidCategories = allCategories.filter(cat => !allowedCategories.includes(cat))
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        { error: 'Invalid categories', invalid: invalidCategories },
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