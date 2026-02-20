// Banco de dados em memória - funciona em ambiente serverless
// Os dados persistem durante a execução da função (até cold start)

interface FeedbackData {
  id: number
  positive: string[]
  negative: string[]
  date: string
  source: string
  createdAt: number
}

// Armazenamento em memória (global para persistir entre requisições)
const globalStore = global as unknown as {
  feedbackStore: FeedbackData[]
  nextId: number
}

if (!globalStore.feedbackStore) {
  globalStore.feedbackStore = []
  globalStore.nextId = 1
}

const feedbackStore = globalStore.feedbackStore
const nextId = globalStore.nextId

export interface FeedbackInput {
  positive: string[]
  negative: string[]
  date: string
  source: string
}

export function saveFeedback(data: FeedbackInput): number {
  const id = nextId
  globalStore.nextId++
  
  feedbackStore.push({
    id,
    positive: data.positive,
    negative: data.negative,
    date: data.date,
    source: data.source,
    createdAt: Date.now()
  })
  
  return id
}

export function getAllFeedback(): FeedbackData[] {
  return [...feedbackStore].sort((a, b) => b.createdAt - a.createdAt)
}

export function getFeedbackByDate(dateStr: string): FeedbackData[] {
  return feedbackStore
    .filter(f => f.date.startsWith(dateStr))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function getFeedbackStats() {
  const stats = {
    total: feedbackStore.length,
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
  
  feedbackStore.forEach(feedback => {
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

export function getFeedbackStatsByDate(dateStr: string) {
  const dayFeedback = feedbackStore.filter(f => f.date.startsWith(dateStr))
  
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
  
  dayFeedback.forEach(feedback => {
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