'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface KeeperProfile {
  id: string
  name: string
  emoji: string
  role: string
  tone: string
  rules: string[]
  extra: string
  createdAt: string
}

const STORAGE_KEY = 'keeper_profiles'
const EMOJIS = ['M','A','D','C','B','E','F','G','H','I','J','K','L','N','O','P']
const COLORS = [
  'from-violet-500 to-purple-700',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-amber-500 to-yellow-600',
]

function getColor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

export default function ProfilesPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [plan, setPlan] = useState('free')
  const [profiles, setProfiles] = useState<KeeperProfile[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<KeeperProfile | null>(null)
  const [form, setForm] = useState({ name: '', role: '', tone: '', rules: '', extra: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [copying, setCopying] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (profile?.plan) setPlan(profile.plan)
    }
    init()
    // Cargar profiles desde localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setProfiles(JSON.parse(stored)) } catch(e) {}
    }
  }, [])

  const saveToStorage = (updated: KeeperProfile[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setProfiles(updated)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const openNew = () => {
    setEditingProfile(null)
    setForm({ name: '', role: '', tone: '', rules: '', extra: '' })
    setShowModal(true)
  }

  const openEdit = (p: KeeperProfile) => {
    setEditingProfile(p)
    setForm({ name: p.name, role: p.role, tone: p.tone, rules: p.rules.join('\n'), extra: p.extra })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    setSaving(true)
    const rules = form.rules.split('\n').map(r => r.trim()).filter(Boolean)
    if (editingProfile) {
      const updated = profiles.map(p => p.id === editingProfile.id
        ? { ...p, name: form.name, role: form.role, tone: form.tone, rules, extra: form.extra }
        : p
      )
      saveToStorage(updated)
      showToast('Perfil actualizado')
    } else {
      const newProfile: KeeperProfile = {
        id: Date.now().toString(),
        name: form.name,
        emoji: form.name[0]?.toUpperCase() || 'K',
        role: form.role,
        tone: form.tone,
        rules,
        extra: form.extra,
        createdAt: new Date().toISOString(),
      }
      saveToStorage([...profiles, newProfile])
      showToast('Perfil creado')
    }
    setSaving(false)
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    const updated = profiles.filter(p => p.id !== id)
    saveToStorage(updated)
    showToast('Perfil eliminado')
  }

  const handleCopy = (p: KeeperProfile) => {
    const text = [
      p.name ? 'NOMBRE: ' + p.name : '',
      p.role ? 'ROL: ' + p.role : '',
      p.tone ? 'TONO: ' + p.tone : '',
      p.rules.length > 0 ? 'REGLAS:\n' + p.rules.map(r => '- ' + r).join('\n') : '',
      p.extra ? 'CONTEXTO EXTRA:\n' + p.extra : '',
    ].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopying(p.id)
    setTimeout(() => setCopying(null), 1500)
    showToast('Perfil copiado al portapapeles')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={userEmail} plan={plan} />

      {toast && (
        <div className="fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium bg-gray-900 text-white">
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
            <p className="text-gray-500 text-sm">Identidades persistentes para tu IA. Define tono, rol y reglas una vez. Reutiliza siempre.</p>
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

        {/* Empty state */}
        {profiles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" fill="none" stroke="#7c3aed" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">Tu primera identidad de IA</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">Crea un Keeper Profile con el tono, rol y reglas que quieres que tu IA tenga. Copia el perfil y pegalo al inicio de cualquier chat.</p>
            <button onClick={openNew} className="bg-violet-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors">
              Crear primer perfil
            </button>
          </div>
        )}

        {/* Grid de perfiles */}
        {profiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-300 hover:shadow-md transition-all group">
                {/* Header card */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + getColor(p.name) + " flex items-center justify-center font-bold text-white text-sm shadow-sm"}>
                        {p.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                        <div className="text-violet-600 text-xs font-medium">Keeper Profile</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" title="Editar">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors" title="Eliminar">
                        <svg width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Datos del perfil */}
                  <div className="space-y-2">
                    {p.role && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 text-xs w-10 flex-shrink-0 pt-0.5">Rol</span>
                        <span className="text-gray-700 text-xs leading-relaxed">{p.role}</span>
                      </div>
                    )}
                    {p.tone && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 text-xs w-10 flex-shrink-0 pt-0.5">Tono</span>
                        <span className="text-gray-700 text-xs leading-relaxed">{p.tone}</span>
                      </div>
                    )}
                    {p.rules.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-gray-400 text-xs w-10 flex-shrink-0 pt-0.5">Reglas</span>
                        <div className="flex flex-wrap gap-1">
                          {p.rules.slice(0, 2).map((r, i) => (
                            <span key={i} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md border border-violet-100">{r.length > 25 ? r.slice(0,25)+'...' : r}</span>
                          ))}
                          {p.rules.length > 2 && <span className="text-xs text-gray-400">+{p.rules.length - 2} más</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer card */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-xs">
                    {new Date(p.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
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

        {/* Info banner */}
        {profiles.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-violet-50 border border-violet-100 flex items-start gap-3">
            <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-violet-700 text-xs leading-relaxed">
              <strong>Copia el perfil</strong> y pegalo al inicio de tu chat con ChatGPT, Claude o Gemini. Tu IA adoptara el tono, rol y reglas de ese perfil durante toda la sesion.
            </p>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editingProfile ? 'Editar perfil' : 'Nuevo Keeper Profile'}</h2>
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
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rol</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="ej: CMO experto en B2B SaaS"
                  value={form.role}
                  onChange={e => setForm(f => ({...f, role: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tono y estilo</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="ej: Persuasivo, directo, sin tecnicismos"
                  value={form.tone}
                  onChange={e => setForm(f => ({...f, tone: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reglas (una por linea)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder={"Siempre terminar con un CTA\nEvitar jerga tecnica\nUsar ejemplos reales"}
                  rows={3}
                  value={form.rules}
                  onChange={e => setForm(f => ({...f, rules: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contexto extra (opcional)</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="Informacion adicional que tu IA debe saber siempre..."
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
                {saving ? 'Guardando...' : (editingProfile ? 'Guardar cambios' : 'Crear perfil')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
