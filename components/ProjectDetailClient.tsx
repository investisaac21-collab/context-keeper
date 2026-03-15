'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project } from '@/lib/types'
import HistoryModal from './HistoryModal'
import ProjectModal from './ProjectModal'

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map((m: string) => m.replace(/\{\{|\}\}/g, '')))]
}

function fillVariables(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => vars[key] || '{{' + key + '}}')
}

interface Props {
  project: Project
  plan: string
  userId: string
}

export default function ProjectDetailClient({ project: initialProject, plan, userId }: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [project, setProject] = useState<Project>(initialProject)
  const [showHistory, setShowHistory] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [varValues, setVarValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const isPro = plan === 'pro' || plan === 'team'
  const planLabel = plan === 'team' ? 'Team' : plan === 'pro' ? 'Pro' : 'Free'
  const detectedVars = extractVariables(project.context || '')
  const previewText = fillVariables(project.context || '', varValues)

  async function handleSave(data: Partial<Project>) {
    setLoading(true)
    const { data: updated } = await supabase
      .from('projects')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', project.id)
      .select()
      .single()
    if (updated) setProject(updated)
    setLoading(false)
    setShowEdit(false)
  }

  async function handleDuplicate() {
    const { data: created } = await supabase
      .from('projects')
      .insert({ name: project.name + ' (copia)', context: project.context, tag: project.tag, user_id: userId })
      .select()
      .single()
    if (created) router.push('/dashboard')
  }

  async function handleDelete() {
    if (!confirm('Seguro que quieres eliminar este proyecto?')) return
    await supabase.from('projects').delete().eq('id', project.id)
    router.push('/dashboard')
  }

  function handleCopy() {
    navigator.clipboard.writeText(previewText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categoryColors: Record<string, string> = {
    coding: 'bg-blue-100 text-blue-800',
    writing: 'bg-green-100 text-green-800',
    analysis: 'bg-purple-100 text-purple-800',
    marketing: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="/dashboard" className="hover:text-indigo-600 transition">Mis Proyectos</a>
          <span>/</span>
          <span className="text-gray-700 font-medium">{project.name}</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {project.category && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ` + (categoryColors[project.category] || 'bg-gray-100 text-gray-700')}>
                    {project.category}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ` + (plan === 'team' ? 'bg-purple-100 text-purple-700' : plan === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500')}>
                  Plan {planLabel}
                </span>
              </div>
              {project.updated_at && (
                <p className="text-xs text-gray-400">Ultima edicion: {new Date(project.updated_at).toLocaleDateString('es-ES', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setShowHistory(true)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                &#128336; Historial {!isPro && <span className="text-gray-300">&#128274;</span>}
              </button>
              <button onClick={handleDuplicate} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                &#128203; Duplicar
              </button>
              <button onClick={() => setShowEdit(true)} className="text-xs px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition">
                Editar
              </button>
              <button onClick={handleDelete} className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition">
                Eliminar
              </button>
            </div>
          </div>
        </div>
        {detectedVars.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">
              Variables detectadas
              <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{detectedVars.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detectedVars.map(v => (
                <div key={v} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">{v}</label>
                  <input
                    type="text"
                    value={varValues[v] || ''}
                    onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={'Valor para ' + v}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Vista previa del prompt</h2>
            <button
              onClick={handleCopy}
              className={'text-sm px-4 py-1.5 rounded-lg font-medium transition ' + (copied ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700')}
            >
              {copied ? 'Copiado!' : 'Copiar contexto'}
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {previewText || <span className="text-gray-400 italic">Este proyecto no tiene contenido aun.</span>}
          </div>
          {detectedVars.length > 0 && detectedVars.some(v => !varValues[v]) && (
            <p className="text-xs text-amber-600 mt-2">
              Hay variables sin rellenar. El prompt se copiara con los marcadores sin sustituir.
            </p>
          )}
        </div>

      </div>

      {showHistory && (
        <HistoryModal project={project} onClose={() => setShowHistory(false)} plan={plan} />
      )}
      {showEdit && (
        <ProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </div>
  )
}
