'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const CATEGORIES = [
  { id: 'dinamica', label: 'Dinâmica do dia', icon: '📅' },
  { id: 'reunioes', label: 'Reuniões', icon: '👥' },
  { id: 'comunicacao', label: 'Comunicação', icon: '💬' },
  { id: 'espaco', label: 'Espaço de trabalho', icon: '🏢' },
  { id: 'foco', label: 'Foco / Produtividade', icon: '🎯' },
  { id: 'colaboracao', label: 'Colaboração', icon: '🤝' }
]

function FeedbackPageContent() {
  const [currentStep, setCurrentStep] = useState<'positive' | 'negative' | 'success'>('positive')
  const [selectedPositive, setSelectedPositive] = useState<string[]>([])
  const [selectedNegative, setSelectedNegative] = useState<string[]>([])
  const [noPositiveSelection, setNoPositiveSelection] = useState(false)
  const [noNegativeSelection, setNoNegativeSelection] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTabletMode, setIsTabletMode] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode')

  useEffect(() => {
    setIsTabletMode(mode === 'tablet')
  }, [mode])

  const toggleCategory = (categoryLabel: string, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      // Se marcar uma categoria, desmarcar "Nada a destacar hoje"
      if (!selectedPositive.includes(categoryLabel)) {
        setNoPositiveSelection(false)
      }
      
      setSelectedPositive(prev => 
        prev.includes(categoryLabel) 
          ? prev.filter(c => c !== categoryLabel)
          : [...prev, categoryLabel]
      )
    } else {
      // Se marcar uma categoria, desmarcar "Nada a destacar hoje"
      if (!selectedNegative.includes(categoryLabel)) {
        setNoNegativeSelection(false)
      }
      
      setSelectedNegative(prev => 
        prev.includes(categoryLabel) 
          ? prev.filter(c => c !== categoryLabel)
          : [...prev, categoryLabel]
      )
    }
  }

  const toggleNoSelection = (type: 'positive' | 'negative') => {
    if (type === 'positive') {
      const newValue = !noPositiveSelection
      
      // Se selecionar "Nada a destacar hoje", limpar todas as categorias
      if (newValue) {
        setSelectedPositive([])
      }
      
      setNoPositiveSelection(newValue)
    } else {
      const newValue = !noNegativeSelection
      
      // Se selecionar "Nada a destacar hoje", limpar todas as categorias
      if (newValue) {
        setSelectedNegative([])
      }
      
      setNoNegativeSelection(newValue)
    }
  }

  const canContinuePositive = () => {
    return selectedPositive.length > 0 || noPositiveSelection
  }

  const canContinueNegative = () => {
    return selectedNegative.length > 0 || noNegativeSelection
  }

  const handleSubmitPositive = () => {
    if (canContinuePositive()) {
      setCurrentStep('negative')
    }
  }

  const handleSubmit = async () => {
    if (!canContinueNegative()) return
    
    setIsSubmitting(true)
    
    // Prepara os dados para envio
    const positiveData = noPositiveSelection ? ['Nada a destacar hoje'] : selectedPositive
    const negativeData = noNegativeSelection ? ['Nada a destacar hoje'] : selectedNegative
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positive: positiveData,
          negative: negativeData,
          date: new Date().toISOString(),
          source: isTabletMode ? 'tablet' : 'link'
        }),
      })

      if (response.ok) {
        setCurrentStep('success')
        
        if (isTabletMode) {
          setTimeout(() => {
            resetForm()
          }, 4000)
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentStep('positive')
    setSelectedPositive([])
    setSelectedNegative([])
    setNoPositiveSelection(false)
    setNoNegativeSelection(false)
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 no-scroll">
        <div className="text-center animate-scale-in">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Obrigado!</h1>
          <p className="text-gray-600 mb-6">
            {isTabletMode 
              ? 'Seu feedback foi recebido. Preparando para próxima resposta...' 
              : 'Seu feedback foi recebido e ajudará a melhorar nosso ambiente.'
            }
          </p>
          {!isTabletMode && (
            <button
              onClick={resetForm}
              className="block w-full bg-positive text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Nova Resposta
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-neutral-50 ${(currentStep as string) !== 'success' ? 'no-scroll' : ''}`}>
      <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col justify-center">
        {currentStep === 'positive' ? (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-positive mb-2">
                🌟 O que funcionou bem hoje?
              </h1>
              <p className="text-gray-600">Selecione uma ou mais opções, ou marque se nada a destacar</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.label, 'positive')}
                  disabled={noPositiveSelection}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedPositive.includes(category.label)
                      ? 'bg-positive text-white border-positive'
                      : noPositiveSelection
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-positive'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.label}</div>
                </button>
              ))}
            </div>

            {/* Opção "Nada a destacar hoje" */}
            <div className="mb-8">
              <button
                onClick={() => toggleNoSelection('positive')}
                disabled={selectedPositive.length > 0}
                className={`w-full p-6 rounded-xl border-2 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 ${
                  noPositiveSelection
                    ? 'bg-gray-100 text-gray-700 border-gray-400'
                    : selectedPositive.length > 0
                    ? 'bg-white text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="text-2xl">➖</span>
                <span className="font-semibold">Nada a destacar hoje</span>
              </button>
            </div>
            
            <div className="text-center">
              <button
                onClick={handleSubmitPositive}
                disabled={!canContinuePositive()}
                className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${
                  canContinuePositive()
                    ? 'bg-positive hover:bg-green-600 transform hover:scale-105'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Continuar →
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-negative mb-2">
                🎯 O que não funcionou bem hoje?
              </h1>
              <p className="text-gray-600">Selecione uma ou mais opções, ou marque se nada a destacar</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.label, 'negative')}
                  disabled={noNegativeSelection}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedNegative.includes(category.label)
                      ? 'bg-negative text-white border-negative'
                      : noNegativeSelection
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-negative'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.label}</div>
                </button>
              ))}
            </div>

            {/* Opção "Nada a destacar hoje" */}
            <div className="mb-8">
              <button
                onClick={() => toggleNoSelection('negative')}
                disabled={selectedNegative.length > 0}
                className={`w-full p-6 rounded-xl border-2 transition-all transform hover:scale-105 flex items-center justify-center space-x-3 ${
                  noNegativeSelection
                    ? 'bg-gray-100 text-gray-700 border-gray-400'
                    : selectedNegative.length > 0
                    ? 'bg-white text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className="text-2xl">➖</span>
                <span className="font-semibold">Nada a destacar hoje</span>
              </button>
            </div>
            
            <div className="text-center">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setCurrentStep('positive')}
                  className="px-6 py-4 rounded-lg font-bold text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canContinueNegative()}
                  className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${
                    canContinueNegative()
                      ? 'bg-negative hover:bg-red-600 transform hover:scale-105'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-positive"></div>
      </div>
    }>
      <FeedbackPageContent />
    </Suspense>
  )
}