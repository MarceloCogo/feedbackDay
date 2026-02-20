import { Redis } from '@upstash/redis'

// Verificar se Redis está configurado
const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

// Inicializar cliente Redis apenas se configurado
let redis: Redis | null = null

if (hasRedisConfig) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

interface FeedbackData {
  id: number
  positive: string[]
  negative: string[]
  date: string
  source: string
  createdAt: number
}

// Fallback em memória para desenvolvimento local
const memoryStore: { feedbacks: FeedbackData[]; nextId: number } = {
  feedbacks: [],
  nextId: 1
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
  // Se não tem Redis configurado, usar memória
  if (!redis) {
    const feedback: FeedbackData = {
      id: memoryStore.nextId++,
      positive: data.positive,
      negative: data.negative,
      date: data.date,
      source: data.source,
      createdAt: Date.now()
    }
    memoryStore.feedbacks.push(feedback)
    console.log('[Memory] Saved feedback:', feedback.id)
    return feedback.id
  }

  // Com Redis
  try {
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
    
    const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
    feedbacks.push(feedback)
    
    await redis.set(FEEDBACKS_KEY, feedbacks)
    await redis.set(NEXT_ID_KEY, nextId + 1)
    
    return nextId
  } catch (error) {
    console.error('[Redis] Error saving feedback:', error)
    throw error
  }
}

export async function getAllFeedback(): Promise<FeedbackData[]> {
  if (!redis) {
    return [...memoryStore.feedbacks].sort((a, b) => b.createdAt - a.createdAt)
  }

  try {
    const feedbacks = await redis.get<FeedbackData[]>(FEEDBACKS_KEY) || []
    return feedbacks.sort((a: FeedbackData, b: FeedbackData) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('[Redis] Error getting feedbacks:', error)
    return [...memoryStore.feedbacks]
  }
}

export async function getFeedbackStats() {
  const feedbacks = await getAllFeedback()
  
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
  const feedbacks = await getAllFeedback()
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