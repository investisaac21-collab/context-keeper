'use client'
import { useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project, UserVariable } from '@/lib/types'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import HistoryModal from './HistoryModal'
import UserVariablesPanel from './UserVariablesPanel'
import OnboardingChecklist from './OnboardingChecklist'
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
  const [hasCopied, setHasCopied] = useState(false)
  const [hasPreview, setHasPreview] = useState(false)
  const [showVariablesPanel, setShowVariablesPanel] = useState(false)
  const [onboardingVisible, setOnboardingVisible] = useState(true)

  const supabase = createClientComponentClient()

  const isFreeLimitReached = !isPro && projects.length >= FREE_LIMIT

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.context?.toLowerCase().includes(search.toLowerCase())
      const matchTag = filterTag ? (p.tag === filterTag || p.category === filterTag) : true
      return matchSearch && matchTag
    })
  }, [projects, search, filterTag])

  const allTags = useMemo(() => {
    const tags = projects.map(p => p.tag || p.category).filter(Boolean) as string[]
    return [...new Set(tags)]
  }, [projects])

  async function saveVersion(projectId: string, context: string) {
    if (!isPro) return
    const { data: last } = await supabase
      .from('project_versions')
      .select('version_number')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()
    const nextVersion = (last?.version_number ?? 0) + 1
    await supabase.from('project_versions').insert({
      project_id: projectId,
      user_id: userId,
      context,
      version_number: nextVersion,
    })
  }

  async function handleSave(data: Partial<Project>) {
    setLoading(true)
    if (editingProject) {
      if (editingProject.context) {
        await saveVersion(editingProject.id, editingProject.context)
      }
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
    if (!confirm('Â¿Seguro que quieres eliminar este proyecto? Esta acciÃ³n no se puede deshacer.')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) setProjects(prev => prev.filter(p => p.id !== id))
  }

  async function handleDuplicate(project: Project) {
    if (isFreeLimitReached) {
      alert('Has alcanzado el lÃ­mite del plan Free. Actualiza a Pro para duplicar proyectos.')
      return
    }
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
        await supabase.from('projects').insert({
          name: p.name,
          context: p.context,
          tag: p.tag,
          user_id: userId,
        })
      }
      window.location.reload()
    } catch {
      alert('Error al importar')
    }
  }

  const progressPercent = isPro ? 100 : Math.min((projects.length / FREE_LIMIT) * 100, 100)

  const premiumFeatures = [
    { icon: '&#128218;', label: 'Historial de versiones' },
    { icon: '&#127760;', label: 'Variables globales' },
    { icon: '&#128203;', label: 'Duplicado avanzado' },
    { icon: '&#128228;', label: 'ExportaciÃ³n avanzada' },
  ]

  // Onboarding: mostrar si el usuario nunca ha tenido proyectos o es nuevo
  const showOnboarding = onboardingVisible && projects.length === 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              plan === 'team' ? 'bg-purple-100 text-purple-700'
              : plan === 'pro' ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-500'
            }`}>
              Plan {planLabel}
            </span>
            <span className="text-xs text-gray-400">
              {isPro ? 'Proyectos ilimitados' : `${projects.length} de ${FREE_LIMIT} proyectos usados`}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
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

      {/* BANNER LLÃMITE ALCANZADO */}
      {isFreeLimitReached && (
        <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-base">Has alcanzado el lÃ­mite del plan Free</p>
              <p className="text-sm text-indigo-100 mt-1">
                Actualiza a Pro para desbloquear proyectos ilimitados, historial de versiones y variables globales
              </p>
            </div>
            <a
              href="/pricing"
              className="shrink-0 bg-white text-indigo-700 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-indigo-50 transition whitespace-nowrap shadow-sm"
            >
              Hazte Pro &#8212; 9 &#8364;/mes
            </a>
          </div>
          <div className="mt-4">
            <div className="h-1.5 bg-indigo-400/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-full" />
            </div>
            <span className="text-xs text-indigo-200 mt-1.5 block">
              {projects.length}/{FREE_LIMIT} proyectos &#8212; lÃ­mite alcanzado
            </span>
          </div>
        </div>
      )}

      {/* BARRA DE PROGRESO */}
      {!isPro && !isFreeLimitReached && projects.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              {projects.length} de {FREE_LIMIT} proyectos usados
            </span>
            <a href="/pricing" className="text-xs text-indigo-600 hover:underline font-medium">
              Ver planes
            </a>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: progressPercent + '%' }}
            />
          </div>
          {projects.length === FREE_LIMIT - 1 && (
            <p className="text-xs text-amber-600 mt-1.5">
              &#9888; Te queda 1 proyecto disponible en el plan Free.{' '}
              <a href="/pricing" className="underline font-medium">Hazte Pro</a> para ilimitados.
            </p>
          )}
        </div>
      )}

      {/* ONBOARDING CHECKLIST */}
      {showOnboarding && (
        <OnboardingChecklist
          hasProjects={projects.length > 0}
          hasVariables={variables.length > 0}
          hasCopied={hasCopied}
          hasPreview={hasPreview}
          onCreateProject={() => setShowModal(true)}
          onAddVariable={() => {
            const el = document.getElementById('variables-panel')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
          }}
          onDismiss={() => setOnboardingVisible(false)}
        />
      )}

      {/* FUNCIONES PREMIUM BLOQUEADAS */}
      {!isPro && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Disponible en Pro
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {premiumFeatures.map(f => (
              <a
                key={f.label}
                href="/pricing"
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition group"
              >
                <span className="text-sm" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <span className="text-xs text-gray-500 group-hover:text-indigo-600 flex-1 leading-tight">
                  {f.label}
                </span>
                <span className="text-gray-300 text-xs">&#128274;</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* PLANTILLAS (solo si no hay proyectos y no se muestra onboarding) */}
      {projects.length === 0 && !showModal && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Empieza con una plantilla</h2>
          <p className="text-sm text-gray-500 mb-4">
            Elige una plantilla para crear tu primer proyecto rÃ¡pidamente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => { setTemplateData(t); setShowModal(true) }}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition"
              >
                <p className="font-medium text-sm text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.context?.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BUSQL Y FILTROS */}
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
            <option value="">Todas las categorÃ­as</option>
            {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </div>
      )}

      {/* GRID DE PROYECTOS */}
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
              onCopy={() => setHasCopied(true)}
              onPreview={() => setHasPreview(true)}
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No se encontraron proyectos con ese filtro.</p>
          <button
            onClick={() => { setSearch(''); setFilterTag('') }}
            className="text-xs text-indigo-600 hover:underline mt-2"
          >
            Limpiar filtros
          </button>
        </div>
      ) : null}

      {/* MODALES */}
      {showModal && (
        <ProjectModal
          onClose={() => { setShowModal(false); setEditingProject(null); setTemplateData(null) }}
          onSave={handleSave}
          project={editingProject}
          isPro={isPro}
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

      <div id="variables-panel">
        <UserVariablesPanel
          variables={variables}
          setVariables={setVariables}
          userId={userId}
          plan={plan}
        />
      </div>
    </div>
  )
}
