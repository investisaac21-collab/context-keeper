'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(err.message); setLoading(false); return }
        router.push('/dashboard')
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) { setError(err.message); setLoading(false); return }
        setSuccess('Revisa tu email para confirmar tu cuenta.')
        setLoading(false)
      }
    } catch (err) {
      setError('Error inesperado.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })
  }

  async function handleMagicLink() {
    if (!email) { setError('Escribe tu email primero.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ email })
    if (err) { setError(err.message) } else { setSuccess('Enlace enviado a ' + email) }
    setLoading(false)
  }

  const pills = ['Memoria persistente', 'Variables dinámicas', 'Historial', 'Generación con IA']
  const stats = [{ n: '10x', label: 'Más rápido' }, { n: '100%', label: 'Privado' }, { n: '∞', label: 'Contextos' }]

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* LEFT — hero */}
      <div className={
        'hidden lg:flex flex-col justify-between w-[52%] relative px-16 py-14 transition-all duration-1000 ' +
        (mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8')
      }>
        {/* Deep background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px]" />
        </div>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Keeper</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          {/* Orb visual */}
          <div className="mb-10 relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-violet-600/30 blur-xl animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 shadow-2xl shadow-violet-500/50" />
            <div className="absolute inset-0 rounded-full border border-violet-400/20 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="absolute -inset-3 rounded-full border border-violet-500/10 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} />
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-4">
            Haz que tu IA<br />
            <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-violet-500 bg-clip-text text-transparent">
              no empiece de cero.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-10">
            Guarda personalidad, instrucciones y variables.<br />Recúparalos en segundos desde cualquier IA.
          </p>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mb-12">
            {pills.map((p, i) => (
              <span
                key={p}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-zinc-800 text-zinc-400 bg-zinc-900/60 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5"
                style={{ animationDelay: (i * 100) + 'ms' }}
              >
                {p}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-10">
            {stats.map(s => (
              <div key={s.n}>
                <p className="text-2xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-zinc-600 text-xs">
          Free para siempre · Pro desde 9 €/mes
        </div>
      </div>

      {/* RIGHT — form */}
      <div className={
        'flex-1 lg:w-[48%] flex items-center justify-center px-6 py-12 relative transition-all duration-1000 delay-150 ' +
        (mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8')
      }>
        {/* Subtle form bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-semibold">Keeper</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            {mode === 'login' ? 'Tus contextos te esperan.' : 'Empieza gratis, sin tarjeta.'}
          </p>

          {/* Mode toggle */}
          <div className="flex bg-zinc-900 rounded-xl p-1 mb-7 border border-zinc-800">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              className={'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ' + (mode === 'login' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300')}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
              className={'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ' + (mode === 'register' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300')}
            >
              Registrarme
            </button>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white text-sm font-medium hover:bg-zinc-800/80 hover:border-zinc-700 transition-all duration-200 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs">o con email</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="group">
              <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>
            <div className="group">
              <label className="block text-xs text-zinc-500 mb-1.5 ml-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                <p className="text-violet-300 text-xs">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99] mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Entrando...
                </span>
              ) : (mode === 'login' ? 'Acceder a mis contextos' : 'Crear cuenta gratis')}
            </button>
          </form>

          {/* Magic link */}
          <button
            onClick={handleMagicLink}
            className="w-full mt-3 py-2.5 rounded-xl border border-zinc-800 text-zinc-500 text-xs hover:text-zinc-300 hover:border-zinc-700 transition-all duration-200"
          >
            Acceder con enlace por email
          </button>

          <p className="text-center text-zinc-600 text-xs mt-6">
            Free para siempre · Pro desde{' '}
            <span className="text-violet-400 font-medium">9 €/mes</span>
            {' · '}
            <a href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">Ver planes</a>
          </p>
        </div>
      </div>
    </div>
  )
}
