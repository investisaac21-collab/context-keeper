'use client'
import { useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project, ProjectVersion, UserVariable } from '@/lib/types'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import HistoryModal from './HistoryModal'
import UserVariablesPanel from './UserVariablesPanel'
import { TEMPLATES } from '@/lib/templates'

interface Props {
  initialProjects: Project[]
  initialVariables: UserVariable[]
  userId: string
  userEmail?: string
  plan?: string
}

export default function ProjectsClient({ initialProjects, initialVariables, userId, userEmail, plan = 'free' }: Props) {
  const isPro = plan === 'pro' || plan === 'team'
  const FREE_LIMIT = isPro ? Infinity : 3
  const planLabel = plan === 'team' ? 'Team' : plan === 'pro' ? 'Pro' : 'Free'

  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [templateData, setTemplateData] = useState<typeof TEMPLATES[0] | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [historyProject, setHistoryProject] = useState<Project | null>(null)
  const [variables, setVariables] = useState<UserVariable[]>(initialVariables)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const isFreeLimitReached = !isPro && projects.length >= FREE_LIMIT

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.context?.toLowerCase().includes(search.toLowerCase())
      const matchTag = filterTag ? p.tag === filterTag : true
      return matchSearch && matchTag
    })
  }, [projects, search, filterTag])

  const allTags = useMemo(() => {
    const tags = projects.map(p => p.tag).filter(Boolean) as string[]
    return [...new Set(tags)]
  }, [projects])

  async function handleSave(data: Partial<Project>) {
    setLoading(true)
    if (editingProject) {
      const { data: updated } = await supabase
        .from('projects')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editingProject.id)
        .select()
        .single()
      if (updated) setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
    } else {
      const { data: created } = await supabase
        .from('projects')
        .insert({ ...data, user_id: userId })
        .select()
        .single()
      if (created) setProjects(prev => [created, ...prev])
    }
    setLoading(false)
    setShowModal(false)
    setEditingProject(null)
    setTemplateData(null)
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) setProjects(prev => prev.filter(p => p.id !== id))
  }

  async function handleDuplicate(project: Project) {
    if (isFreeLimitReached) { alert('Has alcanzado el limite del plan Free. Actualiza a Pro para duplicar proyectos.'); return }
    const { data: created } = await supabase
      .from('projects')
      .insert({ name: project.name + ' (copia)', context: project.context, tag: project.tag, user_id: userId })
      .select()
      .single()
    if (created) setProjects(prev => [created, ...prev])
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'context-keeper-export.json'
    a.click()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const imported = JSON.parse(text) as Project[]
      for (const p of imported) {
        await supabase.from('projects').insert({ name: p.name, context: p.context, tag: p.tag, user_id: userId })
      }
      window.location.reload()
    } catch { alert('Error al importar') }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              plan === 'team' ? 'bg-purple-100 text-purple-700' :
              plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              Plan {planLabel}
            </span>
            <span className="text-xs text-gray-400">
              {isPro ? 'Proyectos ilimitados' : `${projects.length} de ${FREE_LIMIT} proyectos usados`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExport} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
            Exportar JSON
          </button>
          <label className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition cursor-pointer">
            Importar JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => { if (!isFreeLimitReached) setShowModal(true) }}
            disabled={isFreeLimitReached}
            className={`text-sm px-4 py-1.5 rounded-lg font-medium transition ${
              isFreeLimitReached
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            + Nuevo proyecto
          </button>
        </div>
      </div>

      {/* BANNER LIMITE ALCANZADO */}
      {isFreeLimitReached && (
        <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-sm">Has alcanzado el limite del plan Free</p>
              <p className="text-xs text-indigo-100 mt-0.5">
                Actualiza a Pro para desbloquear proyectos ilimitados, historial de versiones y variables globales
              </p>
            </div>
            <a href="/pricing" className="shrink-0 bg-white text-indigo-700 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-indigo-50 transition whitespace-nowrap">
              Hazte Pro &mdash; 9 &euro;/mes
            </a>
          </div>
          <div className="mt-3">
            <div className="h-1.5 bg-indigo-400/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-full" />
            </div>
            <span className="text-xs text-indigo-200 mt-1 block">{projects.length}/{FREE_LIMIT} proyectos &mdash; limite alcanzado</span>
          </div>
        </div>
      )}

      {/* BARRA PROGRESO */}
      {!isPro && !isFreeLimitReached && (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">{projects.length} de {FREE_LIMIT} proyectos usados</span>
            <a href="/pricing" className="text-xs text-indigo-600 hover:underline font-medium">Ver planes</a>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: (projects.length / FREE_LIMIT * 100) + '%' }} />
          </div>
        </div>
      )}

      {/* FUNCIONES PREMIUM BLOQUEADAS */}
      {!isPro && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Disponible en Pro</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: '\uD83D\uDCDA', label: 'Historial de versiones' },
              { icon: '\uD83C\uDF10', label: 'Variables globales' },
              { icon: '\uD83D\uDCCB', label: 'Duplicado avanzado' },
              { icon: '\uD83D\uDCE4', label: 'Exportacion avanzada' },
            ].map(f => (
              <a key={f.label} href="/pricing" className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition group">
                <span className="text-sm">{f.icon}</span>
                <span className="text-xs text-gray-500 group-hover:text-indigo-600 flex-1 leading-tight">{f.label}</span>
                <span className="text-gray-300 text-xs">&#128274;</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* TEMPLATES */}
      {projects.length === 0 && !showModal && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Empieza con una plantilla</h2>
          <p className="text-sm text-gray-500 mb-4">Elige una plantilla para crear tu primer proyecto rapidamente.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => { setTemplateData(t); setShowModal(true) }}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition"
              >
                <p className="font-medium text-sm text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.context?.slice(0,80)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BUSQUEDA Y FILTROS */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Todas las categorias</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
      )}

      {/* GRID PROYECTOS */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              variables={variables}
              onEdit={() => { setEditingProject(project); setShowModal(true) }}
              onDelete={() => handleDelete(project.id)}
              onHistory={() => setHistoryProject(project)}
              onDuplicate={() => handleDuplicate(project)}
              plan={plan}
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-1">&#128269;</p>
          <p className="text-sm">No se encontraron proyectos con ese filtro.</p>
        </div>
      ) : null}

      {/* MODALES */}
      {showModal && (
        <ProjectModal
          onClose={() => { setShowModal(false); setEditingProject(null); setTemplateData(null) }}
          onSave={handleSave}
          project={editingProject}
          templateData={templateData}
          loading={loading}
        />
      )}
      {historyProject && (
        <HistoryModal
          project={historyProject}
          onClose={() => setHistoryProject(null)}
          plan={plan}
        />
      )}

      <UserVariablesPanel
        variables={variables}
        setVariables={setVariables}
        userId={userId}
        plan={plan}
      />

    </div>
  )
}
