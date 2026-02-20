'use client'

import { useState, useEffect } from 'react'

interface StatsData {
  total: number
  positive: Record<string, number>
  negative: Record<string, number>
}

interface DayStats {
  date: string
  data: StatsData | null
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
  const [dayStats, setDayStats] = useState<DayStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  // Função para limpar todos os dados
  const clearAllData = async () => {
    if (confirm('Tem certeza que deseja zerar todos os dados?')) {
      try {
        await fetch('/api/feedback/clear', { method: 'POST' })
        window.location.reload()
      } catch (error) {
        console.error('Error clearing data:', error)
      }
    }
  }

  // Função para formatar data
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

  // Função para buscar dados de uma data específica
  const fetchDayStats = async (date: Date) => {
    try {
      setLoading(true)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
      
      // Para MVP, vamos simular dados por dia
      // Em produção, isso buscaria no banco de dados por data
      const response = await fetch('/api/stats')
      if (response.ok) {
        const allStats = await response.json()
        
        // Simulação: filtrar por data (no MVP, retorna dados do dia atual)
        // Futuro: implementar filtro real no backend
        setDayStats({
          date: dateStr,
          data: allStats
        })
      }
    } catch (error) {
      console.error('Error fetching day stats:', error)
      setDayStats({
        date: date.toISOString().split('T')[0],
        data: null
      })
    } finally {
      setLoading(false)
    }
  }

  // Navegar para dia anterior
  const goToPreviousDay = () => {
    setTransitioning(true)
    setTimeout(() => {
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() - 1)
      setSelectedDate(newDate)
      fetchDayStats(newDate)
      setTimeout(() => setTransitioning(false), 500)
    }, 200)
  }

  // Navegar para dia seguinte
  const goToNextDay = () => {
    const today = new Date()
    if (selectedDate < today) {
      setTransitioning(true)
      setTimeout(() => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + 1)
        setSelectedDate(newDate)
        fetchDayStats(newDate)
        setTimeout(() => setTransitioning(false), 500)
      }, 200)
    }
  }

  useEffect(() => {
    fetchDayStats(selectedDate)
    
    // Conexão SSE para tempo real (só quando for hoje)
    const today = new Date()
    if (selectedDate.toDateString() === today.toDateString()) {
      const eventSource = new EventSource('/api/stats?stream=true')
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setDayStats({
            date: selectedDate.toISOString().split('T')[0],
            data
          })
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
    }
  }, [selectedDate])

  const stats = dayStats?.data
  const isToday = selectedDate.toDateString() === new Date().toDateString()

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
        {/* Filtro de data no canto superior esquerdo */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
            <button
              onClick={goToPreviousDay}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              ◀
            </button>
            <span className="text-gray-200 font-medium min-w-[60px] text-center">
              {formatDateForDisplay(selectedDate)}
            </span>
            <button
              onClick={goToNextDay}
              disabled={selectedDate >= new Date()}
              className={`${selectedDate >= new Date() ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-gray-200'} transition-colors`}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Cabeçalho alinhado */}
        <header className="text-center py-4 px-8">
          <h1 className="text-3xl font-light text-gray-300 mb-1">
            Feedback do Dia — {formatDateForDisplay(selectedDate)}
          </h1>
          {isToday && (
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm text-gray-600">tempo real</span>
            </div>
          )}
        </header>

        {/* Conteúdo único sem dados */}
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-8 animate-pulse">⏳</div>
            <h2 className="text-5xl font-light text-gray-300 mb-4">Aguardando feedbacks</h2>
            <p className="text-2xl text-gray-500 max-w-3xl mx-auto mb-12">
              O espaço está pronto para as primeiras impressões do dia
            </p>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
              <div className="h-full w-1/2 bg-gradient-to-r from-gray-600 to-gray-400 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Botão para limpar dados */}
        <button
          onClick={clearAllData}
          className="absolute bottom-4 right-4 px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 text-sm rounded-lg transition-colors border border-red-800"
        >
          🗑️ Zerar dados
        </button>
      </div>
    )
  }

  const mood = getDayMood()

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Filtro de data no canto superior esquerdo */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
          <button
            onClick={goToPreviousDay}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ◀
          </button>
          <span className="text-gray-200 font-medium min-w-[60px] text-center">
            {formatDateForDisplay(selectedDate)}
          </span>
          <button
            onClick={goToNextDay}
            disabled={selectedDate >= new Date()}
            className={`${selectedDate >= new Date() ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-gray-200'} transition-colors`}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Cabeçalho alinhado com filtro */}
      <header className="text-center py-4 px-8">
        <h1 className="text-3xl font-light text-gray-300 mb-1">
          Feedback do Dia — {formatDateForDisplay(selectedDate)}
        </h1>
        {isToday && (
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-gray-600">tempo real</span>
          </div>
        )}
      </header>

      {/* Painel principal com transição */}
      <div className={`h-[calc(100vh-8rem)] px-8 grid grid-rows-[1fr_1fr_1fr] gap-6 transition-opacity duration-500 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
        
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

        {/* Botão para limpar dados */}
        <button
          onClick={clearAllData}
          className="absolute bottom-4 right-4 px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 text-sm rounded-lg transition-colors border border-red-800"
        >
          🗑️ Zerar dados
        </button>
      </div>
    </div>
  )
}