'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface StatsData {
  total: number
  positive: Record<string, number>
  negative: Record<string, number>
}

const CATEGORIES = [
  'Dinâmica do dia',
  'Reuniões', 
  'Comunicação',
  'Espaço de trabalho',
  'Foco / Produtividade',
  'Colaboração'
]

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Conexão SSE para tempo real
  useEffect(() => {
    // Carregar dados iniciais
    fetchStats()

    // Conectar ao stream SSE
    const eventSource = new EventSource('/api/stats?stream=true')
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setStats(data)
        setLastUpdate(new Date())
        setLoading(false)
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      eventSource.close()
      
      // Fallback para polling se SSE falhar
      const interval = setInterval(fetchStats, 10000)
      return () => clearInterval(interval)
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const chartData = CATEGORIES.map(category => ({
    category: category.length > 15 ? category.substring(0, 12) + '...' : category,
    fullCategory: category,
    positivo: stats?.positive[category] || 0,
    negativo: stats?.negative[category] || 0
  }))

  const totalPositive = Object.values(stats?.positive || {}).reduce((sum, count) => sum + count, 0)
  const totalNegative = Object.values(stats?.negative || {}).reduce((sum, count) => sum + count, 0)

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-positive mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard de Feedback</h1>
            <p className="text-gray-600 mt-1">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Tempo real - Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="bg-positive text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300"
          >
            {loading ? 'Atualizando...' : '🔄 Atualizar'}
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Feedbacks</h3>
            <div className="text-4xl font-bold text-gray-900">{stats?.total || 0}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-positive">
            <h3 className="text-lg font-semibold text-positive mb-2">Total Positivo</h3>
            <div className="text-4xl font-bold text-positive">{totalPositive}</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-negative">
            <h3 className="text-lg font-semibold text-negative mb-2">Total Negativo</h3>
            <div className="text-4xl font-bold text-negative">{totalNegative}</div>
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Feedback por Categoria</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [value, name === 'positivo' ? 'Positivo' : 'Negativo']}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.category === label)
                  return item?.fullCategory || label
                }}
              />
              <Bar dataKey="positivo" name="positivo">
                <Cell fill="#10b981" />
              </Bar>
              <Bar dataKey="negativo" name="negativo">
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhes por Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const positive = stats?.positive[category] || 0
            const negative = stats?.negative[category] || 0
            const total = positive + negative
            
            if (total === 0) return null
            
            return (
              <div key={category} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">{category}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-positive font-medium">Positivo</span>
                    <span className="text-2xl font-bold text-positive">{positive}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-negative font-medium">Negativo</span>
                    <span className="text-2xl font-bold text-negative">{negative}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Total</span>
                      <span className="font-bold text-gray-800">{total}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}