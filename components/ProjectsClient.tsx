'use client'
import React from 'react'
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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const supabase = createClientComponentClient()

  const isFreeLimitReached = !isPro && projects.length >= FREE_LIMIT

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

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
      if (updated) {
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
        showToast('Contexto actualizado')
      }
    } else {
      const { data: created } = await supabase
        .from('projects')
        .insert({ ...data, user_id: userId })
        .select()
        .single()
      if (created) {
        setProjects(prev => [created, ...prev])
        showToast('ÃÂ¡Contexto creado!')
      }
    }
    setLoading(false)
    setShowModal(false)
    setEditingProject(null)
    setTemplateData(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('ÃÂ¿Seguro que quieres eliminar este contexto? Esta acciÃÂ³n no se puede deshacer.')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id))
      showToast('Proyecto eliminado', 'error')
    }
  }

  async function handleDuplicate(project: Project) {
    if (isFreeLimitReached) {
      showToast('LÃÂ­mite del plan Free alcanzado. Actualiza a Pro.', 'error')
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
    if (created) {
      setProjects(prev => [created, ...prev])
      showToast('Proyecto duplicado')
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'context-keeper-export.json'
    a.click()
    showToast('Proyectos exportados')
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
      showToast('Proyectos importados')
      window.location.reload()
    } catch {
      showToast('Error al importar', 'error')
    }
  }

  const progressPercent = isPro ? 100 : Math.min((projects.length / FREE_LIMIT) * 100, 100)

  const premiumFeatures = [
    { icon: '&#128218;', label: 'Historial de versiones' },
    { icon: '&#127760;', label: 'Variables globales' },
    { icon: '&#128203;', label: 'Duplicado avanzado' },
    { icon: '&#128228;', label: 'ExportaciÃÂ³n avanzada' },
  ]

  const showOnboarding = onboardingVisible && projects.length === 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">

      {/* TOAST GLOBAL */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? '&#10003; ' : '&#9888; '}{toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Contextos</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              plan === 'team' ? 'bg-purple-100 text-purple-700'
              : plan === 'pro' ? 'bg-violet-100 text-violet-700'
              : 'bg-gray-100 text-gray-500'
            }`}>
              Plan {planLabel}
            </span>
            <span className="text-xs text-gray-400">
              {isPro ? 'Contextos ilimitados' : `${projects.length} de ${FREE_LIMIT} contextos usados`}
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
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            + Nuevo contexto
          </button>
        </div>
      </div>

      {/* BANNER LÃÂMITE ALCANZADO */}
      {isFreeLimitReached && (
        <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white shadow-md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-base">Has alcanzado el lÃÂ­mite del plan Free</p>
              <p className="text-sm text-violet-100 mt-1">
                Desbloquea memoria completa Ã¢ÂÂ contextos ilimitados, historial de versiones, generaciÃÂ³n con IA y mÃÂ¡s
              </p>
            </div>
            <a
              href="/pricing"
              className="shrink-0 bg-white text-violet-700 font-semibold text-sm px-5 py-2 rounded-lg hover:bg-violet-50 transition whitespace-nowrap shadow-sm"
            >
              Hazte Pro &#8212; 9 &#8364;/mes
            </a>
          </div>
          <div className="mt-4">
            <div className="h-1.5 bg-violet-400/40 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-full" />
            </div>
            <span className="text-xs text-violet-200 mt-1.5 block">
              {projects.length}/{FREE_LIMIT} contextos Ã¢ÂÂ lÃÂ­mite alcanzado
            </span>
          </div>
        </div>
      )}

            {/* BARRA DE PROGRESO */}
      {!isPro && !isFreeLimitReached && projects.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs text-gray-500 shrink-0">{projects.length} de {FREE_LIMIT} contextos</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: progressPercent + '%' }}
            />
          </div>
          <a href="/pricing" className="text-xs text-violet-600 hover:text-violet-700 font-medium shrink-0">Ver planes</a>
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

      {/* EMPTY STATE â MEMORIA OPERATIVA */}
      {projects.length === 0 && !showOnboarding && (
        <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-gradient-to-b from-violet-50/60 to-white p-14 text-center">
          {/* Keeper Core mini */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border border-violet-200/60 animate-ping opacity-20" />
            <div className="absolute inset-2 rounded-full border border-violet-300/40" />
            <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.097 2.651V19.5a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-.904a3.75 3.75 0 00-1.097-2.651l-.347-.347z" />
              </svg>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Tu IA no recuerda nada.</h3>
          <p className="text-base font-semibold text-violet-600 mb-3">Context Keeper sÃ­.</p>
          <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Crea tu primer contexto. Define la personalidad, el tono y las instrucciones de tu IA una sola vez.
            <br />
            <span className="text-gray-400">No vuelvas a empezar de cero.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-violet-600 text-white px-7 py-3 rounded-xl font-semibold text-sm hover:bg-violet-700 transition shadow-md shadow-violet-500/20 flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear mi primer contexto
            </button>
            <button
              onClick={() => {
                const tmpl = TEMPLATES[0]
                setTemplateData(tmpl)
                setShowModal(true)
              }}
              className="border border-violet-200 text-violet-600 bg-white px-7 py-3 rounded-xl font-medium text-sm hover:bg-violet-50 transition flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h10" />
              </svg>
              Usar una plantilla
            </button>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            &#9889; Usa las plantillas para empezar en 30 segundos
          </p>
        </div>
      )}

                  {/* FUNCIONES PREMIUM BLOQUEADAS */}
      {!isPro && projects.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 flex items-center gap-2 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Historial de versiones &middot; Variables globales &middot; Refinamiento IA &middot; Exportaci&oacute;n</span>
          <a href="/pricing" className="ml-auto shrink-0 text-violet-600 hover:text-violet-700 font-semibold whitespace-nowrap">Hazte Pro &mdash; 9 &euro;/mes &rarr;</a>
        </div>
      )}
      

      {/* BÃÂSQL Y FILTROS */}
      {projects.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar contextos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">Todas las categorÃÂ­as</option>
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
              onCopy={() => { setHasCopied(true); showToast('ÃÂ¡Prompt copiado!') }}
              onPreview={() => setHasPreview(true)}
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No se encontraron proyectos con ese filtro.</p>
          <button
            onClick={() => { setSearch(''); setFilterTag('') }}
            className="text-xs text-violet-600 hover:underline mt-2"
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

      {/* Promo code section - solo para Free */}
      {!isPro && (
        <div className="mt-8 bg-gradient-to-br from-violet-900/20 to-zinc-900 border border-violet-800/30 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white font-semibold mb-1">
                <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} /> ¿Tienes un código?
              </p>
              <p className="text-zinc-400 text-sm">Aplica un código promocional para acceder a Pro gratis.</p>
            </div>
            <PromoInput />
          </div>
        </div>
      )}
    </div>
  )
}

function PromoInput() {
  const [code, setCode] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = React.useState('')

  const apply = async () => {
    if (!code.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', promoCode: code.trim().toUpperCase() })
      })
      const data = await res.json()
      if (data.url) {
        setStatus('success')
        setMsg('Redirigiendo...')
        window.location.href = data.url
      } else {
        setStatus('error')
        setMsg('Código no válido o expirado')
      }
    } catch {
      setStatus('error')
      setMsg('Error al aplicar')
    }
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="KEEPER2025"
          className="bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl w-40 focus:outline-none focus:border-violet-500 font-mono tracking-wider"
        />
        <button
          onClick={apply}
          disabled={status === 'loading'}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-all"
        >
          {status === 'loading' ? '...' : 'Aplicar'}
        </button>
      </div>
      {msg && (
        <p className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>
      )}
    </div>
  )
}
