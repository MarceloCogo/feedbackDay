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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse flex space-x-2 justify-center">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-bounce"></div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-3 w-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  const totalPositive = Object.values(stats?.positive || {}).reduce((sum, count) => sum + count, 0)
  const totalNegative = Object.values(stats?.negative || {}).reduce((sum, count) => sum + count, 0)
  const ratio = totalPositive + totalNegative > 0 ? totalPositive / (totalPositive + totalNegative) : 0.5
  
  const getDayMood = () => {
    if (ratio > 0.7) return { emoji: '🌟', color: 'from-green-600 to-green-400', text: 'Excelente' }
    if (ratio > 0.6) return { emoji: '✨', color: 'from-green-500 to-green-300', text: 'Bom' }
    if (ratio > 0.4) return { emoji: '⚖️', color: 'from-yellow-500 to-yellow-300', text: 'Equilibrado' }
    if (ratio > 0.3) return { emoji: '🌗', color: 'from-orange-500 to-orange-300', text: 'Desafiador' }
    return { emoji: '🌑', color: 'from-red-600 to-red-400', text: 'Difícil' }
  }

  const mood = getDayMood()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center px-4">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)]"></div>
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Como foi o dia do time?
          </h1>
          
          <div className="mt-16 relative">
            {/* Day Mood Indicator */}
            <div className={`w-64 h-64 mx-auto rounded-full bg-gradient-to-br ${mood.color} shadow-2xl flex items-center justify-center transform transition-all duration-1000 hover:scale-105`}>
              <div className="text-8xl animate-pulse">{mood.emoji}</div>
            </div>
            
            {/* Mood Text */}
            <div className="mt-8 text-2xl font-light text-gray-300">
              {mood.text}
            </div>
            
            {/* Visual Balance Bar */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                  style={{ width: `${ratio * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {Math.round(ratio * 100)}% positivo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Positive Section */}
      <div className="relative py-32 px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-950/20"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              O que funcionou bem
            </h2>
            <div className="text-gray-400 text-xl">Nossas conquistas hoje</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((category) => {
              const count = stats?.positive[category.label] || 0
              const maxCount = Math.max(...Object.values(stats?.positive || {}))
              const intensity = maxCount > 0 ? count / maxCount : 0
              
              return (
                <div
                  key={category.id}
                  className={`
                    relative group cursor-pointer transform transition-all duration-500 hover:scale-105
                    ${intensity > 0.6 ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : ''}
                  `}
                >
                  <div className={`
                    bg-gradient-to-br from-green-900/30 to-green-800/20 
                    backdrop-blur-sm rounded-2xl p-8 border border-green-800/50
                    ${intensity > 0.3 ? 'shadow-lg shadow-green-900/50' : ''}
                  `}>
                    <div className="text-4xl mb-4 text-center">{category.icon}</div>
                    <div className="text-xl font-semibold text-green-300 text-center mb-2">
                      {category.label}
                    </div>
                    
                    {/* Visual Intensity Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-green-900/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                          style={{ width: `${intensity * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Count on hover */}
                    <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-3xl font-bold text-green-400">{count}</div>
                      <div className="text-sm text-green-300">menções</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Negative Section */}
      <div className="relative py-32 px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              O que não funcionou bem
            </h2>
            <div className="text-gray-400 text-xl">Nossos desafios hoje</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((category) => {
              const count = stats?.negative[category.label] || 0
              const maxCount = Math.max(...Object.values(stats?.negative || {}))
              const intensity = maxCount > 0 ? count / maxCount : 0
              
              return (
                <div
                  key={category.id}
                  className={`
                    relative group cursor-pointer transform transition-all duration-500 hover:scale-105
                    ${intensity > 0.6 ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-gray-900' : ''}
                  `}
                >
                  <div className={`
                    bg-gradient-to-br from-red-900/30 to-red-800/20 
                    backdrop-blur-sm rounded-2xl p-8 border border-red-800/50
                    ${intensity > 0.3 ? 'shadow-lg shadow-red-900/50' : ''}
                  `}>
                    <div className="text-4xl mb-4 text-center">{category.icon}</div>
                    <div className="text-xl font-semibold text-red-300 text-center mb-2">
                      {category.label}
                    </div>
                    
                    {/* Visual Intensity Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-red-900/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000"
                          style={{ width: `${intensity * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Count on hover */}
                    <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-3xl font-bold text-red-400">{count}</div>
                      <div className="text-sm text-red-300">menções</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Balance Visual */}
      <div className="relative py-32 px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              Balanço do dia
            </h2>
            <div className="text-gray-400 text-xl">A história do nosso hoje</div>
          </div>
          
          <div className="relative h-96 bg-gradient-to-r from-green-950/20 to-red-950/20 rounded-3xl backdrop-blur-sm border border-gray-800 overflow-hidden">
            <div className="absolute inset-0 flex">
              <div 
                className="bg-gradient-to-b from-green-600/40 to-green-400/40 transition-all duration-1000"
                style={{ width: `${ratio * 100}%` }}
              ></div>
              <div 
                className="bg-gradient-to-b from-red-600/40 to-red-400/40 transition-all duration-1000"
                style={{ width: `${(1 - ratio) * 100}%` }}
              ></div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl md:text-9xl font-bold">
                  {ratio > 0.5 ? (
                    <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                      {totalPositive}
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                      {totalNegative}
                    </span>
                  )}
                </div>
                <div className="text-2xl text-gray-400 mt-4">
                  {ratio > 0.5 ? 'positivos' : 'desafios'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between text-gray-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{totalPositive}</div>
              <div>Positivos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">{stats?.total || 0}</div>
              <div>Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{totalNegative}</div>
              <div>Desafios</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}