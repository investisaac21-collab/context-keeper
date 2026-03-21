'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Project } from '@/lib/types'
import HistoryModal from './HistoryModal'
import ProjectModal from './ProjectModal'
import Navbar from './Navbar'

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map((m: string) => m.replace(/\{\{|\}\}/g, '')))]
}

function fillVariables(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_: string, key: string) => vars[key] || '{{' + key + '}}')
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  project: Project
  plan: string
  userId: string
  userEmail?: string
}

export default function ProjectDetailClient({ project: initialProject, plan, userId, userEmail }: Props) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [project, setProject] = useState<Project>(initialProject)
  const [showHistory, setShowHistory] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [varValues, setVarValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Chat refinamiento
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [refinedPreview, setRefinedPreview] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Toast global
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const isPro = plan === 'pro' || plan === 'team'
  const planLabel = plan === 'team' ? 'Team' : plan === 'pro' ? 'Pro' : 'Free'
  const detectedVars = extractVariables(project.context || '')
  const missingVars = detectedVars.filter(v => !varValues[v])
  const previewText = fillVariables(project.context || '', varValues)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function saveVersion(context: string) {
    if (!isPro) return
    const { data: last } = await supabase
      .from('project_versions')
      .select('version_number')
      .eq('project_id', project.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()
    const nextVersion = (last?.version_number ?? 0) + 1
    await supabase.from('project_versions').insert({
      project_id: project.id,
      user_id: userId,
      context,
      version_number: nextVersion,
    })
  }

  async function handleSave(data: Partial<Project>) {
    setLoading(true)
    if (project.context) {
      await saveVersion(project.context)
    }
    const { data: updated } = await supabase
      .from('projects')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', project.id)
      .select()
      .single()
    if (updated) setProject(updated)
    setLoading(false)
    setShowEdit(false)
    showToast('Proyecto guardado correctamente')
  }

  async function handleDuplicate() {
    const { data: created } = await supabase
      .from('projects')
      .insert({
        name: project.name + ' (copia)',
        context: project.context,
        tag: project.tag,
        user_id: userId,
      })
      .select()
      .single()
    if (created) {
      showToast('Proyecto duplicado')
      router.push('/dashboard')
    }
  }

  async function handleDelete() {
    if (!confirm('\u00c3\u0083\u00c2\u0082\u00c3\u0082\u00c2\u00bfSeguro que quieres eliminar este proyecto? Esta acci\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b3n no se puede deshacer.')) return
    await supabase.from('projects').delete().eq('id', project.id)
    router.push('/dashboard')
  }

  function handleCopy() {
    navigator.clipboard.writeText(previewText)
    setCopied(true)
    showToast('\u00c3\u0083\u00c2\u0082\u00c3\u0082\u00c2\u00a1Prompt copiado al portapapeles!')
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleChatSend() {
    if (!chatInput.trim() || chatLoading) return
    const instruction = chatInput.trim()
    setChatInput('')
    setChatError('')

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: instruction }]
    setChatMessages(newMessages)
    setChatLoading(true)

    try {
      const res = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrompt: refinedPreview || project.context,
          instruction,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setRefinedPreview(data.refined)
      setChatMessages([...newMessages, { role: 'assistant', content: data.refined }])
    } catch (err) {
      setChatError('Error al refinar: ' + String(err))
    } finally {
      setChatLoading(false)
    }
  }

  async function handleApplyRefined() {
    if (!refinedPreview) return
    setLoading(true)
    if (project.context) await saveVersion(project.context)
    const { data: updated } = await supabase
      .from('projects')
      .update({ context: refinedPreview, updated_at: new Date().toISOString() })
      .eq('id', project.id)
      .select()
      .single()
    if (updated) {
      setProject(updated)
      setRefinedPreview('')
      setChatMessages([])
      setShowChat(false)
      showToast('\u00c3\u0083\u00c2\u0082\u00c3\u0082\u00c2\u00a1Prompt actualizado con el refinamiento de IA!')
    }
    setLoading(false)
  }

  const categoryColors: Record<string, string> = {
    coding: 'bg-blue-100 text-blue-800',
    writing: 'bg-green-100 text-green-800',
    analysis: 'bg-purple-100 text-purple-800',
    marketing: 'bg-yellow-100 text-yellow-800',
    IA: 'bg-violet-100 text-violet-800',
    Desarrollo: 'bg-blue-100 text-blue-800',
    Marketing: 'bg-yellow-100 text-yellow-800',
    Negocios: 'bg-orange-100 text-orange-800',
    Educacion: 'bg-teal-100 text-teal-800',
    Personal: 'bg-pink-100 text-pink-800',
    Otro: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-700',
  }

  const category = project.category || project.tag || ''
  const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={userEmail} plan={plan} />

      {/* Toast global */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? '&#10003; ' : '&#9888; '}{toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <a href="/dashboard" className="hover:text-violet-600 transition">Mis Proyectos</a>
          <span>/</span>
          <span className="text-gray-700 font-medium">{project.name}</span>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                {category && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                    {category}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  plan === 'team' ? 'bg-purple-100 text-purple-700' :
                  plan === 'pro' ? 'bg-violet-100 text-violet-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  Plan {planLabel}
                </span>
              </div>
              {project.updated_at && (
                <p className="text-xs text-gray-400">
                  \u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u009altima edici\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b3n:{' '}
                  {new Date(project.updated_at).toLocaleDateString('es-ES', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href="/dashboard"
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
              >
                &#8592; Dashboard
              </a>
              <button
                onClick={() => setShowHistory(true)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
              >
                Historial {!isPro && <span className="text-gray-300 text-xs">&#128274;</span>}
              </button>
              <button
                onClick={handleDuplicate}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Duplicar
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="text-xs px-3 py-1.5 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {/* Variables detectadas */}
        {detectedVars.length === 0 && project.context && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-4 mb-4 text-center">
            <p className="text-sm text-gray-400 italic">
              Sin variables din\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1micas. A\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b1ade <code className="font-mono bg-gray-100 px-1 rounded text-xs">{'{{'+'nombre'+'}}'}</code> al contexto para personalizar el prompt.
            </p>
          </div>
        )}
        {detectedVars.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Variables detectadas
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {detectedVars.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detectedVars.map(v => (
                <div key={v} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 font-mono">{v}</label>
                  <input
                    type="text"
                    value={varValues[v] || ''}
                    onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={'Valor para ' + v}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              ))}
            </div>
            {missingVars.length > 0 && (
              <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                &#9888; {missingVars.length} variable{missingVars.length !== 1 ? 's' : ''} sin rellenar.
                El prompt se copiar\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1 con los marcadores sin sustituir.
              </p>
            )}
          </div>
        )}

        {/* Vista previa */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-900">Vista previa del prompt</h2>
            <div className="flex gap-2">
              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(previewText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 rounded-lg font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center gap-1.5"
                title="Abrir prompt en ChatGPT"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                  <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.387 2.019-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.401-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                </svg>
                ChatGPT
              </a>
              <button
                onClick={handleCopy}
                className={`text-sm px-4 py-1.5 rounded-lg font-medium transition ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {copied ? '&#10003; Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {previewText || (
              <span className="text-gray-400 italic">Este proyecto no tiene contenido a\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00ban.</span>
            )}
          </div>
        </div>

        {/* CHAT DE REFINAMIENTO IA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
          <button
            onClick={() => { if (isPro) setShowChat(!showChat) }}
            className={`w-full flex items-center justify-between p-5 transition ${
              isPro ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPro ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gray-100'
              }`}>
                <span className="text-sm">&#129302;</span>
              </div>
              <div className="text-left">
                <p className={`font-semibold text-sm ${isPro ? 'text-gray-900' : 'text-gray-400'}`}>
                  Refinar con IA
                  {!isPro && <span className="ml-2 text-gray-300">&#128274;</span>}
                </p>
                <p className={`text-xs ${isPro ? 'text-gray-500' : 'text-gray-300'}`}>
                  {isPro ? 'Dile a la IA c\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b3mo mejorar este prompt' : 'Disponible en plan Pro'}
                </p>
              </div>
            </div>
            {isPro && (
              <span className="text-gray-400 text-lg">{showChat ? '&#8964;' : '&#8963;'}</span>
            )}
            {!isPro && (
              <a
                href="/pricing"
                onClick={e => e.stopPropagation()}
                className="text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition"
              >
                Hazte Pro
              </a>
            )}
          </button>

          {isPro && showChat && (
            <div className="border-t border-gray-100">
              {/* Mensajes del chat */}
              <div className="max-h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-400 mb-3">Dile a la IA c\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b3mo quieres mejorar el prompt</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        'H\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1zlo m\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1s formal',
                        'H\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1zlo m\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1s corto',
                        'A\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b1ade m\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1s detalle',
                        'Cambia el tono a amigable',
                        'A\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b1ade instrucciones de formato',
                      ].map(s => (
                        <button
                          key={s}
                          onClick={() => setChatInput(s)}
                          className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div>
                          <p className="text-xs text-violet-500 font-medium mb-1.5">Prompt refinado:</p>
                          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{msg.content}</p>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                {chatError && (
                  <p className="text-xs text-red-500 text-center">{chatError}</p>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input del chat */}
              <div className="p-4 border-t border-gray-100 bg-white">
                {refinedPreview && (
                  <div className="mb-3 p-3 bg-violet-50 border border-violet-200 rounded-xl flex items-center justify-between gap-3">
                    <p className="text-xs text-violet-700 font-medium">
                      &#10003; Tienes un prompt refinado listo para guardar
                    </p>
                    <button
                      onClick={handleApplyRefined}
                      disabled={loading}
                      className="shrink-0 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition font-medium"
                    >
                      {loading ? 'Guardando...' : 'Aplicar y guardar'}
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                    placeholder="Ej: H\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1zlo m\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00a1s formal, a\u00c3\u0083\u00c2\u0083\u00c3\u0082\u00c2\u00b1ade contexto sobre..."
                    disabled={chatLoading}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
                  />
                  <button
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-40"
                  >
                    &#10148;
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Enter para enviar &bull; Solo plan Pro</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <HistoryModal
          project={project}
          onClose={() => setShowHistory(false)}
          plan={plan}
          onRestored={(updated) => {
            setProject(updated)
            setShowHistory(false)
            showToast('\u00a1Versi\u00f3n restaurada correctamente!')
          }}
        />
      )}
      {showEdit && (
        <ProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </div>
  )
}
