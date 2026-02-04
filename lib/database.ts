import Database from 'better-sqlite3'
import { join } from 'path'

const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/tmp/feedback.db' 
  : join(process.cwd(), 'feedback.db')

export interface FeedbackData {
  id?: number
  positive: string[]
  negative: string[]
  date: string
  source: string
}

export function getDatabase() {
  const db = new Database(DB_PATH)
  
  // Criar tabela se não existir
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      positive TEXT NOT NULL,
      negative TEXT NOT NULL,
      date TEXT NOT NULL,
      source TEXT NOT NULL
    )
  `)
  
  return db
}

export function saveFeedback(data: FeedbackData): number {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO feedback (positive, negative, date, source)
    VALUES (?, ?, ?, ?)
  `)
  
  const result = stmt.run([
    JSON.stringify(data.positive),
    JSON.stringify(data.negative),
    data.date,
    data.source
  ])
  
  db.close()
  return result.lastInsertRowid as number
}

export function getAllFeedback(): FeedbackData[] {
  const db = getDatabase()
  const rows = db.prepare(`
    SELECT * FROM feedback ORDER BY date DESC
  `).all() as any[]
  
  const feedback = rows.map(row => ({
    id: row.id,
    positive: JSON.parse(row.positive),
    negative: JSON.parse(row.negative),
    date: row.date,
    source: row.source
  }))
  
  db.close()
  return feedback
}

export function getFeedbackStats() {
  const db = getDatabase()
  const rows = db.prepare(`
    SELECT positive, negative FROM feedback
  `).all() as any[]
  
  const allFeedback = rows.map(row => ({
    positive: JSON.parse(row.positive),
    negative: JSON.parse(row.negative)
  }))
  
  const categories = [
    'Dinâmica do dia',
    'Reuniões', 
    'Comunicação',
    'Espaço de trabalho',
    'Foco / Produtividade',
    'Colaboração'
  ]
  
  const stats = {
    total: rows.length,
    positive: {} as Record<string, number>,
    negative: {} as Record<string, number>
  }
  
  categories.forEach(cat => {
    stats.positive[cat] = 0
    stats.negative[cat] = 0
  })
  
  allFeedback.forEach(feedback => {
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
  
  db.close()
  return stats
}