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
      <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-pulse flex space-x-3 justify-center mb-6">
            <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce"></div>
            <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-4 w-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="text-2xl text-gray-400">Carregando feedback do dia...</div>
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

  // Estado especial: Sem dados ainda
  if (hasNoData) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
        {/* Cabeçalho */}
        <header className="text-center py-4 px-8">
          <h1 className="text-3xl font-light text-gray-300 mb-1">Feedback do Dia — Hoje</h1>
          <p className="text-lg text-gray-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </header>

        {/* Conteúdo único sem dados */}
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-8 animate-pulse">⏳</div>
            <h2 className="text-5xl font-light text-gray-300 mb-4">Aguardando feedbacks</h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto">
              O espaço está pronto para as primeiras impressões do dia
            </p>
          </div>
        </div>
      </div>
    )
  }

  const mood = getDayMood()

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Cabeçalho discreto */}
      <header className="text-center py-4 px-8">
        <h1 className="text-3xl font-light text-gray-300 mb-1">Feedback do Dia — Hoje</h1>
        <p className="text-lg text-gray-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <div className="flex items-center justify-center mt-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-gray-600">tempo real</span>
        </div>
      </header>

      {/* Painel único com grid */}
      <div className="h-[calc(100vh-8rem)] px-8 grid grid-rows-[1fr_1fr_1fr] gap-6">
        
        {/* Hero - Balanço Principal */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            {/* Indicador visual principal */}
            <div className="relative mb-8">
              {/* Balanço visual */}
              <div className="w-64 h-64 mx-auto relative">
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
                  <div className="text-7xl">{mood.emoji}</div>
                </div>
              </div>
            </div>
            
            {/* Texto principal */}
            <h2 className="text-5xl font-light text-gray-200 mb-2">
              {mood.text}
            </h2>
            <p className="text-xl text-gray-400 mb-4">
              {mood.status}
            </p>
            
            {/* Percentual */}
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-3000"
                style={{ width: `${ratio * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* O que funcionou bem */}
        <div className="flex items-center">
          <div className="w-full">
            <div className="text-center mb-6">
              <h3 className="text-4xl font-light bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">
                O que funcionou bem
              </h3>
            </div>
            
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
              {CATEGORIES.map((category) => {
                const count = stats?.positive[category.label] || 0
                const maxCount = Math.max(...Object.values(stats?.positive || {}))
                const intensity = maxCount > 0 ? count / maxCount : 0
                
                if (count === 0) return null
                
                return (
                  <div key={category.id} className="text-center">
                    <div className={`
                      relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-900/30 to-green-800/20 
                      border border-green-800/50 flex items-center justify-center
                      ${intensity > 0.6 ? 'shadow-xl shadow-green-900/50' : ''}
                    `}>
                      <div className="text-2xl">{category.icon}</div>
                    </div>
                    
                    <div className="text-sm font-medium text-green-300 mt-2">
                      {category.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* O que não funcionou bem */}
        <div className="flex items-center">
          <div className="w-full">
            <div className="text-center mb-6">
              <h3 className="text-4xl font-light bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                O que não funcionou bem
              </h3>
            </div>
            
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
              {CATEGORIES.map((category) => {
                const count = stats?.negative[category.label] || 0
                const maxCount = Math.max(...Object.values(stats?.negative || {}))
                const intensity = maxCount > 0 ? count / maxCount : 0
                
                if (count === 0) return null
                
                return (
                  <div key={category.id} className="text-center">
                    <div className={`
                      relative w-16 h-16 rounded-2xl bg-gradient-to-br from-red-900/30 to-red-800/20 
                      border border-red-800/50 flex items-center justify-center
                      ${intensity > 0.6 ? 'shadow-xl shadow-red-900/50' : ''}
                    `}>
                      <div className="text-2xl">{category.icon}</div>
                    </div>
                    
                    <div className="text-sm font-medium text-red-300 mt-2">
                      {category.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}