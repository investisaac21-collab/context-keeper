'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { UserVariable } from '@/lib/types'

interface Props {
  variables?: UserVariable[]
  initialVariables?: UserVariable[]
  setVariables?: React.Dispatch<React.SetStateAction<UserVariable[]>>
  userId: string
  plan?: string
}

export default function UserVariablesPanel({ variables: propVars, initialVariables, setVariables: setPropVars, userId, plan = 'free' }: Props) {
  const [variables, setVariables] = useState<UserVariable[]>(propVars || initialVariables || [])
  const [newName, setNewName] = useState('')
  const [newDefault, setNewDefault] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const supabase = createClientComponentClient()

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('user_variables')
      .insert({ user_id: userId, name: newName.trim(), default_value: newDefault.trim() })
      .select()
      .single()
    if (!error && data) {
      setVariables((prev: UserVariable[]) => [...prev, data])
      setNewName('')
      setNewDefault('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('user_variables').delete().eq('id', id)
    setVariables((prev: UserVariable[]) => prev.filter(v => v.id !== id))
  }

  return (
    <div className="card p-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-semibold text-gray-900">Mis Variables</span>
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">{variables.length}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-gray-500">Define tus variables personalizadas con valores por defecto. Apareceran disponibles al crear o editar proyectos.</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="nombre_variable"
              value={newName}
              onChange={e => setNewName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              className="input flex-1 text-sm font-mono"
            />
            <input
              type="text"
              placeholder="Valor por defecto..."
              value={newDefault}
              onChange={e => setNewDefault(e.target.value)}
              className="input flex-1 text-sm"
            />
            <button
              onClick={handleAdd}
              disabled={loading || !newName.trim()}
              className="btn-primary text-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir
            </button>
          </div>

          {variables.length > 0 ? (
            <div className="space-y-2">
              {variables.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-mono flex-shrink-0">{'{{'}{v.name}{'}}'}</code>
                  <span className="text-sm text-gray-600 flex-1 truncate">{v.default_value || 'Sin valor por defecto'}</span>
                  <button onClick={() => handleDelete(v.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-3">Sin variables aun. Añade la primera arriba.</p>
          )}
        </div>
      )}
    </div>
  )
}