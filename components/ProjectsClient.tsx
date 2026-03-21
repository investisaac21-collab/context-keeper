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
import KeeperBot from './KeeperBot'

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
  const [variables, setVariables] = useState<UserVariable[]>(initialVariables)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [templateData, setTemplateData] = useState<Partial<Project> | null>(null)
  const [historyProjectId, setHistoryProjectId] = useState<string | null>(null)
  const [showVariables, setShowVariables] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [tab, setTab] = useState<'contexts' | 'templates'>('contexts')

  const supabase = createClientComponentClient()

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveVersion(projectId: string, context: string) {
    await supabase.from('project_versions').insert({
      project_id: projectId,
      user_id: userId,
      context,
      created_at: new Date().toISOString()
    })
  }

  async function handleSave(data: Partial<Project>) {
    setLoading(true)
    try {
      if (editingProject) {
        if (editingProject.context !== data.context) {
          await saveVersion(editingProject.id, editingProject.context || '')
        }
        const { data: updated, error } = await supabase
          .from('projects')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingProject.id)
          .select()
          .single()
        if (error) throw error
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updated : p))
        showToast('Contexto actualizado')
      } else {
        if (!isPro && projects.length >= FREE_LIMIT) {
          showToast('Límite del plan Free alcanzado. Actualiza a Pro.', 'error')
          setLoading(false)
          return
        }
        const { data: created, error } = await supabase
          .from('projects')
          .insert([{ ...data, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
          .select()
          .single()
        if (error) throw error
        setProjects(prev => [created, ...prev])
        showToast('Contexto creado')
      }
    } catch (err) {
      showToast('Error al guardar', 'error')
    }
    setLoading(false)
    setShowModal(false)
    setEditingProject(null)
    setTemplateData(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este contexto?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) { showToast('Error al eliminar', 'error'); return }
    setProjects(prev => prev.filter(p => p.id !== id))
    showToast('Contexto eliminado')
  }

  async function handleDuplicate(project: Project) {
    if (!isPro && projects.length >= FREE_LIMIT) {
      showToast('Límite del plan Free alcanzado', 'error'); return
    }
    const { data: created, error } = await supabase
      .from('projects')
      .insert([{ ...project, id: undefined, title: project.title + ' (copia)', user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select().single()
    if (error) { showToast('Error al duplicar', 'error'); return }
    setProjects(prev => [created, ...prev])
    showToast('Contexto duplicado')
  }

  function handleExport() {
    const json = JSON.stringify({ projects, variables }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'context-keeper-export.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('Exportado correctamente')
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const toImport = parsed.projects || []
      for (const p of toImport) {
        await supabase.from('projects').insert([{ ...p, id: undefined, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      }
      const { data } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setProjects(data || [])
      showToast('Importado correctamente')
    } catch {
      showToast('Error al importar', 'error')
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category).filter(Boolean))
    return ['all', ...Array.from(cats)] as string[]
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.context?.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || p.category === category
      return matchSearch && matchCat
    })
  }, [projects, search, category])

  const onboarding = {
    hasProject: projects.length > 0,
    hasContext: projects.some(p => p.context && p.context.length > 50),
    hasVariable: variables.length > 0,
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all border ${toast.type === 'success' ? 'bg-zinc-900 border-violet-700 text-violet-300' : 'bg-zinc-900 border-red-700 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">Memoria operativa</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${plan === 'pro' ? 'bg-violet-900/50 text-violet-300 border border-violet-700' : plan === 'team' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                {planLabel}
              </span>
            </div>
            <p className="text-zinc-500 text-sm">
              {isPro ? 'Contextos ilimitados activos' : `${projects.length} / ${FREE_LIMIT} contextos`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVariables(!showVariables)}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all hidden sm:flex items-center gap-1.5"
            >
              <span>Variables</span>
              {variables.length > 0 && <span className="bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{variables.length}</span>}
            </button>
            <button
              onClick={() => setShowOnboarding(!showOnboarding)}
              className="p-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
              title="Guía de inicio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button
              onClick={() => { setEditingProject(null); setTemplateData(null); setShowModal(true) }}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nuevo contexto
            </button>
          </div>
        </div>

        {/* Onboarding */}
        {showOnboarding && (
          <div className="mb-6">
            <OnboardingChecklist {...onboarding} />
          </div>
        )}

        {/* Variables panel */}
        {showVariables && (
          <div className="mb-6">
            <UserVariablesPanel
              variables={variables}
              userId={userId}
              plan={plan}
            />
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Contextos', value: projects.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Variables', value: variables.length, icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
            { label: 'Plan', value: planLabel, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
            { label: 'Categorías', value: Math.max(0, categories.length - 1), icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
                <span className="text-zinc-500 text-xs">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Upgrade nudge for Free plan */}
        {!isPro && (
          <div className="mb-6 flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-400 text-xs">Contextos usados</span>
                <span className="text-zinc-400 text-xs">{projects.length} / {FREE_LIMIT}</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={"h-full rounded-full transition-all " + (projects.length >= FREE_LIMIT ? "bg-red-500" : projects.length >= 2 ? "bg-amber-500" : "bg-violet-500")}
                  style={{width: Math.min(100, (projects.length / FREE_LIMIT) * 100) + '%'}}
                />
              </div>
            </div>
            <a href="/pricing" className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-all flex-shrink-0 whitespace-nowrap">
              Ir a Pro &#x2192;
            </a>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          {(['contexts', 'templates'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {t === 'contexts' ? 'Mis contextos' : 'Plantillas'}
            </button>
          ))}
        </div>

        {tab === 'templates' ? (
          /* Templates Grid */
          <div>
            <p className="text-zinc-500 text-sm mb-4">Elige una plantilla para empezar rápido</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => { setTemplateData(tpl); setEditingProject(null); setShowModal(true); setTab('contexts') }}
                  className="text-left p-5 bg-zinc-900 border border-zinc-800 hover:border-violet-600 rounded-xl transition-all group"
                >
                  <div className="text-2xl mb-3">{tpl.emoji || '◆'}</div>
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-violet-300 transition-colors">{tpl.name}</h3>
                  <p className="text-zinc-500 text-xs">{tpl.tag || 'Plantilla'}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Contexts tab */
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar contextos..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="all">Todas las categorías</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm transition-all flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span className="hidden sm:inline">Exportar</span>
                </button>
                <label className="px-3 py-2 text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" /></svg>
                  <span className="hidden sm:inline">Importar</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </div>

            {/* Limit warning */}
            {!isPro && projects.length >= FREE_LIMIT && (
              <div className="mb-6 p-4 bg-violet-950/50 border border-violet-700/50 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="text-violet-200 text-sm font-medium">Límite del plan Free alcanzado</p>
                  <p className="text-violet-400 text-xs mt-0.5">Tienes {projects.length} contextos. Actualiza a Pro para crear ilimitados.</p>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                {search || category !== 'all' ? (
                  <>
                    <p className="text-zinc-400 font-medium mb-1">Sin resultados</p>
                    <p className="text-zinc-600 text-sm">Prueba con otros filtros</p>
                    <button onClick={() => { setSearch(''); setCategory('all') }} className="mt-4 text-violet-400 text-sm hover:text-violet-300">Limpiar filtros</button>
                  </>
                ) : (
                  <>
                    <p className="text-zinc-400 font-medium mb-1">Aún no tienes contextos</p>
                    <p className="text-zinc-600 text-sm mb-4">Crea tu primer contexto o usa una plantilla</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setEditingProject(null); setTemplateData(null); setShowModal(true) }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-all"
                      >
                        Crear contexto
                      </button>
                      <button
                        onClick={() => setTab('templates')}
                        className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-medium rounded-lg transition-all"
                      >
                        Ver plantillas
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variables={variables}
                    isPro={isPro}
                    onEdit={(p) => { setEditingProject(p); setShowModal(true) }}
                    onDelete={handleDelete}
                    onCopy={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Promo Code Section - only for Free users */}
        {!isPro && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <div className="max-w-lg">
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Plan Free</p>
              <h3 className="text-white font-semibold mb-1">¿Tienes un código de acceso?</h3>
              <p className="text-zinc-500 text-sm mb-4">Intróducelo para activar Pro al instante, sin tarjeta.</p>
              <PromoInput onSuccess={(newPlan) => { window.location.reload() }} />
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          templateData={templateData}
          variables={variables}
          isPro={isPro}
          loading={loading}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null); setTemplateData(null) }}
        />
      )}

    </div>
  )
}

function PromoInput({ onSuccess }: { onSuccess?: (plan: string) => void }) {
  const [code, setCode] = React.useState('')
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = React.useState('')

  const apply = async () => {
    if (!code.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setMsg(data.message || 'Plan activado')
        setTimeout(() => {
          if (onSuccess) onSuccess(data.plan)
          else window.location.reload()
        }, 1500)
      } else {
        setStatus('error')
        setMsg(data.error || 'Código no válido')
      }
    } catch {
      setStatus('error')
      setMsg('Error de conexión')
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="KEEPER2025"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && apply()}
          disabled={status === 'loading' || status === 'success'}
          className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white placeholder-zinc-600 font-mono focus:outline-none transition-colors"
        />
        <button
          onClick={apply}
          disabled={status === 'loading' || status === 'success' || !code.trim()}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
        >
          {status === 'loading' ? '...' : 'Aplicar'}
        </button>
      </div>
      {msg && (
        <p className={`text-xs mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>
      )}
    </div>
      <KeeperBot userId={userId} plan={plan || 'free'} />
  )
}