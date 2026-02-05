'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard de Feedback</h1>
            <p className="text-gray-600 mt-1">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Tempo real - Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </p>
          </div>
          <button
            onClick={() => router.push('/pulse')}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            🌊 Ver Clima do Time
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Feedbacks</h3>
            <div className="text-4xl font-bold text-gray-900">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-positive">
            <h3 className="text-lg font-semibold text-positive mb-2">Total Positivo</h3>
            <div className="text-4xl font-bold text-positive">0</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-negative">
            <h3 className="text-lg font-semibold text-negative mb-2">Total Negativo</h3>
            <div className="text-4xl font-bold text-negative">0</div>
          </div>
        </div>

        {/* Placeholder para gráficos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Feedback por Categoria</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Carregando estatísticas...
          </div>
        </div>

        {/* Placeholder para categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Dinâmica do dia', 'Reuniões', 'Comunicação', 'Espaço de trabalho', 'Foco / Produtividade', 'Colaboração'].map((category) => (
            <div key={category} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">{category}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-positive font-medium">Positivo</span>
                  <span className="text-2xl font-bold text-positive">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-negative font-medium">Negativo</span>
                  <span className="text-2xl font-bold text-negative">0</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total</span>
                    <span className="font-bold text-gray-800">0</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}