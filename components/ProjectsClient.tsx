'use client'
import { useState, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import { TEMPLATES } from '@/lib/templates'

const FREE_LIMIT = 3

interface Props {
  initialProjects: Project[]
  userId: string
}

export default function ProjectsClient({ initialProjects, userId }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [templateData, setTemplateData] = useState<typeof TEMPLATES[0] | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const isFreeLimitReached = projects.length >= FREE_LIMIT

  const tags = useMemo(() => {
    const all = projects.map(p => p.tag).filter(Boolean) as string[]
    return Array.from(new Set(all))
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.context.toLowerCase().includes(search.toLowerCase())
      const matchTag = !filterTag || p.tag === filterTag
      return matchSearch && matchTag
    })
  }, [projects, search, filterTag])

  const handleSave = async (data: { name: string; tag: string; context: string }) => {
    setLoading(true)
    try {
      if (editingProject) {
        const { data: updated, error } = await supabase
          .from('projects')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingProject.id)
          .select()
          .single()
        if (error) throw error
        setProjects(prev => prev.map(p => p.id === editingProject.id ? updated : p))
      } else {
        const { data: created, error } = await supabase
          .from('projects')
          .insert({ ...data, user_id: userId })
          .select()
          .single()
        if (error) throw error
        setProjects(prev => [created, ...prev])
      }
      setShowModal(false)
      setEditingProject(null)
    } catch (err) {
      console.error(err)
      alert('Error al guardar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este proyecto?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) setProjects(prev => prev.filter(p => p.id !== id))
  }

  const handleCopyIncrement = async (id: string) => {
    const project = projects.find(p => p.id === id)
    if (!project) return
    const newCopies = (project.copies || 0) + 1
    await supabase.from('projects').update({ copies: newCopies }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, copies: newCopies } : p))
  }

  const handleExport = () => {
    const json = JSON.stringify(projects, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'context-keeper-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as Project[]
        const toInsert = imported.map(p => ({
          name: p.name,
          tag: p.tag,
          context: p.context,
          user_id: userId,
          copies: 0,
        }))
        const { data, error } = await supabase.from('projects').insert(toInsert).select()
        if (error) throw error
        setProjects(prev => [...(data || []), ...prev])
        alert(data?.length + ' proyectos importados correctamente')
      } catch {
        alert('Error al importar: asegurate de que el archivo es valido')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleUseTemplate = (template: typeof TEMPLATES[0]) => {
    setEditingProject(null)
    setTemplateData(template)
    setShowModal(true)
  }

  const handleNewProject = () => {
    if (isFreeLimitReached) return
    setEditingProject(null)
    setTemplateData(null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} proyecto{projects.length !== 1 ? 's' : ''} guardado{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="btn-secondary cursor-pointer text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar
          </button>
          <button
            onClick={handleNewProject}
            disabled={isFreeLimitReached}
            className={"btn-primary text-sm " + (isFreeLimitReached ? "opacity-50 cursor-not-allowed" : "")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo proyecto
          </button>
        </div>
      </div>

      {isFreeLimitReached && (
        <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl p-4 flex items-center justify-between gap-4 text-white shadow-lg">
          <div>
            <p className="font-semibold text-sm">Has alcanzado el limite del plan gratuito</p>
            <p className="text-xs text-sky-100 mt-0.5">Actualiza a Pro para proyectos ilimitados + variables avanzadas</p>
          </div>
          <button className="shrink-0 bg-white text-sky-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-sky-50 transition-colors">
            Hazte Pro - 9/mes
          </button>
        </div>
      )}

      {!isFreeLimitReached && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: (projects.length / FREE_LIMIT * 100) + '%' }} />
          </div>
          <span className="text-xs text-gray-400">{projects.length}/{FREE_LIMIT} proyectos gratuitos</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Buscar proyectos..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        {tags.length > 0 && (
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="input sm:w-48">
            <option value="">Todas las categorias</option>
            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        )}
      </div>

      {projects.length === 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Empieza con una plantilla</h2>
          <p className="text-sm text-gray-500 mb-4">Crea tu primer proyecto rapidamente</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => handleUseTemplate(t)} className="text-left p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-sky-400 hover:bg-sky-50 transition-all group">
                <div className="text-2xl mb-2">{t.emoji}</div>
                <div className="font-medium text-gray-900 text-sm group-hover:text-sky-700">{t.name}</div>
                <div className="text-xs text-gray-500 mt-1">{t.tag}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => { setEditingProject(project); setShowModal(true) }}
              onDelete={() => handleDelete(project.id)}
              onCopy={() => handleCopyIncrement(project.id)}
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No hay resultados para tu busqueda</p>
        </div>
      ) : null}

      {showModal && (
        <ProjectModal
          project={editingProject}
          templateData={templateData}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null); setTemplateData(null) }}
          loading={loading}
        />
      )}
    </div>
  )
}