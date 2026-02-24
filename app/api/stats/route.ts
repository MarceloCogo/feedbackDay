import { NextResponse } from 'next/server'
import { getFeedbackStats, getFeedbackStatsByDate } from '@/lib/database'
import { z } from 'zod'

const dateParamSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()

export async function GET(request: Request) {
  const url = new URL(request.url)
  const stream = url.searchParams.get('stream') === 'true'
  const date = url.searchParams.get('date')

  // Validate date param if provided
  if (date) {
    const validation = dateParamSchema.safeParse(date)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }
  }

  if (stream) {
    // Server-Sent Events para tempo real
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const sendStats = async () => {
          try {
            const stats = date 
              ? await getFeedbackStatsByDate(date)
              : await getFeedbackStats()
            const data = `data: ${JSON.stringify(stats)}\n\n`
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error('Error fetching stats for SSE:', error)
          }
        }

        // Enviar dados imediatamente
        sendStats()

        // Enviar a cada 5 segundos
        const interval = setInterval(sendStats, 5000)

        // Limpar quando cliente desconectar
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  }

  // Endpoint JSON normal
  try {
    const stats = date 
      ? await getFeedbackStatsByDate(date)
      : await getFeedbackStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}