'use client'
import { useState } from 'react'
import type { Project } from '@/lib/types'

interface Props {
  project: Project
  onEdit: () => void
  onDelete: () => void
  onCopy: () => void
  onHistory: () => void
}

function fillVariables(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || '{{' + k + '}}')
}

function extractVariables(text) {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return Array.from(new Set(matches.map(m => m.slice(2, -2))))
}

export default function ProjectCard({ project, onEdit, onDelete, onCopy, onHistory }: Props) {
  const [showVars, setShowVars] = useState(false)
  const [varValues, setVarValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const variables = extractVariables(project.context)
  const hasVars = variables.length > 0

  const handleCopy = async () => {
    let text = project.context
    if (hasVars) text = fillVariables(project.context, varValues)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    onCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  const tagColors: Record<string, string> = {
    'IA': 'bg-purple-100 text-purple-700',
    'Marketing': 'bg-pink-100 text-pink-700',
    'Desarrollo': 'bg-blue-100 text-blue-700',
    'Negocios': 'bg-amber-100 text-amber-700',
    'Educacion': 'bg-green-100 text-green-700',
    'Personal': 'bg-gray-100 text-gray-700',
  }
  const tagColor = project.tag ? (tagColors[project.tag] || 'bg-sky-100 text-sky-700') : ''

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
          {project.tag && (
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${tagColor}`}>
              {project.tag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onHistory} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg" title="Historial de versiones">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg" title="Editar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{project.context}</p>

      {hasVars && (
        <div className="border border-dashed border-amber-300 rounded-lg p-3 bg-amber-50">
          <button onClick={() => setShowVars(!showVars)} className="text-xs font-medium text-amber-700 flex items-center gap-1 w-full">
            {variables.length} variable{variables.length > 1 ? 's' : ''} dinamica{variables.length > 1 ? 's' : ''}
            <span className="ml-auto">{showVars ? '▲' : '▼'}</span>
          </button>
          {showVars && (
            <div className="mt-2 space-y-2">
              {variables.map(v => (
                <div key={v}>
                  <label className="text-xs text-amber-700 font-medium block mb-1">{'{{' + v + '}}'}</label>
                  <input
                    type="text"
                    placeholder={'Valor para ' + v + '...'}
                    value={varValues[v] || ''}
                    onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-400">{project.copies} {project.copies === 1 ? 'copia' : 'copias'}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}
        >
          {copied ? 'Copiado!' : 'Copiar contexto'}
        </button>
      </div>
    </div>
  )
}