'use client'
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
  const [messages, setMessages] = useState([] as Message[])
  const [loading, setLoading] = useState(false)
  const [contexts, setContexts] = useState([] as any[])
  const [profiles, setProfiles] = useState([] as any[])
  const [dataLoaded, setDataLoaded] = useState(false)
  const messagesEndRef = useRef(null as HTMLDivElement | null)
  const inputRef = useRef(null as HTMLInputElement | null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (!open || dataLoaded) return
    async function loadData() {
      try {
        const ctxRes = await supabase.from('projects').select('name, context').eq('user_id', userId).limit(20)
        const profRes = await supabase.from('keeper_profiles').select('name, role, tone').eq('user_id', userId).limit(10)
        const ctxList = ctxRes.data || []
        const profList = profRes.data || []
        setContexts(ctxList)
        setProfiles(profList)
        setDataLoaded(true)
        const n = ctxList.length
        const p = profList.length
        const msg = n > 0
          ? 'Hola! Tienes ' + n + ' contexto' + (n !== 1 ? 's' : '') + ' y ' + p + ' perfil' + (p !== 1 ? 'es' : '') + '. \u00bfEn qu\u00e9 te ayudo?'
          : 'Hola! Soy Keeper Bot. \u00bfEn qu\u00e9 te ayudo hoy?'
        setMessages([{ role: 'assistant', content: msg }])
      } catch (err) {
        setDataLoaded(true)
      }
    }
    loadData()
  }, [open])

  async function sendMessage() {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/keeper-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: next.slice(-10), contexts, profiles }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'Sin respuesta' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexi\u00f3n.' }])
    }
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  let btnCls = 'bg-violet-600 hover:bg-violet-500 shadow-violet-500/30 hover:scale-110'
  if (open) { btnCls = 'bg-zinc-800 border border-zinc-700 rotate-45 scale-95' }

  function msgCls(role: string) {
    return role === 'user' ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className={'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ' + btnCls}
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

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden" style={{ maxHeight: '520px' }}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Keeper Bot</p>
              <p className="text-xs text-zinc-500">
                {dataLoaded ? contexts.length + ' contextos \u00b7 ' + profiles.length + ' perfiles' : 'Cargando...'}
              </p>
            </div>
            <button
              onClick={() => { setMessages([]); setDataLoaded(false) }}
              className="text-zinc-600 hover:text-zinc-400 p-1 rounded-lg hover:bg-zinc-800"
              title="Limpiar"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '340px' }}>
            {messages.length === 0 && !dataLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={'flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-xs rounded-2xl px-3 py-2 text-sm ' + msgCls(m.role)}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl px-3 py-2 flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {['\u00bfQu\u00e9 contextos tengo?', 'Sug\u00ehereme para marketing', '\u00bfC\u00f3mo uso Keeper?'].map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-700">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="px-3 pb-3">
            <div className="flex gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 focus-within:border-violet-500">
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
              <button onClick={sendMessage} disabled={!input.trim() || loading} className="text-violet-400 hover:text-violet-300 disabled:opacity-30">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
