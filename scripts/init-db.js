// Inicializa o banco de dados na Vercel
const Database = require('better-sqlite3')
const { join } = require('path')

console.log('Initializing database...')
try {
  const DB_PATH = process.env.NODE_ENV === 'production' 
    ? '/tmp/feedback.db' 
    : join(__dirname, '../feedback.db')
  
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
  
  db.close()
  console.log('Database initialized successfully!')
} catch (error) {
  console.error('Database initialization failed:', error)
}