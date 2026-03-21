'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mounted, setMounted] = useState(false)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const orbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth
      const h = window.innerHeight
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h }
      if (orbRef.current) {
        const px = (e.clientX / w) * 20 - 10
        const py = (e.clientY / h) * 20 - 10
        orbRef.current.style.transform = 'translate(' + px + 'px, ' + py + 'px)'
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      setSuccess('Revisa tu email para confirmar tu cuenta.')
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' }
    })
  }

  async function handleMagicLink() {
    if (!email) { setError('Escribe tu email primero.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ email })
    if (err) { setError(err.message) } else { setSuccess('Enlace de acceso enviado a ' + email) }
    setLoading(false)
  }

  const pills = ['Memoria persistente', 'Variables dinámicas', 'Historial', 'IA nativa']
  const stats = [{ n: '10x', label: 'Más rápido' }, { n: '100%', label: 'Privado' }, { n: '∞', label: 'Contextos' }]

  return (
    <div className="min-h-screen bg-[#080808] flex overflow-hidden relative">

      {/* Global atmospheric noise */}
      <div className="absolute inset-0 pointer-events-none z-0"
        style={{ backgroundImage: 'url(\'data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E\')', opacity: 0.4 }}
      />

      {/* ——— LEFT PANEL ——— */}
      <div
        className={
          'hidden lg:flex flex-col justify-between w-[52%] relative px-16 py-14 overflow-hidden transition-all duration-1000 ease-out ' +
          (mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12')
        }
      >
        {/* Layered atmospheric glows */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main violet nebula */}
          <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, rgba(109,40,217,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }}
          />
          {/* Secondary deep indigo */}
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(67,20,160,0.14) 0%, transparent 60%)', filter: 'blur(60px)', animationDuration: '8s' }}
          />
          {/* Accent micro-glow top right */}
          <div className="absolute top-[20%] right-[15%] w-[200px] h-[200px] rounded-full animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(30px)', animationDuration: '4s' }}
          />
          {/* Subtle grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(109,40,217,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at 40% 50%, black 20%, transparent 80%)'
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-xl bg-violet-500/25 blur-lg" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-violet-500 to-violet-800 rounded-xl flex items-center justify-center shadow-xl shadow-violet-900/50">
              <span className="text-white font-bold text-sm tracking-tight">K</span>
            </div>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Keeper</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
          {/* Orb — mouse parallax */}
          <div ref={orbRef} className="mb-10 relative w-[88px] h-[88px]" style={{ transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }}>
            {/* Outer halo */}
            <div className="absolute -inset-4 rounded-full animate-pulse"
              style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.20) 0%, transparent 70%)', animationDuration: '3s' }}
            />
            {/* Rings */}
            <div className="absolute -inset-2 rounded-full border border-violet-500/15 animate-spin" style={{ animationDuration: '12s' }} />
            <div className="absolute inset-1 rounded-full border border-violet-400/10 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
            {/* Core orb */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(135deg at 35% 35%, rgba(167,139,250,0.9), rgba(109,40,217,0.8) 60%, rgba(67,20,160,0.95))', boxShadow: '0 0 40px rgba(109,40,217,0.5), 0 0 80px rgba(109,40,217,0.2), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            />
            {/* Gloss */}
            <div className="absolute top-2 left-2.5 w-4 h-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent)' }} />
          </div>

          {/* Headline */}
          <div
            className={'transition-all duration-700 delay-100 ' + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}
          >
            <h1 className="text-5xl xl:text-[3.8rem] font-bold text-white leading-[1.06] tracking-tight mb-4">
              Haz que tu IA
              <br />
              <span style={{ background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                no empiece de cero.
              </span>
            </h1>
            <p className="text-zinc-500 text-lg leading-relaxed max-w-md mb-10">
              Guarda personalidad, instrucciones y variables.
              <br />
              Rec&#xFA;peralos en segundos desde cualquier IA.
            </p>
          </div>

          {/* Pills */}
          <div className={'flex flex-wrap gap-2 mb-12 transition-all duration-700 delay-200 ' + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
            {['Memoria persistente', 'Variables dinámicas', 'Historial', 'IA nativa'].map((p, i) => (
              <span
                key={p}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-500 transition-all duration-300 hover:text-violet-300 hover:bg-violet-500/8 cursor-default"
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(8px)',
                  transitionDelay: (i * 60) + 'ms'
                }}
              >
                {p}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className={'flex gap-12 transition-all duration-700 delay-300 ' + (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')}>
            {[{ n: '10x', label: 'Más rápido' }, { n: '100%', label: 'Privado' }, { n: '∞', label: 'Contextos' }].map(s => (
              <div key={s.n} className="group cursor-default">
                <p className="text-2xl font-bold text-white group-hover:text-violet-300 transition-colors duration-300">{s.n}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-zinc-700 text-xs">
          Free para siempre &middot; Pro desde 9 &#x20AC;/mes
        </div>
      </div>

      {/* ——— RIGHT PANEL — form ——— */}
      <div
        className={
          'flex-1 lg:w-[48%] flex items-center justify-center px-6 py-12 relative transition-all duration-1000 delay-200 ease-out ' +
          (mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10')
        }
      >
        {/* Form panel bg */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0d0d10 0%, #08080b 100%)' }} />
        {/* Left separator */}
        <div className="absolute top-0 left-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(109,40,217,0.2) 30%, rgba(109,40,217,0.15) 70%, transparent 100%)' }} />
        {/* Subtle form ambient */}
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 60%)', filter: 'blur(60px)' }}
        />

        <div className="relative z-10 w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-md" />
              <div className="relative w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
            </div>
            <span className="text-white font-semibold">Keeper</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className="text-zinc-600 text-sm mb-8">
            {mode === 'login' ? 'Tus contextos te esperan.' : 'Empieza gratis, sin tarjeta.'}
          </p>

          {/* Mode toggle */}
          <div className="flex p-1 mb-7 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative"
                style={mode === m
                  ? { background: 'rgba(109,40,217,0.25)', color: 'rgba(196,181,253,1)', border: '1px solid rgba(109,40,217,0.4)', boxShadow: '0 0 12px rgba(109,40,217,0.15)' }
                  : { color: 'rgba(161,161,170,0.6)', border: '1px solid transparent' }
                }
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarme'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-4 group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-zinc-700 text-xs">o con email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-600 mb-1.5 ml-0.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(109,40,217,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 mb-1.5 ml-0.5">Contrase&#xF1;a</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(109,40,217,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(109,40,217,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.25)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                <p className="text-violet-300 text-xs">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 mt-1 relative overflow-hidden group/btn"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)', boxShadow: '0 4px 20px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 60%, #6d28d9 100%)' }}
              />
              <span className="relative z-10">
                {loading ? 'Entrando...' : (mode === 'login' ? 'Acceder a mis contextos' : 'Crear cuenta gratis')}
              </span>
            </button>
          </form>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full mt-3 py-2.5 rounded-xl text-zinc-600 text-xs transition-all duration-200 hover:text-zinc-400"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
          >
            Acceder con enlace por email
          </button>

          <p className="text-center text-zinc-700 text-xs mt-6">
            Free para siempre &middot; Pro desde{' '}
            <span className="text-violet-500 font-medium">9 &#x20AC;/mes</span>
            {' · '}
            <a href="/pricing" className="text-zinc-600 hover:text-zinc-400 transition-colors duration-200 underline underline-offset-2">Ver planes</a>
          </p>
        </div>
      </div>
    </div>
  )
}
