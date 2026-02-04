// Inicializa o banco de dados na Vercel
const { getDatabase } = require('../lib/database')

console.log('Initializing database...')
const db = getDatabase()
db.close()
console.log('Database initialized successfully!')