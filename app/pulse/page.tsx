'use client'

import { useState, useEffect } from 'react'

interface StatsData {
  total: number
  positive: Record<string, number>
  negative: Record<string, number>
}

const CATEGORIES = [
  { id: 'dinamica', label: 'Dinâmica do dia', icon: '📅' },
  { id: 'reunioes', label: 'Reuniões', icon: '👥' },
  { id: 'comunicacao', label: 'Comunicação', icon: '💬' },
  { id: 'espaco', label: 'Espaço de trabalho', icon: '🏢' },
  { id: 'foco', label: 'Foco / Produtividade', icon: '🎯' },
  { id: 'colaboracao', label: 'Colaboração', icon: '🤝' }
]

export default function PulsePage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Conexão SSE para tempo real
    const eventSource = new EventSource('/api/stats?stream=true')
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setStats(data)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse flex space-x-3 justify-center mb-6">
            <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce"></div>
            <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="text-2xl text-gray-400">Carregando clima do time...</div>
        </div>
      </div>
    )
  }

  const totalPositive = Object.values(stats?.positive || {}).reduce((sum, count) => sum + count, 0)
  const totalNegative = Object.values(stats?.negative || {}).reduce((sum, count) => sum + count, 0)
  const total = totalPositive + totalNegative
  const hasNoData = total === 0
  const hasOnlyPositive = totalPositive > 0 && totalNegative === 0
  const hasOnlyNegative = totalNegative > 0 && totalPositive === 0
  const ratio = total > 0 ? totalPositive / total : 0.5
  
  const getDayMood = () => {
    if (hasNoData) return { emoji: '⏳', color: 'from-gray-600 to-gray-400', text: 'Aguardando', status: 'Sem dados' }
    if (hasOnlyPositive) return { emoji: '🎉', color: 'from-green-500 to-green-300', text: 'Excelente', status: 'Só positividade' }
    if (hasOnlyNegative) return { emoji: '🎯', color: 'from-red-500 to-red-300', text: 'Foco em desafios', status: 'Só desafios' }
    if (ratio > 0.7) return { emoji: '🌟', color: 'from-green-600 to-green-400', text: 'Excelente', status: 'Dia muito positivo' }
    if (ratio > 0.6) return { emoji: '✨', color: 'from-green-500 to-green-300', text: 'Bom', status: 'Dia positivo' }
    if (ratio > 0.4) return { emoji: '⚖️', color: 'from-yellow-500 to-yellow-300', text: 'Equilibrado', status: 'Dia equilibrado' }
    if (ratio > 0.3) return { emoji: '🌗', color: 'from-orange-500 to-orange-300', text: 'Desafiador', status: 'Dia desafiador' }
    return { emoji: '🌑', color: 'from-red-600 to-red-400', text: 'Difícil', status: 'Dia difícil' }
  }

  const getData = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }
    return date.toLocaleDateString('pt-BR', options)
  }

  const getReflectionMessage = () => {
    if (hasNoData) return "O dia está começando e o tempo está aberto para novas histórias."
    if (hasOnlyPositive) return "Hoje celebramos cada conquista. Amanhã construímos sobre esse sucesso."
    if (hasOnlyNegative) return "Cada desafio hoje é uma oportunidade amanhã."
    if (ratio > 0.7) return "Hoje florescemos em conjunto. Amanhã cultivamos mais."
    if (ratio > 0.5) return "O equilíbrio de hoje fortalece o amanhã."
    return "Aprendendo hoje para crescermos amanhã."
  }

  // Estado especial: Sem dados ainda
  if (hasNoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Cabeçalho */}
        <header className="text-center py-6 px-8">
          <h1 className="text-4xl font-light text-gray-300 mb-2">Clima do Time — Hoje</h1>
          <p className="text-xl text-gray-500">{getData()}</p>
        </header>

        {/* Hero - Sem dados */}
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl mb-8 animate-pulse">⏳</div>
            <h2 className="text-6xl font-light text-gray-300 mb-4">Aguardando feedbacks</h2>
            <p className="text-2xl text-gray-500 max-w-3xl mx-auto mb-12">
              O espaço está pronto para as primeiras impressões do dia
            </p>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div className="h-full w-1/2 bg-gradient-to-r from-gray-600 to-gray-400 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Seções vazias */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-6">📊</div>
            <p className="text-3xl text-gray-400">O clima do time aparece aqui</p>
          </div>
        </div>

        {/* Mensagem final */}
        <footer className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-4xl">
            <p className="text-4xl font-light text-gray-400 italic">
              "O tempo está aberto. Cada feedback constrói nossa história."
            </p>
          </div>
        </footer>
      </div>
    )
  }

  const mood = getDayMood()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Cabeçalho discreto */}
      <header className="text-center py-6 px-8">
        <h1 className="text-4xl font-light text-gray-300 mb-2">Clima do Time — Hoje</h1>
        <p className="text-xl text-gray-500">{getData()}</p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-gray-600">tempo real</span>
        </div>
      </header>

      {/* Hero Visual Principal */}
      <section className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-6xl mx-auto">
          {/* Indicador visual principal */}
          <div className="relative mb-12">
            {/* Balanço visual gigante */}
            <div className="w-96 h-96 mx-auto relative">
              {/* Círculo de fundo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-50"></div>
              
              {/* Divisão proporcional */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 right-0 bg-gradient-to-br ${mood.color} transition-all duration-3000`}
                  style={{ height: `${ratio * 100}%` }}
                ></div>
              </div>
              
              {/* Centro com emoji */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-9xl">{mood.emoji}</div>
              </div>
            </div>
          </div>
          
          {/* Texto principal */}
          <h2 className="text-6xl font-light text-gray-200 mb-4">
            {mood.text}
          </h2>
          <p className="text-2xl text-gray-400 mb-8">
            {mood.status}
          </p>
          
          {/* Percentual */}
          <div className="w-96 h-3 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-3000"
              style={{ width: `${ratio * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* O que funcionou bem */}
      <section className="min-h-screen py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-light bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-4">
              O que funcionou bem
            </h3>
            <p className="text-2xl text-gray-400">Nossas conquistas hoje</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((category) => {
              const count = stats?.positive[category.label] || 0
              const maxCount = Math.max(...Object.values(stats?.positive || {}))
              const intensity = maxCount > 0 ? count / maxCount : 0
              
              if (count === 0) return null
              
              return (
                <div key={category.id} className="text-center">
                  <div className={`
                    relative w-48 h-48 mx-auto rounded-3xl bg-gradient-to-br from-green-900/30 to-green-800/20 
                    backdrop-blur-sm border-2 border-green-800/50 flex items-center justify-center
                    ${intensity > 0.6 ? 'shadow-2xl shadow-green-900/50' : ''}
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 to-transparent"></div>
                    <div className="text-6xl mb-2">{category.icon}</div>
                  </div>
                  
                  {/* Barra de intensidade visual */}
                  <div className="mt-6 w-48 h-2 bg-green-900/50 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-2000"
                      style={{ width: `${intensity * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-2xl font-medium text-green-300 mt-4">
                    {category.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* O que não funcionou bem */}
      <section className="min-h-screen py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-light bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
              O que não funcionou bem
            </h3>
            <p className="text-2xl text-gray-400">Nossos desafios hoje</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((category) => {
              const count = stats?.negative[category.label] || 0
              const maxCount = Math.max(...Object.values(stats?.negative || {}))
              const intensity = maxCount > 0 ? count / maxCount : 0
              
              if (count === 0) return null
              
              return (
                <div key={category.id} className="text-center">
                  <div className={`
                    relative w-48 h-48 mx-auto rounded-3xl bg-gradient-to-br from-red-900/30 to-red-800/20 
                    backdrop-blur-sm border-2 border-red-800/50 flex items-center justify-center
                    ${intensity > 0.6 ? 'shadow-2xl shadow-red-900/50' : ''}
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-transparent"></div>
                    <div className="text-6xl mb-2">{category.icon}</div>
                  </div>
                  
                  {/* Barra de intensidade visual */}
                  <div className="mt-6 w-48 h-2 bg-red-900/50 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-2000"
                      style={{ width: `${intensity * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-2xl font-medium text-red-300 mt-4">
                    {category.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mensagem final */}
      <footer className="min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-4xl">
          <p className="text-4xl font-light text-gray-400 italic">
            "{getReflectionMessage()}"
          </p>
        </div>
      </footer>
    </div>
  )
}