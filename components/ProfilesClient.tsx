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
  avatar_url?: string
  created_at: string
  updated_at?: string
}

interface Props {
  userId: string
  userEmail?: string
  plan: string
  initialProfiles: KeeperProfile[]
}

const COLORS = [
  'from-violet-600 to-purple-700',
  'from-blue-600 to-cyan-700',
  'from-emerald-600 to-teal-700',
  'from-orange-600 to-amber-700',
  'from-pink-600 to-rose-700',
  'from-indigo-600 to-blue-700',
]

function getColor(name: string): string {
  const idx = (name.charCodeAt(0) || 0) % COLORS.length
  return COLORS[idx]
}

export default function ProfilesClient({ userId, userEmail, plan, initialProfiles }: Props) {
  const supabase = createClientComponentClient()
  const isPro = plan === 'pro' || plan === 'team'
  const [aiDesc, setAiDesc] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [showAIPanel, setShowAIPanel] = useState(false)

  const [profiles, setProfiles] = useState<KeeperProfile[]>(initialProfiles)
  const [tableError, setTableError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<KeeperProfile | null>(null)
  const [form, setForm] = useState({ name: '', role: '', tone: '', rules: '', extra: '', avatar_url: '' })
  const [saving, setSaving] = useState(false)
  const [chatProfileId, setChatProfileId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'ok'|'err'>('ok')
  const [copying, setCopying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const showToast = (msg: string, type: 'ok'|'err' = 'ok') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(''), 2500)
  }

  const openNew = () => {
    setEditingProfile(null)
    setForm({ name: '', role: '', tone: '', rules: '', extra: '', avatar_url: '' })
    setShowModal(true)
  }

  const openEdit = (p: KeeperProfile) => {
    setEditingProfile(p)
    setForm({
      name: p.name,
      role: p.role || '',
      tone: p.tone || '',
      rules: (p.rules || []).join('\n'),
      extra: p.extra || '',
      avatar_url: p.avatar_url || ''
    })
    setShowModal(true)
  }

  const handleGenerateProfile = async () => {
    if (!aiDesc.trim()) return
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiDesc })
      })
      const data = await res.json()
      if (data.profile) {
        const p = data.profile
        setForm(f => ({
          ...f,
          name: p.name || f.name,
          role: p.role || f.role,
          tone: p.tone || f.tone,
          rules: p.rules || f.rules,
          extra: p.extra || f.extra,
        }))
        setShowAIPanel(false)
        setAiDesc('')
      } else {
        setAiError(data.error || 'Error generando perfil')
      }
    } catch {
      setAiError('Error de conexión')
    }
    setAiLoading(false)
  }

    const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const rules = form.rules.split('\n').map((r: string) => r.trim()).filter(Boolean)
    const emoji = form.name[0]?.toUpperCase() || 'K'
    try {
      if (editingProfile) {
        const { data, error } = await supabase
          .from('keeper_profiles')
          .update({
            name: form.name,
            role: form.role,
            tone: form.tone,
            rules,
            extra: form.extra,
            avatar_url: form.avatar_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProfile.id)
          .select()
          .single()
        if (error) { showToast('Error al guardar', 'err'); setSaving(false); return }
        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? data : p))
        showToast('Perfil actualizado')
      } else {
        const { data, error } = await supabase
          .from('keeper_profiles')
          .insert({ user_id: userId, name: form.name, role: form.role, tone: form.tone, rules, extra: form.extra, emoji, avatar_url: form.avatar_url || null })
          .select()
          .single()
        if (error) { showToast('Error al crear', 'err'); setSaving(false); return }
        setProfiles(prev => [data, ...prev])
        showToast('Perfil creado')
      }
    } catch {
      showToast('Error inesperado', 'err')
    }
    setSaving(false)
    setShowModal(false)
    setEditingProfile(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('keeper_profiles').delete().eq('id', id)
    if (error) { showToast('Error al eliminar', 'err') }
    else {
      setProfiles(prev => prev.filter(p => p.id !== id))
      if (chatProfileId === id) setChatProfileId(null)
      showToast('Perfil eliminado')
    }
    setDeleting(null)
  }

  const handleCopy = (p: KeeperProfile) => {
    const lines = [
      'Eres ' + (p.role || p.name) + '.',
      p.tone ? 'Tu tono es: ' + p.tone + '.' : '',
      (p.rules || []).length > 0 ? 'Sigue siempre estas reglas:\n' + (p.rules || []).map((r: string) => '- ' + r).join('\n') : '',
      p.extra ? '\nContexto adicional:\n' + p.extra : '',
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(lines)
    setCopying(p.id)
    setTimeout(() => setCopying(null), 1500)
    showToast('Perfil copiado al portapapeles')
  }

  const chatProfile = chatProfileId ? profiles.find(p => p.id === chatProfileId) : null

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar userEmail={userEmail} plan={plan} />

      {toast && (
        <div className={"fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium " + (toastType === 'ok' ? 'bg-zinc-900 text-white border border-zinc-700' : 'bg-red-600 text-white')}>
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
              <h1 className="text-2xl font-bold text-white">Keeper Profiles</h1>
              <span className="text-xs bg-violet-900/50 text-violet-300 font-semibold px-2 py-0.5 rounded-full border border-violet-700/50">Beta</span>
            </div>
            <p className="text-zinc-400 text-sm">Identidades persistentes para tu IA. Define tono, rol y reglas.</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
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
            <div className="w-16 h-16 rounded-2xl bg-violet-900/30 border border-violet-700/50 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" fill="none" stroke="#a78bfa" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Define la identidad de tu IA</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Un Keeper Profile es quien quieres que sea tu IA. Tono, rol, reglas. Crea uno y p&#233;galo al inicio de cualquier chat.
            </p>
            <button onClick={openNew} className="bg-violet-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-violet-500 transition-colors">
              Crear primer perfil
            </button>
          </div>
        )}

        {/* Grid */}
        {profiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-violet-700/60 transition-all group">
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-zinc-700" />
                      ) : (
                        <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + getColor(p.name) + " flex items-center justify-center font-bold text-white text-sm"}>
                          {(p.emoji || p.name[0] || 'K').toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-sm leading-tight">{p.name}</div>
                        <div className="text-violet-400 text-xs font-medium">Keeper Profile</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors text-zinc-400" title="Editar">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="w-7 h-7 rounded-lg hover:bg-red-900/30 flex items-center justify-center transition-colors"
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
                        <span className="text-zinc-500 text-xs w-8 flex-shrink-0 pt-0.5">Rol</span>
                        <span className="text-zinc-300 text-xs leading-relaxed line-clamp-2">{p.role}</span>
                      </div>
                    )}
                    {p.tone && (
                      <div className="flex gap-2 items-start">
                        <span className="text-zinc-500 text-xs w-8 flex-shrink-0 pt-0.5">Tono</span>
                        <span className="text-zinc-300 text-xs leading-relaxed">{p.tone}</span>
                      </div>
                    )}
                    {(p.rules || []).length > 0 && (
                      <div className="flex gap-2 items-start">
                        <span className="text-zinc-500 text-xs w-8 flex-shrink-0 pt-0.5">Reglas</span>
                        <div className="flex flex-wrap gap-1">
                          {(p.rules || []).slice(0, 2).map((r: string, i: number) => (
                            <span key={i} className="text-xs bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded-md border border-violet-800/50">
                              {r.length > 28 ? r.slice(0, 28) + '...' : r}
                            </span>
                          ))}
                          {(p.rules || []).length > 2 && (
                            <span className="text-xs text-zinc-500">+{(p.rules || []).length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-5 py-3 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-600 text-xs">
                    {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(p)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
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
                          Copiar
                        </>
                      )}
                    </button>
                    <span className="text-zinc-700">&#124;</span>
                    <button
                      onClick={() => setChatProfileId(chatProfileId === p.id ? null : p.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-violet-300 transition-colors"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {chatProfileId === p.id ? 'Cerrar' : 'Chat'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat panel - OUTSIDE the grid */}
        {chatProfile && (
          <div className="mt-6">
            <ProfileChat profile={chatProfile} onClose={() => setChatProfileId(null)} />
          </div>
        )}

        {/* Info tip */}
        {profiles.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
            <svg width="16" height="16" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-zinc-400 text-xs leading-relaxed">
              <strong className="text-zinc-200">C&#243;mo usar:</strong> Haz clic en &#34;Copiar&#34; y pega el texto al inicio de tu chat con cualquier IA. Tu asistente adoptar&#225; ese rol y tono durante toda la sesi&#243;n.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="font-bold text-white">{editingProfile ? 'Editar perfil' : 'Nuevo Keeper Profile'}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Define la identidad de tu IA</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowAIPanel(!showAIPanel); setAiError('') }}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-600/30 transition-colors"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generar con IA
                </button>
                <button onClick={() => { setShowModal(false); setShowAIPanel(false) }} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center transition-colors text-zinc-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* AI Generation Panel */}
              {showAIPanel && (
                <div className="bg-violet-950/30 border border-violet-700/40 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-violet-300">Describe el tipo de perfil que quieres crear</p>
                  <textarea
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none transition-colors"
                    placeholder="ej: Analista financiero senior especializado en startups, con tono formal pero accesible"
                    rows={3}
                    value={aiDesc}
                    onChange={e => setAiDesc(e.target.value)}
                  />
                  {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateProfile}
                      disabled={aiLoading || !aiDesc.trim()}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {aiLoading ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generar perfil
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => { setShowAIPanel(false); setAiDesc(''); setAiError('') }}
                      className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nombre del perfil *</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  placeholder="ej: Asistente de Marketing"
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Rol</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  placeholder="ej: CMO experto en B2B SaaS con 10 a&#241;os de experiencia"
                  value={form.role}
                  onChange={e => setForm(f => ({...f, role: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tono y estilo</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  placeholder="ej: Directo, persuasivo, sin jerga t&#233;cnica"
                  value={form.tone}
                  onChange={e => setForm(f => ({...f, tone: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Reglas <span className="text-zinc-500 font-normal">(una por l&#237;nea)</span></label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none transition-colors"
                  placeholder="Siempre terminar con un CTA"
                  rows={3}
                  value={form.rules}
                  onChange={e => setForm(f => ({...f, rules: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Contexto extra <span className="text-zinc-500 font-normal">(opcional)</span></label>
                <textarea
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none transition-colors"
                  placeholder="Informaci&#243;n de empresa, proyecto, audiencia..."
                  rows={2}
                  value={form.extra}
                  onChange={e => setForm(f => ({...f, extra: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Avatar / GIF <span className="text-zinc-500 font-normal">(URL de imagen)</span></label>
                <input
                  type="url"
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  placeholder="https://..."
                  value={form.avatar_url}
                  onChange={e => setForm(f => ({...f, avatar_url: e.target.value}))}
                />
                {form.avatar_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={form.avatar_url} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-zinc-700" onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none' }} />
                    <span className="text-zinc-500 text-xs">Vista previa</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-zinc-700 text-zinc-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                className="flex-1 bg-violet-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-violet-500 transition-colors disabled:opacity-50"
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

function ProfileChat({ profile, onClose }: { profile: KeeperProfile; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hola! Soy ' + profile.name + '. ' + (profile.role ? 'Mi rol es: ' + profile.role + '.' : '') + ' \u00bfEn qu\u00e9 te ayudo?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const systemPrompt = [
        profile.name && 'Nombre: ' + profile.name,
        profile.role && 'Rol: ' + profile.role,
        profile.tone && 'Tono y estilo: ' + profile.tone,
        profile.rules?.length && 'Reglas: ' + profile.rules.join(', '),
        profile.extra && 'Contexto adicional: ' + profile.extra,
      ].filter(Boolean).join('\n')
      const res = await fetch('/api/chat-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, systemPrompt, history: messages.slice(-6) })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'Error' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexi\u00f3n' }])
    }
    setLoading(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.name} className="w-8 h-8 rounded-xl object-cover border border-zinc-600" />
        ) : (
          <div className={"w-8 h-8 rounded-xl bg-gradient-to-br " + getColor(profile.name) + " flex items-center justify-center text-white font-bold text-xs"}>
            {profile.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">{profile.name}</p>
          {profile.role && <p className="text-xs text-zinc-400 line-clamp-1">{profile.role}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-zinc-500">IA activa</span>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white transition-colors ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={"max-w-xs px-3 py-2 rounded-xl text-sm " + (msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700')}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-xl">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-zinc-800 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder={"Escr\u00edbele a " + profile.name + "..."}
          disabled={loading}
          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
