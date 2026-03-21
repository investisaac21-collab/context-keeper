'use client'
import { useState, useEffect } from 'react'
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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

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

  const handleGoogleLogin = async () => {
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' }
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error con Google')
    }
  }

  const features = [
    { label: 'Memoria persistente', icon: '\u25C8' },
    { label: 'Variables din\u00e1micas', icon: '\u25C9' },
    { label: 'Historial de versiones', icon: '\u25CE' },
    { label: 'Generaci\u00f3n con IA', icon: '\u25C6' },
  ]

  const stats = [
    { value: 'Free', label: 'Para siempre' },
    { value: '9\u20AC', label: 'Plan Pro/mes' },
    { value: '\u221e', label: 'Contextos' },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] flex overflow-hidden">

      {/* LEFT */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-start justify-between p-12 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[140px]" />
          <div className="absolute top-1/4 right-0 w-[350px] h-[350px] rounded-full bg-blue-600/8 blur-[120px]" />
          <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] rounded-full bg-violet-400/6 blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Logo */}
        <div className={`relative flex items-center gap-2.5 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Keeper</span>
        </div>

        {/* Hero content */}
        <div className="relative flex-1 flex flex-col justify-center py-12">

          {/* Animated orb */}
          <div className={`mb-12 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-40 h-40 rounded-full border border-violet-500/8 animate-[spin_25s_linear_infinite]" />
              <div className="absolute w-32 h-32 rounded-full border border-violet-400/12 animate-[spin_18s_linear_infinite_reverse]" />
              <div className="absolute w-24 h-24 rounded-full border border-violet-300/10 animate-[spin_12s_linear_infinite]" />
              <div className="absolute w-28 h-28 rounded-full border border-violet-500/12 animate-ping" style={{animationDuration:'4s'}} />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 via-violet-600 to-blue-600 shadow-2xl shadow-violet-500/40 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#09090b]/50 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-300 to-blue-300 animate-pulse shadow-lg shadow-violet-300/50" />
                </div>
                <div className="absolute top-2 left-3 w-6 h-3 rounded-full bg-white/20 blur-sm" style={{transform:'rotate(-30deg)'}} />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-5xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
              Haz que tu IA<br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                no empiece de cero.
              </span>
            </h1>
            <p className="text-white/35 text-lg leading-relaxed max-w-sm">
              Guarda personalidad, instrucciones,<br />variables y contexto. Rec\u00fap\u00e9ralos en segundos.
            </p>
          </div>

          {/* Feature pills */}
          <div className={`flex flex-wrap gap-2 mt-8 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {features.map((f, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/8 text-white/35 bg-white/[0.03] hover:border-violet-500/30 hover:text-violet-300/70 hover:bg-violet-500/5 transition-all duration-300 cursor-default"
              >
                <span className="mr-1.5 opacity-50">{f.icon}</span>{f.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className={`flex gap-8 mt-10 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-white font-bold text-lg leading-none">{s.value}</span>
                <span className="text-white/25 text-xs mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className={`relative transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-8 h-px bg-violet-500/30 mb-3" />
          <p className="text-white/20 text-sm italic">&ldquo;Una sola fuente de verdad para todo lo que tu IA necesita saber.&rdquo;</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
        </div>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <span className="font-bold text-white">Keeper</span>
        </div>

        {magicSent ? (
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Revisa tu email</h2>
            <p className="text-white/40 mb-6 text-sm">Te hemos enviado un enlace a <span className="text-white/70">{email}</span>.</p>
            <button onClick={() => setMagicSent(false)} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Volver al inicio de sesi\u00f3n
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {mode === 'login' ? 'Accede a tu memoria' : 'Empieza gratis'}
              </h2>
              <p className="text-white/35 text-sm">
                {mode === 'login' ? 'Tus contextos te esperan.' : 'Sin tarjeta. Cancela cuando quieras.'}
              </p>
            </div>

            <div className="flex bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.06]">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === m ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'}`}
                >
                  {m === 'login' ? 'Iniciar sesi\u00f3n' : 'Registrarme'}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 tracking-widest uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/15 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all duration-200"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 tracking-widest uppercase">Contrase\u00f1a</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/15 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all duration-200"
                  placeholder=""
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/15 flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
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
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/20 text-xs">o contin\u00faa con</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 mb-3 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <button
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="w-full py-3 rounded-xl border border-white/[0.08] hover:border-white/[0.15] text-white/40 hover:text-white/70 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
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

            <p className="text-center text-white/15 text-xs mt-6">
              Free para siempre. Pro desde 9 \u20AC/mes.{' '}
              <Link href="/pricing" className="text-violet-400/60 hover:text-violet-400 transition-colors">Ver planes</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}