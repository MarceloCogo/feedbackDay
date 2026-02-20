import { NextResponse } from 'next/server'
import { getFeedbackStats, getFeedbackStatsByDate } from '@/lib/database'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const stream = url.searchParams.get('stream') === 'true'
  const date = url.searchParams.get('date')

  if (stream) {
    // Server-Sent Events para tempo real
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const sendStats = () => {
          try {
            const stats = date 
              ? getFeedbackStatsByDate(date)
              : getFeedbackStats()
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
      ? getFeedbackStatsByDate(date)
      : getFeedbackStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}