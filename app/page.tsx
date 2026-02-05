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
      setSelectedPositive(prev => 
        prev.includes(categoryLabel) 
          ? prev.filter(c => c !== categoryLabel)
          : [...prev, categoryLabel]
      )
    } else {
      setSelectedNegative(prev => 
        prev.includes(categoryLabel) 
          ? prev.filter(c => c !== categoryLabel)
          : [...prev, categoryLabel]
      )
    }
  }

  const handleSubmitPositive = () => {
    if (selectedPositive.length > 0) {
      setCurrentStep('negative')
    }
  }

  const handleSubmit = async () => {
    if (selectedNegative.length === 0) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positive: selectedPositive,
          negative: selectedNegative,
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
          <div className="space-y-3">
            {!isTabletMode && (
              <button
                onClick={resetForm}
                className="block w-full bg-positive text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Nova Resposta
              </button>
            )}
            <button
              onClick={() => router.push('/pulse')}
              className="block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Ver Clima do Time
            </button>
          </div>
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
              <p className="text-gray-600">Selecione uma ou mais opções</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.label, 'positive')}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedPositive.includes(category.label)
                      ? 'bg-positive text-white border-positive'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-positive'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.label}</div>
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <button
                onClick={handleSubmitPositive}
                disabled={selectedPositive.length === 0}
                className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${
                  selectedPositive.length > 0
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
              <p className="text-gray-600">Selecione uma ou mais opções</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.label, 'negative')}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    selectedNegative.includes(category.label)
                      ? 'bg-negative text-white border-negative'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-negative'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-medium text-sm">{category.label}</div>
                </button>
              ))}
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
                  disabled={selectedNegative.length === 0 || isSubmitting}
                  className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${
                    selectedNegative.length > 0 && !isSubmitting
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