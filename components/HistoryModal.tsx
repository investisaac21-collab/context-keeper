'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project, ProjectVersion } from '@/lib/types'

interface Props {
  project: Project
  onClose: () => void
  plan?: string
  // legacy props kept for compatibility
  versions?: ProjectVersion[]
  onRollback?: (version: ProjectVersion) => void
  loading?: boolean
}

export default function HistoryModal({ project, onClose, plan = 'free', versions: initialVersions, onRollback, loading: externalLoading }: Props) {
  const isPro = plan === 'pro' || plan === 'team'
  const [versions, setVersions] = useState<ProjectVersion[]>(initialVersions || [])
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!isPro || !project?.id) return
    setLoading(true)
    supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', project.id)
      .order('version_number', { ascending: false })
      .then(({ data }) => {
        setVersions(data || [])
        setLoading(false)
      })
  }, [project?.id, isPro])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Historial de versiones</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&#10005;</button>
        </div>

        {!isPro ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-4xl mb-4">&#128274;</span>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Historial disponible en Pro</h3>
            <p className="text-sm text-gray-500 mb-6">
              Accede al historial de versiones, compara cambios y restaura versiones anteriores con el plan Pro.
            </p>
            <a
              href="/pricing"
              className="bg-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
            >
              Desbloquear con Pro &mdash; 9 &euro;/mes
            </a>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-sm text-gray-400">Cargando historial...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-3xl mb-3">&#128196;</span>
            <p className="text-sm text-gray-500">Aun no hay versiones guardadas para este proyecto.</p>
            <p className="text-xs text-gray-400 mt-1">Las versiones se guardan automaticamente al editar.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {versions.map(v => (
              <div key={v.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">Version {v.version_number}</span>
                  <span className="text-xs text-gray-400">{formatDate(v.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{v.context}</p>
                {onRollback && (
                  <button
                    onClick={() => { onRollback(v); onClose(); }}
                    className="mt-2 text-xs text-indigo-600 hover:underline font-medium"
                  >
                    Restaurar esta version
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
