import sqlite3 from 'sqlite3'
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
  const db = new sqlite3.Database(DB_PATH)
  
  // Criar tabela se não existir
  db.run(`
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

export function saveFeedback(data: FeedbackData): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT INTO feedback (positive, negative, date, source)
      VALUES (?, ?, ?, ?)
    `)
    
    stmt.run([
      JSON.stringify(data.positive),
      JSON.stringify(data.negative),
      data.date,
      data.source
    ], function(err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.lastID)
      }
    })
    
    stmt.finalize()
    db.close()
  })
}

export function getAllFeedback(): Promise<FeedbackData[]> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.all(`
      SELECT * FROM feedback ORDER BY date DESC
    `, (err, rows: any[]) => {
      if (err) {
        reject(err)
      } else {
        const feedback = rows.map(row => ({
          id: row.id,
          positive: JSON.parse(row.positive),
          negative: JSON.parse(row.negative),
          date: row.date,
          source: row.source
        }))
        resolve(feedback)
      }
    })
    
    db.close()
  })
}

export function getFeedbackStats() {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.all(`
      SELECT positive, negative FROM feedback
    `, (err, rows: any[]) => {
      if (err) {
        reject(err)
      } else {
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
        
        resolve(stats)
      }
    })
    
    db.close()
  })
}