'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project, ProjectVersion } from '@/lib/types'

interface Props {
  project: Project
  onClose: () => void
  plan?: string
  onRestored?: (updatedProject: Project) => void
  versions?: ProjectVersion[]
  onRollback?: (version: ProjectVersion) => void
  loading?: boolean
}

// Algoritmo de diff simple palabra por palabra
function computeDiff(oldText: string, newText: string): Array<{ type: 'same' | 'added' | 'removed'; text: string }> {
  const oldWords = oldText.split(/( |\n)/)
  const newWords = newText.split(/( |\n)/)

  // LCS dp
  const m = oldWords.length
  const n = newWords.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  const result: Array<{ type: 'same' | 'added' | 'removed'; text: string }> = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: 'same', text: oldWords[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: newWords[j - 1] })
      j--
    } else {
      result.unshift({ type: 'removed', text: oldWords[i - 1] })
      i--
    }
  }
  return result
}

export default function HistoryModal({ project, onClose, plan = 'free', onRestored, versions: initialVersions, onRollback, loading: externalLoading }: Props) {
  const isPro = plan === 'pro' || plan === 'team'
  const [versions, setVersions] = useState<ProjectVersion[]>(initialVersions || [])
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!isPro || !project?.id) return
    let cancelled = false
    setLoading(true)
    supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', project.id)
      .order('version_number', { ascending: false })
      .then(({ data }) => {
        if (!cancelled) {
          setVersions(data || [])
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [project?.id, isPro])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  async function handleRestore(version: ProjectVersion) {
    setRestoring(true)
    try {
      // 1. Guardar versión actual antes de restaurar
      const { data: last } = await supabase
        .from('project_versions')
        .select('version_number')
        .eq('project_id', project.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()
      const nextVersion = (last?.version_number ?? 0) + 1

      if (project.context) {
        await supabase.from('project_versions').insert({
          project_id: project.id,
          user_id: project.user_id,
          context: project.context,
          version_number: nextVersion,
        })
      }

      // 2. Aplicar el contexto de la versión restaurada
      const { data: updated } = await supabase
        .from('projects')
        .update({ context: version.context, updated_at: new Date().toISOString() })
        .eq('id', project.id)
        .select()
        .single()

      if (updated) {
        showToast('¡Versión ' + version.version_number + ' restaurada!')
        if (onRestored) onRestored(updated)
        // Recargar versiones
        const { data: refreshed } = await supabase
          .from('project_versions')
          .select('*')
          .eq('project_id', project.id)
          .order('version_number', { ascending: false })
        setVersions(refreshed || [])
        setSelectedVersion(null)
        setShowDiff(false)
        setTimeout(() => onClose(), 1500)
      }
    } catch (err) {
      showToast('Error al restaurar: ' + String(err))
    } finally {
      setRestoring(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // Diff entre la versión seleccionada y la siguiente más reciente (o el estado actual)
  const diffBase = selectedVersion
    ? (() => {
        const idx = versions.findIndex(v => v.id === selectedVersion.id)
        // La versión anterior en el tiempo es la de menor index (más reciente) — mostramos diff contra la siguiente más nueva
        const newerVersion = idx > 0 ? versions[idx - 1] : null
        return newerVersion ? newerVersion.context : project.context || ''
      })()
    : ''

  const diffTokens = selectedVersion && showDiff
    ? computeDiff(selectedVersion.context || '', diffBase)
    : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Toast */}
        {toastMsg && (
          <div className="absolute top-4 right-4 bg-green-600 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-10 font-medium">
            &#10003; {toastMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-gray-900 text-lg">Historial de versiones</h2>
            {versions.length > 0 && isPro && (
              <span className="text-xs bg-violet-50 text-violet-600 font-medium px-2 py-0.5 rounded-full">
                {versions.length} versi{versions.length !== 1 ? 'ones' : 'ón'}
              </span>
            )}
          </div>
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
              className="bg-violet-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-violet-700 transition text-sm"
            >
              Desbloquear con Pro &mdash; 9 &euro;/mes
            </a>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-gray-400">Cargando historial...</p>
            </div>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-3xl mb-3">&#128196;</span>
            <p className="text-sm text-gray-500">Aún no hay versiones guardadas para este contexto.</p>
            <p className="text-xs text-gray-400 mt-1">Las versiones se guardan automáticamente al editar.</p>
          </div>
        ) : selectedVersion && showDiff ? (
          /* VISTA DIFF */
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 shrink-0">
              <button
                onClick={() => { setShowDiff(false); }}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                &#8592; Volver al historial
              </button>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs font-medium text-gray-700">
                Versión {selectedVersion.version_number} &mdash; {formatDate(selectedVersion.created_at)}
              </span>
            </div>

            <div className="px-5 py-3 shrink-0">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
                  Texto añadido después
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
                  Texto eliminado después
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                {diffTokens.map((token, i) => {
                  if (token.type === 'same') return <span key={i}>{token.text}</span>
                  if (token.type === 'added') return (
                    <span key={i} className="bg-green-100 text-green-800 rounded px-0.5">{token.text}</span>
                  )
                  return (
                    <span key={i} className="bg-red-100 text-red-700 line-through rounded px-0.5">{token.text}</span>
                  )
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 shrink-0 flex gap-2">
              <button
                onClick={() => setShowDiff(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRestore(selectedVersion)}
                disabled={restoring}
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-50"
              >
                {restoring ? 'Restaurando...' : '↺ Restaurar esta versión'}
              </button>
            </div>
          </div>
        ) : (
          /* LISTA DE VERSIONES */
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Versión actual */}
            <div className="border-2 border-violet-200 bg-violet-50/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">Versión actual</span>
                  <span className="text-xs bg-violet-100 text-violet-600 font-medium px-2 py-0.5 rounded-full">Activa</span>
                </div>
                <span className="text-xs text-gray-400">
                  {project.updated_at ? formatDate(project.updated_at) : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 font-mono">{project.context || '(vacío)'}</p>
            </div>

            {/* Versiones anteriores */}
            {versions.map((v, idx) => (
              <div
                key={v.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-violet-200 hover:bg-violet-50/20 transition cursor-pointer"
                onClick={() => setSelectedVersion(selectedVersion?.id === v.id ? null : v)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">Versión {v.version_number}</span>
                  <span className="text-xs text-gray-400">{formatDate(v.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 font-mono">{v.context}</p>

                {selectedVersion?.id === v.id && (
                  <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setShowDiff(true) }}
                      className="flex-1 py-1.5 text-xs border border-violet-200 text-violet-600 rounded-lg hover:bg-violet-50 transition font-medium"
                    >
                      &#128269; Ver diferencias
                    </button>
                    <button
                      onClick={() => handleRestore(v)}
                      disabled={restoring}
                      className="flex-1 py-1.5 text-xs bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-semibold disabled:opacity-50"
                    >
                      {restoring ? 'Restaurando...' : '↺ Restaurar'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
