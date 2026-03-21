'use client'
// Keeper Bot v1.0 - Fase 2
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface KeeperBotProps {
  userId: string
  plan: string
}

export default function KeeperBot({ userId, plan }: KeeperBotProps) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [contexts, setContexts] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      if (!dataLoaded) loadUserData()
    }
  }, [open])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUserData = async () => {
    try {
      const [{ data: ctxData }, { data: profData }] = await Promise.all([
        supabase.from('projects').select('id,name,tag,category,context').eq('user_id', userId).limit(20),
        supabase.from('keeper_profiles').select('id,name,role,tone').eq('user_id', userId).limit(10),
      ])
      setContexts(ctxData || [])
      setProfiles(profData || [])
      setDataLoaded(true)

      // Welcome message on first open
      if (messages.length === 0) {
        const ctxCount = ctxData?.length || 0
        const profCount = profData?.length || 0
        const welcomeText = ctxCount > 0
          ? `Hola! Tengo acceso a tus ${ctxCount} contexto${ctxCount !== 1 ? 's' : ''}${profCount > 0 ? ` y ${profCount} perfil${profCount !== 1 ? 'es' : ''}` : ''}. \u00bfEn qu\u00e9 te ayudo?`
          : '\u00a1Hola! Soy Keeper Bot. A\u00fan no tienes contextos guardados. \u00bfQuieres que te ayude a crear uno?'
        setMessages([{ role: 'assistant', content: welcomeText }])
      }
    } catch (e) {
      setDataLoaded(true)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/keeper-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-10),
          contexts,
          profiles,
        }),
      })
      const data = await res.json()
      const reply = data.reply || data.error || 'Sin respuesta'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexi\u00f3n. Intenta de nuevo.' }])
    }
    setLoading(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-zinc-800 border border-zinc-700 rotate-45 scale-95'
            : 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30 hover:scale-110'
        }`}
        title="Keeper Bot (Ctrl+K)"
      >
        {open ? (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Shortcut hint */}
      {!open && (
        <div className="fixed bottom-6 right-24 z-50 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs px-2 py-1 rounded-lg">Ctrl+K</span>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none">Keeper Bot</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {dataLoaded ? `${contexts.length} contextos \u00b7 ${profiles.length} perfiles` : 'Cargando...'}
              </p>
            </div>
            <button
              onClick={() => { setMessages([]); setDataLoaded(false) }}
              className="text-zinc-600 hover:text-zinc-400 transition-colors p-1 rounded-lg hover:bg-zinc-800"
              title="Limpiar chat"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '340px' }}>
            {messages.length === 0 && !dataLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: i * 0.15 + 's' }} />
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-md'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 px-3 py-2 rounded-xl rounded-bl-md flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: i * 0.15 + 's' }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && contexts.length > 0 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {[
                '\u00bfQu\u00e9 contextos tengo?',
                'Sug\u00ehereme uno para marketing',
                '\u00bfC\u00f3mo uso Keeper?',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50) }}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors border border-zinc-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-violet-500 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Pregunta algo..."
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="text-violet-400 hover:text-violet-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-zinc-700 text-xs mt-1.5">Enter para enviar \u00b7 Esc para cerrar</p>
          </div>
        </div>
      )}
    </>
  )
}
