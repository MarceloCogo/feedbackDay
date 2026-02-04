// Inicializa o banco de dados na Vercel
const { getDatabase } = require('../lib/database')

console.log('Initializing database...')
try {
  const db = getDatabase()
  db.close()
  console.log('Database initialized successfully!')
} catch (error) {
  console.error('Database initialization failed:', error)
}