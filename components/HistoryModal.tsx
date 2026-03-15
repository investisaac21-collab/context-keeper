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
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Historial de versiones</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay versiones guardadas</p>
          ) : (
            <div className="flex flex-col gap-3">
              {versions.map((v: ProjectVersion) => (
                <div key={v.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-indigo-600">v{v.version_number}</span>
                        <span className="text-xs text-gray-400 ml-auto">{formatDate(v.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{v.context}</p>
                    </div>
                    <button
                      onClick={() => onRollback(v)}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Restaurar
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
