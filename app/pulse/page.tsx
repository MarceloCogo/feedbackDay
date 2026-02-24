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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  const formatDateForDisplay = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const fetchStats = async (date: Date) => {
    try {
      setLoading(true)
      const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
      const response = await fetch(`/api/stats?date=${dateStr}`)
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

  const goToPreviousDay = () => {
    setTransitioning(true)
    setTimeout(() => {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() - 1)
      setSelectedDate(newDate)
      fetchStats(newDate)
      setTimeout(() => setTransitioning(false), 300)
    }, 150)
  }

  const goToNextDay = () => {
    const today = new Date()
    if (selectedDate < today) {
      setTransitioning(true)
      setTimeout(() => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + 1)
        setSelectedDate(newDate)
        fetchStats(newDate)
        setTimeout(() => setTransitioning(false), 300)
      }, 150)
    }
  }

  const clearSelectedDayData = async () => {
    const dateStr = selectedDate.toLocaleDateString('en-CA')
    if (confirm(`Tem certeza que deseja zerar os dados do dia ${formatDateForDisplay(selectedDate)}?`)) {
      try {
        await fetch(`/api/feedback/clear?date=${dateStr}`, { method: 'POST' })
        // Refetch stats after clearing
        fetchStats(selectedDate)
      } catch (error) {
        console.error('Error clearing data:', error)
      }
    }
  }

  useEffect(() => {
    fetchStats(selectedDate)

    const today = new Date()
    if (selectedDate.toDateString() === today.toDateString()) {
      const dateStr = selectedDate.toLocaleDateString('en-CA')
      const eventSource = new EventSource(`/api/stats?stream=true&date=${dateStr}`)
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setStats(data)
        } catch (error) {
          console.error('Error parsing SSE data:', error)
        }
      }
      return () => eventSource.close()
    }
  }, [selectedDate])

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const goToToday = () => {
    setTransitioning(true)
    setTimeout(() => {
      const today = new Date()
      setSelectedDate(today)
      fetchStats(today)
      setTimeout(() => setTransitioning(false), 300)
    }, 150)
  }

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
  const ratio = total > 0 ? totalPositive / total : 0.5

  const getDayMood = () => {
    if (hasNoData) return { emoji: '⏳', color: 'from-gray-600 to-gray-400', text: 'Aguardando' }
    if (ratio > 0.7) return { emoji: '🌟', color: 'from-green-600 to-green-400', text: 'Excelente' }
    if (ratio > 0.5) return { emoji: '✨', color: 'from-green-500 to-green-300', text: 'Bom' }
    if (ratio > 0.4) return { emoji: '⚖️', color: 'from-yellow-500 to-yellow-300', text: 'Equilibrado' }
    if (ratio > 0.3) return { emoji: '🌗', color: 'from-orange-500 to-orange-300', text: 'Desafiador' }
    return { emoji: '🌑', color: 'from-red-600 to-red-400', text: 'Difícil' }
  }

  // Ordenar categorias por quantidade (maior para menor)
  const sortedPositiveCategories = CATEGORIES
    .map(cat => ({ ...cat, count: stats?.positive[cat.label] || 0 }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)

  const sortedNegativeCategories = CATEGORIES
    .map(cat => ({ ...cat, count: stats?.negative[cat.label] || 0 }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)

  const mood = getDayMood()

  if (hasNoData) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50">
          <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-3 py-2">
            <button onClick={goToPreviousDay} className="text-gray-400 hover:text-gray-200 text-lg">◀</button>
            <span className="text-gray-200 font-medium min-w-[70px] text-center">{formatDateForDisplay(selectedDate)}</span>
            <button onClick={goToNextDay} disabled={isToday} className={`text-lg ${isToday ? 'text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}>▶</button>
          </div>

          <h1 className="text-2xl font-light text-gray-300">Feedback do Dia</h1>

          <div className="flex items-center gap-4">
            {!isToday && <button onClick={goToToday} className="px-3 py-1 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 text-xs rounded border border-blue-800">Hoje</button>}
            {isToday && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
            <button onClick={clearSelectedDayData} className="px-3 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-xs rounded border border-red-800">🗑️ Zerar</button>
          </div>
        </div>

        {/* Centro */}
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="text-7xl mb-6 animate-pulse">⏳</div>
            <h2 className="text-4xl font-light text-gray-300 mb-3">Aguardando feedbacks</h2>
            <p className="text-xl text-gray-500">O espaço está pronto para as primeiras impressões</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50">
        <div className="flex items-center space-x-3 bg-gray-800 rounded-lg px-3 py-2">
          <button onClick={goToPreviousDay} className="text-gray-400 hover:text-gray-200 text-lg">◀</button>
          <span className="text-gray-200 font-medium min-w-[70px] text-center">{formatDateForDisplay(selectedDate)}</span>
          <button onClick={goToNextDay} disabled={isToday} className={`text-lg ${isToday ? 'text-gray-700' : 'text-gray-400 hover:text-gray-200'}`}>▶</button>
        </div>
        
        <h1 className="text-2xl font-light text-gray-300">Feedback do Dia</h1>
        
        <div className="flex items-center gap-4">
          {!isToday && <button onClick={goToToday} className="px-3 py-1 bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 text-xs rounded border border-blue-800">Hoje</button>}
          {isToday && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
          <button onClick={clearSelectedDayData} className="px-3 py-1 bg-red-900/30 hover:bg-red-800/50 text-red-400 text-xs rounded border border-red-800">🗑️ Zerar</button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className={`h-[calc(100vh-4rem)] px-2 py-1 md:px-4 md:py-2 grid grid-rows-[auto_auto_auto] gap-1 md:gap-2 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>

        {/* Linha 1: Emoji do clima + Status */}
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${mood.color} flex items-center justify-center shadow-lg`}>
            <span className="text-lg md:text-xl">{mood.emoji}</span>
          </div>
          <div className="text-center">
            <div className="text-sm md:text-base font-light text-gray-200">{mood.text}</div>
            <div className="text-[10px] md:text-xs text-gray-500">{total} votes</div>
          </div>
        </div>

        {/* Linha 2: Painéis Positive e Negative */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 min-h-0 overflow-hidden">

          {/* Painel Positive - Verde */}
          <div className="flex flex-col min-h-0 overflow-hidden bg-gray-900/20 rounded-lg p-2 md:p-3">
            <h3 className="text-sm md:text-lg font-light text-green-400 text-center mb-1 md:mb-2">O que funcionou bem</h3>
            <div className="flex-1 grid grid-cols-2 gap-1 md:gap-2 overflow-hidden">
              {sortedPositiveCategories.map((category, idx) => {
                const isTop = idx === 0 && category.count > 0
                return (
                  <div
                    key={category.id}
                    className={`
                      relative rounded-lg p-2 md:p-3 flex flex-col items-center justify-center min-h-[60px] md:min-h-[80px]
                      ${isTop ? 'bg-green-900/40 border-2 border-green-500/50 shadow-lg shadow-green-900/30' : 'bg-green-900/20 border border-green-800/30'}
                    `}
                  >
                    <div className="text-xl md:text-2xl mb-1">{category.icon}</div>
                    <div className="text-[10px] md:text-xs text-green-300 text-center leading-tight">{category.label}</div>
                    <div className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-green-950">
                      {category.count}
                    </div>
                  </div>
                )
              })}
              {sortedPositiveCategories.length === 0 && (
                <div className="col-span-2 text-center text-gray-600 text-sm">Nenhum</div>
              )}
            </div>
          </div>

          {/* Painel Negative - Vermelho */}
          <div className="flex flex-col min-h-0 overflow-hidden bg-gray-900/20 rounded-lg p-2 md:p-3">
            <h3 className="text-sm md:text-lg font-light text-red-400 text-center mb-1 md:mb-2">O que não funcionou bem</h3>
            <div className="flex-1 grid grid-cols-2 gap-1 md:gap-2 overflow-hidden">
              {sortedNegativeCategories.map((category, idx) => {
                const isTop = idx === 0 && category.count > 0
                return (
                  <div
                    key={category.id}
                    className={`
                      relative rounded-lg p-2 md:p-3 flex flex-col items-center justify-center min-h-[60px] md:min-h-[80px]
                      ${isTop ? 'bg-red-900/40 border-2 border-red-500/50 shadow-lg shadow-red-900/30' : 'bg-red-900/20 border border-red-800/30'}
                    `}
                  >
                    <div className="text-xl md:text-2xl mb-1">{category.icon}</div>
                    <div className="text-[10px] md:text-xs text-red-300 text-center leading-tight">{category.label}</div>
                    <div className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-red-950">
                      {category.count}
                    </div>
                  </div>
                )
              })}
              {sortedNegativeCategories.length === 0 && (
                <div className="col-span-2 text-center text-gray-600 text-sm">Nenhum</div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de equilíbrio */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mt-1 md:mt-2">
          <div className="text-green-400 font-medium text-sm md:text-base">{totalPositive} positivos</div>
          <div className="flex-1 max-w-xs md:max-w-md h-3 md:h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
              style={{ width: `${ratio * 100}%` }}
            ></div>
          </div>
          <div className="text-red-400 font-medium text-sm md:text-base">{totalNegative} negativos</div>
        </div>
      </div>
    </div>
  )
}