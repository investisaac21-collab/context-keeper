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
}

const CATEGORIES = ['IA', 'Marketing', 'Desarrollo', 'Negocios', 'Educación', 'Personal', 'Otro']

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return Array.from(new Set(matches.map(m => m.slice(2, -2))))
}

export default function ProjectModal({ project, templateData, onSave, onClose, loading }: Props) {
  const [name, setName] = useState(project?.name || '')
  const [tag, setTag] = useState(project?.tag || project?.category || '')
  const [context, setContext] = useState(project?.context || '')
  const [showTemplates, setShowTemplates] = useState(false)

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
                Usar plantilla predefinida {showTemplates ? 'Ã¢ÂÂ²' : 'Ã¢ÂÂ¼'}
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
              <label className="label">CategorÃÂ­a</label>
              <select value={tag} onChange={e => setTag(e.target.value)} className="input">
                <option value="">Sin categorÃÂ­a</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Contexto / Prompt *</label>
              </div>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                className="input min-h-[180px] resize-y font-mono text-sm"
                placeholder="Escribe tu contexto... Usa {{variable}} para valores dinÃÂ¡micos"
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
