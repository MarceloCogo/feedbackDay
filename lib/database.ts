import { Redis } from '@upstash/redis'

// Inicializar cliente Redis com as variáveis corretas da Vercel
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.REDIS_URL || '',
  token: process.env.KV_REST_API_TOKEN || '',
})

interface FeedbackData {
  id: number
  positive: string[]
  negative: string[]
  date: string
  source: string
  createdAt: number
}

const FEEDBACKS_KEY = 'feedbacks'
const NEXT_ID_KEY = 'nextId'

export interface FeedbackInput {
  positive: string[]
  negative: string[]
  date: string
  source: string
}

export async function saveFeedback(data: FeedbackInput): Promise<number> {
  // Buscar próximo ID
  let nextId = await redis.get<number>(NEXT_ID_KEY)
  if (!nextId) {
    nextId = 1
  }
  
  const feedback: FeedbackData = {
    id: nextId,
    positive: data.positive,
    negative: data.negative,
    date: data.date,
    source: data.source,
    createdAt: Date.now()
  }
  
  // Buscar feedbacks existentes
  const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
  feedbacks.push(feedback)
  
  // Salvar feedbacks e próximo ID
  await redis.set(FEEDBACKS_KEY, feedbacks)
  await redis.set(NEXT_ID_KEY, nextId + 1)
  
  return nextId
}

export async function getAllFeedback(): Promise<FeedbackData[]> {
  const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
  return feedbacks.sort((a: FeedbackData, b: FeedbackData) => b.createdAt - a.createdAt)
}

export async function getFeedbackByDate(dateStr: string): Promise<FeedbackData[]> {
  const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
  return feedbacks
    .filter((f: FeedbackData) => f.date.startsWith(dateStr))
    .sort((a: FeedbackData, b: FeedbackData) => b.createdAt - a.createdAt)
}

export async function getFeedbackStats() {
  const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
  
  const stats = {
    total: feedbacks.length,
    positive: {} as Record<string, number>,
    negative: {} as Record<string, number>
  }
  
  const categories = [
    'Dinâmica do dia',
    'Reuniões', 
    'Comunicação',
    'Espaço de trabalho',
    'Foco / Produtividade',
    'Colaboração',
    'Nada a destacar hoje'
  ]
  
  categories.forEach(cat => {
    stats.positive[cat] = 0
    stats.negative[cat] = 0
  })
  
  feedbacks.forEach((feedback: FeedbackData) => {
    feedback.positive.forEach((cat: string) => {
      if (stats.positive[cat] !== undefined) {
        stats.positive[cat]++
      }
    })
    feedback.negative.forEach((cat: string) => {
      if (stats.negative[cat] !== undefined) {
        stats.negative[cat]++
      }
    })
  })
  
  return stats
}

export async function getFeedbackStatsByDate(dateStr: string) {
  const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
  const dayFeedback = feedbacks.filter((f: FeedbackData) => f.date.startsWith(dateStr))
  
  const stats = {
    total: dayFeedback.length,
    positive: {} as Record<string, number>,
    negative: {} as Record<string, number>
  }
  
  const categories = [
    'Dinâmica do dia',
    'Reuniões', 
    'Comunicação',
    'Espaço de trabalho',
    'Foco / Produtividade',
    'Colaboração',
    'Nada a destacar hoje'
  ]
  
  categories.forEach(cat => {
    stats.positive[cat] = 0
    stats.negative[cat] = 0
  })
  
  dayFeedback.forEach((feedback: FeedbackData) => {
    feedback.positive.forEach((cat: string) => {
      if (stats.positive[cat] !== undefined) {
        stats.positive[cat]++
      }
    })
    feedback.negative.forEach((cat: string) => {
      if (stats.negative[cat] !== undefined) {
        stats.negative[cat]++
      }
    })
  })
  
  return stats
}