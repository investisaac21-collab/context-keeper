'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project } from '@/lib/types'
import HistoryModal from './HistoryModal'
import ProjectModal from './ProjectModal'
import Navbar from './Navbar'

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
  userEmail?: string
}

export default function ProjectDetailClient({ project: initialProject, plan, userId, userEmail }: Props) {
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
  const missingVars = detectedVars.filter(v => !varValues[v])
  const previewText = fillVariables(project.context || '', varValues)

  async function saveVersion(context: string) {
    if (!isPro) return
    const { data: last } = await supabase
      .from('project_versions')
      .select('version_number')
      .eq('project_id', project.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()
    const nextVersion = (last?.version_number ?? 0) + 1
    await supabase.from('project_versions').insert({
      project_id: project.id,
      user_id: userId,
      context,
      version_number: nextVersion,
    })
  }

  async function handleSave(data: Partial<Project>) {
    setLoading(true)
    // Guardar versiÃ³n anterior antes de editar
    if (project.context) {
      await saveVersion(project.context)
    }
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
      .insert({
        name: project.name + ' (copia)',
        context: project.context,
        tag: project.tag,
        user_id: userId,
      })
      .select()
      .single()
    if (created) router.push('/dashboard')
  }

  async function handleDelete() {
    if (!confirm('Â¿Seguro que quieres eliminar este proyecto? Esta acciÃ³n no se puede deshacer.')) return
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
    IA: 'bg-indigo-100 text-indigo-800',
    Desarrollo: 'bg-blue-100 text-blue-800',
    Marketing: 'bg-yellow-100 text-yellow-800',
    Negocios: 'bg-orange-100 text-orange-800',
    Educacion: 'bg-teal-100 text-teal-800',
    Personal: 'bg-pink-100 text-pink-800',
    Otro: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-700',
  }

  const category = project.category || project.tag || ''
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={userEmail} plan={plan} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="/dashboard" className="hover:text-indigo-600 transition">Mis Proyectos</a>
          <span>/</span>
          <span className="text-gray-700 font-medium">{project.name}</span>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {category && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                    {category}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  plan === 'team' ? 'bg-purple-100 text-purple-700' :
                  plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  Plan {planLabel}
                </span>
              </div>
              {project.updated_at && (
                <p className="text-xs text-gray-400">
                  ÃÂltima ediciÃÂ³n:{' '}
                  {new Date(project.updated_at).toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href="/dashboard"
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
              >
                &#8592; Dashboard
              </a>
              <button
                onClick={() => setShowHistory(true)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
              >
                Historial {!isPro && <span className="text-gray-300 text-xs">&#128274;</span>}
              </button>
              <button
                onClick={handleDuplicate}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Duplicar
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="text-xs px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Variables detectadas */}
        {detectedVars.length === 0 && project.context && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-4 mb-4 text-center">
            <p className="text-sm text-gray-400 italic">
              Sin variables dinÃ¡micas. AÃ±ade <code className="font-mono bg-gray-100 px-1 rounded text-xs">{{nombre}}</code> al contexto para personalizar el prompt.
            </p>
          </div>
        )}
        {detectedVars.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Variables detectadas
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {detectedVars.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detectedVars.map(v => (
                <div key={v} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 font-mono">{v}</label>
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
            {missingVars.length > 0 && (
              <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                &#9888; {missingVars.length} variable{missingVars.length !== 1 ? 's' : ''} sin rellenar.
                El prompt se copiarÃÂ¡ con los marcadores sin sustituir.
              </p>
            )}
          </div>
        )}

        {/* Vista previa */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Vista previa del prompt</h2>
            <button
              onClick={handleCopy}
              className={`text-sm px-4 py-1.5 rounded-lg font-medium transition ${
                copied ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {copied ? '&#10003; Copiado' : 'Copiar contexto'}
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {previewText || (
              <span className="text-gray-400 italic">Este proyecto no tiene contenido aÃÂºn.</span>
            )}
          </div>
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
