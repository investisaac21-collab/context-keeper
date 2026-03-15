'use client'
import type { ProjectVersion } from '@/lib/types'

interface Props {
  versions: ProjectVersion[]
  onRollback: (version: ProjectVersion) => void
  onClose: () => void
  loading: boolean
}

export default function HistoryModal({ versions, onRollback, onClose, loading }: Props) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Historial de versiones</h2>
              <p className="text-sm text-gray-500 mt-0.5">{versions.length} version{versions.length !== 1 ? 'es' : ''} guardada{versions.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {versions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">Sin historial aun</p>
              <p className="text-xs mt-1">Las versiones se guardan automaticamente al editar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((v, i) => (
                <div key={v.id} className="border border-gray-200 rounded-xl p-4 hover:border-sky-300 hover:bg-sky-50 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">v{v.version_number}</span>
                        {i === 0 && <span className="text-xs text-gray-400">(mas reciente)</span>}
                        <span className="text-xs text-gray-400 ml-auto">{formatDate(v.created_at)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1.5">{v.name}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{v.context}</p>
                      {v.tag && (
                        <span className="inline-block mt-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{v.tag}</span>
                      )}
                    </div>
                    <button
                      onClick={() => onRollback(v)}
                      disabled={loading || i === 0}
                      className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {i === 0 ? 'Actual' : 'Restaurar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}