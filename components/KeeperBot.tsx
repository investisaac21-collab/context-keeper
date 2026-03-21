'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface Message { role: 'user' | 'assistant'; content: string }
interface KeeperBotProps { userId: string; plan: string }

export default function KeeperBot({ userId, plan }: KeeperBotProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([] as Message[])
  const [loading, setLoading] = useState(false)
  const [contexts, setContexts] = useState([] as any[])
  const [profiles, setProfiles] = useState([] as any[])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [visible, setVisible] = useState(false)
  const messagesEndRef = useRef(null as HTMLDivElement | null)
  const inputRef = useRef(null as HTMLInputElement | null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(p => !p) }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => { if (inputRef.current) inputRef.current.focus() }, 100)
  }, [open])

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!open || dataLoaded) return
    supabase.from('projects').select('name, context').eq('user_id', userId).limit(20)
      .then(c => supabase.from('keeper_profiles').select('name, role, tone').eq('user_id', userId).limit(10)
        .then(p => {
          const ctxList = c.data || []
          const profList = p.data || []
          setContexts(ctxList)
          setProfiles(profList)
          setDataLoaded(true)
          const n = ctxList.length
          let msg = 'Hola. Soy tu asistente de Keeper. ¿Qué necesitas?'
          if (n > 0) { msg = '¿En qué te ayudo? Tienes ' + n + ' contexto' + (n !== 1 ? 's' : '') + ' listos.' }
          setMessages([{ role: 'assistant', content: msg }])
        })
      ).catch(() => { setDataLoaded(true) })
  }, [open])

  async function send() {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    const hist: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(hist)
    setLoading(true)
    try {
      const r = await fetch('/api/keeper-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: hist.slice(-10), contexts, profiles }),
      })
      const d = await r.json()
      setMessages(prev => [...prev, { role: 'assistant', content: d.reply || d.error || 'Sin respuesta' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión.' }])
    }
    setLoading(false)
  }

  const suggestions = ['¿Qué contextos tengo?', 'Crea uno para marketing', '¿Cómo funciona Keeper?']

  return (
    <>
      {/* Trigger button — minimal, premium */}
      <button
        onClick={() => setOpen(o => !o)}
        className={
          'fixed bottom-7 right-7 z-50 group transition-all duration-500 ' +
          (visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')
        }
        title="Keeper AI (Ctrl+K)"
      >
        <div className={
          'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ' +
          (open
            ? 'bg-zinc-800 border border-zinc-700 shadow-none scale-95'
            : 'bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 shadow-2xl hover:shadow-violet-500/10 hover:scale-105')
        }>
          {/* Glow ring when closed */}
          {!open && (
            <div className="absolute inset-0 rounded-2xl bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          {open ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" className="text-zinc-300 group-hover:text-violet-400 transition-colors duration-200">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" fill="currentColor"/>
            </svg>
          )}
        </div>
        {/* Tooltip */}
        {!open && (
          <span className="absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-1 group-hover:translate-x-0">
            Keeper AI
            <span className="ml-2 text-zinc-600">⌘K</span>
          </span>
        )}
      </button>

      {/* Panel — command palette style */}
      {open && (
        <div
          className="fixed bottom-24 right-7 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          style={{
            maxHeight: '540px',
            backdropFilter: 'blur(20px)',
            background: 'linear-gradient(135deg, rgba(9,9,11,0.98) 0%, rgba(12,10,16,0.98) 100%)',
            boxShadow: '0 0 0 1px rgba(139,92,246,0.06), 0 32px 64px -12px rgba(0,0,0,0.8), 0 0 60px -20px rgba(139,92,246,0.08)'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/60">
            <div className="w-7 h-7 rounded-lg bg-violet-600/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" className="text-violet-400">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white tracking-tight">Keeper AI</p>
              <p className="text-xs text-zinc-600 mt-px">
                {dataLoaded ? (contexts.length + ' contextos') : 'Iniciando...'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-md font-mono">Esc</kbd>
              <button
                onClick={() => { setMessages([]); setDataLoaded(false) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/80 transition-all duration-150"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: '180px', maxHeight: '320px' }}>
            {messages.length === 0 && !dataLoaded && (
              <div className="flex items-center gap-2 py-6 justify-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start items-start gap-2.5'}>
                {m.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-md bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-violet-400">
                      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    </svg>
                  </div>
                )}
                <div className={
                  'max-w-[82%] text-sm leading-relaxed ' +
                  (m.role === 'user'
                    ? 'bg-violet-600/15 border border-violet-500/20 text-zinc-200 px-3.5 py-2.5 rounded-2xl rounded-tr-md'
                    : 'text-zinc-300 py-0.5')
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-violet-400">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                  </svg>
                </div>
                <div className="flex gap-1 py-2">
                  <div className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '120ms' }} />
                  <div className="w-1 h-1 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions — only on fresh chat */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); if (inputRef.current) inputRef.current.focus() }}
                  className="text-xs text-zinc-500 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 bg-transparent hover:bg-zinc-900 px-3 py-1.5 rounded-lg transition-all duration-150"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3.5 py-2.5 focus-within:border-violet-500/40 focus-within:bg-zinc-900 transition-all duration-200">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Escribe algo..."
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
