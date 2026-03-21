'use client'
import { useState, useEffect } from 'react'
import type { Project } from '@/lib/types'
import { TEMPLATES } from '@/lib/templates'

interface TemplateData {
  name: string
  tag: string
  context: string
  emoji: string
}

interface Props {
  project: Project | null
  templateData?: TemplateData | null
  onSave: (data: Partial<Project>) => void
  onClose: () => void
  loading: boolean
  isPro?: boolean
}

const CATEGORIES = ['IA', 'Marketing', 'Desarrollo', 'Negocios', 'Educación', 'Personal', 'Otro']

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return Array.from(new Set(matches.map(m => m.slice(2, -2))))
}

export default function ProjectModal({ project, templateData, onSave, onClose, loading, isPro = false }: Props) {
  const [name, setName] = useState(project?.name || '')
  const [tag, setTag] = useState(project?.tag || project?.category || '')
  const [context, setContext] = useState(project?.context || '')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    if (templateData) {
      setName(templateData.name || '')
      setTag(templateData.tag || '')
      setContext(templateData.context || '')
    }
  }, [templateData])

  const detectedVars = extractVariables(context)

  const insertVar = (v: string) => {
    setContext(prev => prev + ' {{' + v + '}}')
  }

  const handleGenerateAI = async () => {
    if (!aiDescription.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/generate-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiDescription })
      })
      const data = await res.json()
      if (data.context) {
        setContext(data.context)
        setShowAI(false)
      } else {
        setAiError(data.error || 'Error generando contexto')
      }
    } catch {
      setAiError('Error de conexión')
    }
    setAiLoading(false)
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave({ name, title: name, tag, category: tag, context })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">
            {project ? 'Editar contexto' : 'Nuevo contexto'}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Templates toggle */}
          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Usar plantilla predefinida
              <svg className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTemplates && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setName(t.name); setTag(t.tag); setContext(t.context); setShowTemplates(false) }}
                    className="text-left p-3 rounded-xl border border-zinc-700 hover:border-violet-500 bg-zinc-800 hover:bg-zinc-750 transition-all group"
                  >
                    <span className="text-lg block mb-1">{t.emoji}</span>
                    <p className="text-xs font-medium text-white group-hover:text-violet-300 transition-colors">{t.name}</p>
                    <span className="text-xs text-zinc-500">{t.tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Asistente de ventas"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Categoría</label>
            <select
              value={tag}
              onChange={e => setTag(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white focus:outline-none transition-colors"
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* AI Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Contexto</label>
              {isPro ? (
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar con IA
                </button>
              ) : (
                <span className="text-xs text-zinc-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Generar con IA — Pro
                </span>
              )}
            </div>

            {showAI && (
              <div className="mb-3 p-3 bg-zinc-800 border border-violet-700/50 rounded-xl">
                <textarea
                  value={aiDescription}
                  onChange={e => setAiDescription(e.target.value)}
                  placeholder="Describe qué quieres que haga tu IA..."
                  rows={2}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none"
                />
                {aiError && <p className="text-red-400 text-xs mt-1">{aiError}</p>}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleGenerateAI}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    {aiLoading ? 'Generando...' : 'Generar'}
                  </button>
                </div>
              </div>
            )}

            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Describe personalidad, tono, instrucciones y contexto del trabajo... Usa {{variable}} para valores dinámicos"
              rows={8}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none resize-none transition-colors font-mono"
            />

            {/* Detected variables */}
            {detectedVars.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-zinc-500">Variables detectadas:</span>
                {detectedVars.map(v => (
                  <span key={v} className="text-xs bg-violet-900/40 text-violet-300 border border-violet-700/50 px-2 py-0.5 rounded-full font-mono">
                    {'{{'}{v}{'}}'}
                  </span>
                ))}
              </div>
            )}

            {/* Variable inserter */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-500">Insertar variable:</span>
              {['nombre', 'empresa', 'producto', 'fecha', 'rol', 'objetivo'].map(v => (
                <button
                  key={v}
                  onClick={() => insertVar(v)}
                  className="text-xs bg-zinc-800 hover:bg-violet-900/40 text-zinc-400 hover:text-violet-300 border border-zinc-700 hover:border-violet-600 px-2.5 py-1 rounded-lg transition-all font-mono"
                >
                  + {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm font-medium transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {loading ? 'Guardando...' : project ? 'Actualizar' : 'Crear contexto'}
          </button>
        </div>
      </div>
    </div>
  )
}