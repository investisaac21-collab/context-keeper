'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMagicSent(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email.trim()) { setError('Introduce tu email primero'); return }
    setMagicLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setMagicSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el enlace')
    } finally {
      setMagicLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex">

      {/* LEFT — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-start justify-between p-12 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/12 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/8 blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Context Keeper</span>
        </div>

        {/* Central content */}
        <div className="relative flex-1 flex flex-col justify-center py-12">
          {/* Keeper Core */}
          <div className="mb-10">
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <div className="w-13 h-13 rounded-full bg-[#09090b]/60 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-300 to-blue-300 animate-pulse" />
                </div>
              </div>
              <div className="absolute -inset-3 rounded-full border border-violet-500/20 animate-ping" style={{animationDuration: '3s'}} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Haz que tu IA<br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">no empiece de cero.</span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed max-w-sm">
            Guarda personalidad, instrucciones, variables y contexto. Recupéralos en segundos.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Memoria persistente', 'Variables dinámicas', 'Historial de versiones', 'Generación con IA'].map((f, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-white/40 bg-white/[0.03]">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-white/20 text-sm italic">"Una sola fuente de verdad para todo lo que tu IA necesita saber."</p>
        </div>
      </div>

      {/* RIGHT — Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <span className="font-bold text-white">Context Keeper</span>
        </div>

        {magicSent ? (
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Revisa tu email</h2>
            <p className="text-white/40 mb-6">Te hemos enviado un enlace de acceso a <span className="text-white/70">{email}</span>. Úsalo para entrar directamente.</p>
            <button onClick={() => setMagicSent(false)} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'login' ? 'Accede a tu memoria' : 'Empieza gratis'}
              </h2>
              <p className="text-white/40 text-sm">
                {mode === 'login' ? 'Tus contextos te esperan.' : 'Sin tarjeta de crédito. Cancela cuando quieras.'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-white/[0.05] rounded-xl p-1 mb-6">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === m ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Registrarme'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {mode === 'login' ? 'Accediendo...' : 'Creando cuenta...'}
                  </span>
                ) : mode === 'login' ? 'Acceder a mis contextos' : 'Crear mi cuenta gratis'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs">o</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="w-full py-3 rounded-xl border border-white/10 hover:border-white/20 text-white/60 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              {magicLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              Acceder con enlace por email
            </button>

            <p className="text-center text-white/20 text-xs mt-6">
              Free para siempre. Pro desde 9 €/mes.{' '}
              <Link href="/pricing" className="text-violet-400/70 hover:text-violet-400 transition-colors">Ver planes</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
