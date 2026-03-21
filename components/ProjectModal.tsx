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
    if (templateData && !project) {
      setName(templateData.name)
      setTag(templateData.tag)
      setContext(templateData.context)
    }
  }, [templateData, project])

  const variables = extractVariables(context)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !context.trim()) return
    onSave({ name: name.trim(), tag, context: context.trim() })
  }

  const insertVar = (varName: string) => {
    setContext(prev => prev + '{{' + varName + '}}')
  }

  const handleGenerateAI = async () => {
    if (!aiDescription.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiDescription }),
      })
      const data = await res.json()
      if (data.prompt) {
        setContext(data.prompt)
        setShowAI(false)
        setAiDescription('')
      } else {
        setAiError(data.error || 'Error al generar el prompt')
      }
    } catch {
      setAiError('Error de conexión con la IA')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {project ? 'Editar proyecto' : 'Nuevo proyecto'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!project && (
            <div className="mb-6">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
              >
                Usar plantilla predefinida {showTemplates ? '▲' : '▼'}
              </button>
              {showTemplates && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setName(t.name)
                        setTag(t.tag)
                        setContext(t.context)
                        setShowTemplates(false)
                      }}
                      className="text-left p-3 rounded-lg border border-gray-200 hover:border-sky-400 hover:bg-sky-50 transition-all"
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <p className="text-xs font-medium text-gray-900 mt-1">{t.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre del proyecto *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="Ej: Prompt para emails de ventas"
                required
              />
            </div>

            <div>
              <label className="label">Categoría</label>
              <select value={tag} onChange={e => setTag(e.target.value)} className="input">
                <option value="">Sin categoría</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Contexto / Prompt *</label>
                {isPro ? (
                  <button
                    type="button"
                    onClick={() => { setShowAI(!showAI); setAiError('') }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{background: showAI ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white'}}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {showAI ? 'Escribir manual' : 'Generar con IA'}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed select-none" title="Solo disponible en Pro">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Generar con IA &mdash; Pro
                  </div>
                )}
              </div>

              {showAI && isPro && (
                <div className="mb-3 p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
                  <p className="text-xs font-semibold text-violet-700 mb-2">&#129504; Describe qué quieres y la IA creará el prompt</p>
                  <textarea
                    value={aiDescription}
                    onChange={e => setAiDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                    rows={3}
                    placeholder="Ej: Un prompt para responder emails de clientes de forma profesional y empática..."
                    onKeyDown={e => { if(e.key === 'Enter' && e.metaKey) handleGenerateAI() }}
                  />
                  {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-violet-400">Cmd+Enter para generar</span>
                    <button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={aiLoading || !aiDescription.trim()}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
                      style={{background: 'linear-gradient(135deg,#6366f1,#8b5cf6)'}}
                    >
                      {aiLoading ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Generando...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                className="input min-h-[180px] resize-y font-mono text-sm"
                placeholder="Escribe tu contexto... Usa {{variable}} para valores dinámicos"
                required
              />
              {variables.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Variables detectadas:</span>
                  {variables.map(v => (
                    <span key={v} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-mono">
                      {'{{' + v + '}}'}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-gray-400">Insertar variable:</span>
                {['nombre', 'empresa', 'producto', 'fecha', 'rol', 'objetivo'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(v)}
                    className="text-xs bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-700 px-2 py-0.5 rounded-full transition-colors"
                  >
                    + {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                {loading ? 'Guardando...' : (project ? 'Guardar cambios' : 'Crear proyecto')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
