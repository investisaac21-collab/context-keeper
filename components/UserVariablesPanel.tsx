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
  const [justAdded, setJustAdded] = useState<string | null>(null)
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
      setJustAdded(data.id)
      setTimeout(() => setJustAdded(null), 2000)
      setNewName('')
      setNewDefault('')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('user_variables').delete().eq('id', id)
    setVariables((prev: UserVariable[]) => prev.filter(v => v.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="card p-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-violet-600">&#9889;</span>
          <span className="font-semibold text-gray-900">Mis Variables</span>
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">{variables.length}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3">
            <p className="text-xs text-sky-700 leading-relaxed">
              Define variables globales con valores por defecto. Las reutilizas en proyectos escribiendo{' '}
              <code className="bg-sky-100 px-1 rounded font-mono">{'{{nombre_variable}}'}</code> en el prompt.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="nombre_variable"
              value={newName}
              onChange={e => setNewName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              onKeyDown={handleKeyDown}
              className="input flex-1 text-sm font-mono"
            />
            <input
              type="text"
              placeholder="Valor por defecto..."
              value={newDefault}
              onChange={e => setNewDefault(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input flex-1 text-sm"
            />
            <button
              onClick={handleAdd}
              disabled={loading || !newName.trim()}
              className="btn-primary text-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              AÃ±adir
            </button>
          </div>

          {variables.length > 0 ? (
            <div className="space-y-2">
              {variables.map(v => (
                <div
                  key={v.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    justAdded === v.id ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <code className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-mono flex-shrink-0">
                    {'{{'}{v.name}{'}}'}
                  </code>
                  <span className="text-sm text-gray-600 flex-1 truncate">
                    {v.default_value || <span className="text-gray-400 italic">Sin valor por defecto</span>}
                  </span>
                  {justAdded === v.id && (
                    <span className="text-xs text-green-600 font-medium shrink-0">&#10003; AÃ±adida</span>
                  )}
                  <button onClick={() => handleDelete(v.id)} className="p-1 text-gray-400 hover:text-red-500 rounded shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
              <div className="text-2xl mb-2">&#128204;</div>
              <p className="text-sm font-medium text-gray-700 mb-1">AÃºn no tienes variables guardadas</p>
              <p className="text-xs text-gray-400 mb-3">
                Las variables te permiten reutilizar valores entre proyectos sin escribirlos cada vez.
              </p>
              <div className="inline-flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                <code className="font-mono">{'{{empresa}}'}</code>
                <span className="text-gray-400">&#8594;</span>
                <span>Anthropic</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
