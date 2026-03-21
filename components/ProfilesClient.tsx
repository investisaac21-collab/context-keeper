'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'

interface KeeperProfile {
  id: string
  user_id: string
  name: string
  role?: string
  tone?: string
  rules?: string[]
  extra?: string
  emoji?: string
  created_at: string
}

interface Props {
  userId: string
  userEmail: string
  plan: string
  initialProfiles: KeeperProfile[]
}

const COLORS = [
  'from-violet-500 to-purple-700',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-yellow-600',
]

function getColor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length]
}

export default function ProfilesClient({ userId, userEmail, plan, initialProfiles }: Props) {
  const supabase = createClientComponentClient()
  const isPro = plan === 'pro' || plan === 'team'

  const [profiles, setProfiles] = useState<KeeperProfile[]>(initialProfiles)
  const [tableReady, setTableReady] = useState(initialProfiles.length >= 0)
  const [tableError, setTableError] = useState(false)

  // Auto-setup: verificar/crear tabla al montar si no hay perfiles cargados
  useState(() => {
    if (initialProfiles.length === 0) {
      fetch('/api/setup-profiles').then(r => r.json()).then(d => {
        if (d.ok) setTableReady(true)
        else if (d.sql) setTableError(true)
      }).catch(() => setTableReady(true))
    }
  })
  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<KeeperProfile | null>(null)
  const [form, setForm] = useState({ name: '', role: '', tone: '', rules: '', extra: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'ok'|'err'>('ok')
  const [copying, setCopying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const showToast = (msg: string, type: 'ok'|'err' = 'ok') => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(''), 2500)
  }

  const openNew = () => {
    setEditingProfile(null)
    setForm({ name: '', role: '', tone: '', rules: '', extra: '' })
    setShowModal(true)
  }

  const openEdit = (p: KeeperProfile) => {
    setEditingProfile(p)
    setForm({
      name: p.name,
      role: p.role || '',
      tone: p.tone || '',
      rules: (p.rules || []).join('\n'),
      extra: p.extra || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const rules = form.rules.split('\n').map(r => r.trim()).filter(Boolean)
    const emoji = form.name[0]?.toUpperCase() || 'K'

    try {
      if (editingProfile) {
        const { data, error } = await supabase
          .from('keeper_profiles')
          .update({ name: form.name, role: form.role, tone: form.tone, rules, extra: form.extra, updated_at: new Date().toISOString() })
          .eq('id', editingProfile.id)
          .select()
          .single()
        if (error) throw error
        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? data : p))
        showToast('Perfil actualizado')
      } else {
        const { data, error } = await supabase
          .from('keeper_profiles')
          .insert({ user_id: userId, name: form.name, role: form.role, tone: form.tone, rules, extra: form.extra, emoji })
          .select()
          .single()
        if (error) throw error
        setProfiles(prev => [data, ...prev])
        showToast('Perfil creado')
      }
      setShowModal(false)
    } catch(e: any) {
      showToast('Error: ' + (e.message || 'algo salio mal'), 'err')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('keeper_profiles').delete().eq('id', id)
    if (!error) {
      setProfiles(prev => prev.filter(p => p.id !== id))
      showToast('Perfil eliminado')
    } else {
      showToast('Error al eliminar', 'err')
    }
    setDeleting(null)
  }

  const handleCopy = (p: KeeperProfile) => {
    const lines = [
      'Eres ' + (p.role || p.name) + '.',
      p.tone ? 'Tu tono es: ' + p.tone + '.' : '',
      (p.rules || []).length > 0 ? 'Sigue siempre estas reglas:\n' + (p.rules || []).map(r => '- ' + r).join('\n') : '',
      p.extra ? '\nContexto adicional:\n' + p.extra : '',
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(lines)
    setCopying(p.id)
    setTimeout(() => setCopying(null), 1500)
    showToast('Perfil copiado al portapapeles')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={userEmail} plan={plan} />

      {tableError && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <svg width="16" height="16" fill="none" stroke="#d97706" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-amber-800 text-xs">La tabla de perfiles no existe aun en Supabase. Crea la tabla <strong>keeper_profiles</strong> en tu dashboard de Supabase para activar esta funcion.</p>
            <a href="https://supabase.com/dashboard" target="_blank" className="ml-auto text-xs font-semibold text-amber-700 underline">Ir a Supabase</a>
          </div>
        </div>
      )}

      {toast && (
        <div className={"fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium " + (toastType === 'ok' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white')}>
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Keeper Profiles</h1>
              <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">Beta</span>
            </div>
            <p className="text-gray-500 text-sm">Identidades persistentes para tu IA. Define tono, rol y reglas. Copia y pega en cualquier chat.</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo perfil
          </button>
        </div>

        {/* Stats bar */}
        {profiles.length > 0 && (
          <div className="flex items-center gap-4 mb-6 p-3 bg-white rounded-xl border border-gray-200 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              <span className="text-gray-600 font-medium">{profiles.length} perfil{profiles.length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <span className="text-gray-400 text-xs">Los perfiles se sincronizan entre dispositivos</span>
            <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Sincronizado
            </div>
          </div>
        )}

        {/* Empty state */}
        {profiles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg width="28" height="28" fill="none" stroke="#7c3aed" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">Define la identidad de tu IA</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Un Keeper Profile es quien quieres que sea tu IA. Tono, rol, reglas. Crea uno, copialo, y pegalo al inicio de cualquier chat.
            </p>
            <button onClick={openNew} className="bg-violet-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors">
              Crear primer perfil
            </button>

            {/* Ejemplo visual */}
            <div className="mt-10 max-w-xs mx-auto text-left">
              <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">Ejemplo</p>
              <div className="bg-white rounded-2xl border border-violet-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-white text-xs">M</div>
                  <div>
                    <div className="text-gray-900 font-semibold text-xs">Marketing Lead</div>
                    <div className="text-violet-500 text-xs">Keeper Profile</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex gap-2"><span className="text-gray-400 text-xs w-8">Rol</span><span className="text-gray-600 text-xs">CMO experto en B2B SaaS</span></div>
                  <div className="flex gap-2"><span className="text-gray-400 text-xs w-8">Tono</span><span className="text-gray-600 text-xs">Persuasivo, directo</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {profiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-300 hover:shadow-md transition-all group">
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + getColor(p.name) + " flex items-center justify-center font-bold text-white text-sm shadow-sm"}>
                        {(p.emoji || p.name[0] || 'K').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight">{p.name}</div>
                        <div className="text-violet-600 text-xs font-medium">Keeper Profile</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title="Editar">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
                        title="Eliminar"
                      >
                        {deleting === p.id ? (
                          <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {p.role && (
                      <div className="flex gap-2 items-start">
                        <span className="text-gray-400 text-xs w-8 flex-shrink-0 pt-0.5">Rol</span>
                        <span className="text-gray-700 text-xs leading-relaxed">{p.role}</span>
                      </div>
                    )}
                    {p.tone && (
                      <div className="flex gap-2 items-start">
                        <span className="text-gray-400 text-xs w-8 flex-shrink-0 pt-0.5">Tono</span>
                        <span className="text-gray-700 text-xs leading-relaxed">{p.tone}</span>
                      </div>
                    )}
                    {(p.rules || []).length > 0 && (
                      <div className="flex gap-2 items-start">
                        <span className="text-gray-400 text-xs w-8 flex-shrink-0 pt-0.5">Reglas</span>
                        <div className="flex flex-wrap gap-1">
                          {(p.rules || []).slice(0, 2).map((r, i) => (
                            <span key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md border border-violet-100 leading-relaxed">
                              {r.length > 28 ? r.slice(0, 28) + '...' : r}
                            </span>
                          ))}
                          {(p.rules || []).length > 2 && (
                            <span className="text-xs text-gray-400">+{(p.rules || []).length - 2} mas</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-xs">
                    {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                  <button
                    onClick={() => handleCopy(p)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                  >
                    {copying === p.id ? (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar perfil
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        {profiles.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-start gap-3">
            <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-violet-700 text-xs leading-relaxed">
              <strong>Como usar:</strong> Haz clic en "Copiar perfil" y pega el texto al inicio de tu chat con cualquier IA. Tu asistente adoptara ese rol y tono durante toda la sesion.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{editingProfile ? 'Editar perfil' : 'Nuevo Keeper Profile'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Define la identidad de tu IA</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nombre del perfil *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="ej: Asistente de Marketing"
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rol</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="ej: CMO experto en B2B SaaS con 10 anos de experiencia"
                  value={form.role}
                  onChange={e => setForm(f => ({...f, role: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tono y estilo</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="ej: Directo, persuasivo, sin jerga tecnica"
                  value={form.tone}
                  onChange={e => setForm(f => ({...f, tone: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reglas de comportamiento <span className="text-gray-400 font-normal">(una por linea)</span></label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder={"Siempre terminar con un CTA\nEvitar jerga tecnica\nUsar ejemplos reales y concretos"}
                  rows={3}
                  value={form.rules}
                  onChange={e => setForm(f => ({...f, rules: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contexto extra <span className="text-gray-400 font-normal">(opcional)</span></label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="Informacion de empresa, proyecto, audiencia que tu IA debe saber siempre..."
                  rows={2}
                  value={form.extra}
                  onChange={e => setForm(f => ({...f, extra: e.target.value}))}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="flex-1 bg-violet-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : editingProfile ? 'Guardar cambios' : 'Crear perfil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
