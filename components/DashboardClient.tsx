'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalContextos: number
  totalProfiles: number
  totalVersions: number
  lastActive: string | null
}

interface Project {
  id: string
  name: string
  description?: string
  updated_at: string
  versions?: { id: string }[]
}

interface DashboardClientProps {
  projects: Project[]
  stats: Stats
  plan: string
  userName: string
}

export default function DashboardClient({ projects, stats, plan, userName }: DashboardClientProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const isPro = plan === 'pro' || plan === 'team'
  const firstName = userName?.split(' ')[0] || userName?.split('@')[0] || 'ah??'

  const copyContext = async (project: Project) => {
    const text = `[${project.name}]\n${project.description || ''}`
    await navigator.clipboard.writeText(text)
    setCopiedId(project.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos d??as'
    if (h < 20) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header greeting */}
        <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-zinc-500 text-sm mb-1">{getGreeting()},</p>
            <h1 className="text-3xl font-bold text-white">{firstName} <span className="text-violet-400">&#9670;</span></h1>
            <p className="text-zinc-400 text-sm mt-1">Tu memoria operativa est?? activa.</p>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Link href="/pricing" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-full font-medium transition-all">
                <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} />
                Hazte Pro a?? 9 a??/mes
              </Link>
            )}
            {isPro && (
              <span className="flex items-center gap-1.5 bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs px-3 py-1.5 rounded-full font-medium">
                <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} />
                {plan === 'team' ? 'Team' : 'Pro'}
              </span>
            )}
            <Link href="/dashboard/new" className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-4 py-2 rounded-full font-medium transition-all border border-zinc-700">
              + Nuevo contexto
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Perfiles activos', value: stats.totalProfiles, sub: stats.totalProfiles===0?'Crea tu primero':'Con identidad real', icon: '<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>', color: 'text-violet-400' },
            { label: 'Contextos', value: stats.totalContextos, sub: 'Memoria operativa', icon: '<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', color: 'text-cyan-400' },
            { label: 'Plan actual', value: isPro ? (plan === 'team' ? 'Team' : 'Pro') : 'Free', sub: isPro?'Acceso completo':'Upgrade disponible', icon: '<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>', color: isPro?'text-amber-400':'text-zinc-500' },
            { label: 'Lab + Forge', value: isPro?'Activo':'Bloqueado', sub: isPro?'Analisis y simulacion':'Solo en Pro', icon: '<svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>', color: isPro?'text-blue-400':'text-zinc-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-2 flex items-center gap-1.5">
                <span className={`text-xs ${stat.color}`} dangerouslySetInnerHTML={{ __html: stat.icon }} />
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              {stat.sub&&<p className="text-zinc-600 text-xs mt-1">{stat.sub}</p>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <Link href="/profiles" className="group flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-700/50 rounded-xl p-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-violet-900/40 flex items-center justify-center text-violet-400 group-hover:bg-violet-800/50 transition-all">
              <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Keeper Profiles</p>
              <p className="text-zinc-500 text-xs">{stats.totalProfiles} perfiles activos</p>
            </div>
          </Link>
          <Link href="/lab" className="group flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-700/50 rounded-xl p-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-violet-900/40 flex items-center justify-center text-violet-400 group-hover:bg-violet-800/50 transition-all">
              <span dangerouslySetInnerHTML={{ __html: '&#9998;' }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Keeper Lab</p>
              <p className="text-zinc-500 t<Link href="/profiles" className="group flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-700/50 rounded-xl p-4 transition-all" style={{borderColor:isPro?'rgba(251,191,36,0.15)':'rgba(63,63,70,0.8)'}}>
            <div style={{background:isPro?'rgba(251,191,36,0.1)':'rgba(63,63,70,0.4)'}} className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-all">
              <svg width="16" height="16" fill="none" stroke={isPro?"#fbbf24":"rgba(255,255,255,0.2)"} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium" style={{color:isPro?'#fde68a':'rgba(255,255,255,0.4)'}}>Keeper Forge</p>
              <p className="text-zinc-500 text-xs">{isPro?'Simula escenarios en vivo':'Solo disponible en Pro'}</p>
            </div>
          </Link>stiona tu suscripci??n' : 'Upgrade a Pro'}</p>
            </div>
          </Link>
        </div>

        {/* Upgrade banner for Free users */}
        {!isPro && (
          <div className="mb-8 bg-gradient-to-r from-violet-900/40 to-violet-800/20 border border-violet-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-violet-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Est&#225;s en el plan Free</p>
                <p className="text-xs text-zinc-400 mt-0.5">Tienes 3 contextos m&#225;ximos y sin IA. Pro desbloquea todo por <span className="text-violet-300 font-semibold">9 &#8364;/mes</span>.</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {['Contextos ilimitados', 'Generar con IA', 'Historial de versiones', 'Keeper Lab'].map(f => (
                    <span key={f} className="text-xs text-violet-300 flex items-center gap-1">
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <a href="/pricing" className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Hazte Pro
      {isPro && (
          <div style={{background:'linear-gradient(135deg,rgba(251,191,36,0.06),rgba(245,158,11,0.04))',border:'1px solid rgba(251,191,36,0.18)',borderRadius:14,padding:'16px 20px',marginBottom:24,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:36,height:36,borderRadius:10,background:'rgba(251,191,36,0.12)',border:'1px solid rgba(251,191,36,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <p style={{color:'#fde68a',fontSize:13,fontWeight:700,marginBottom:2}}>Keeper Forge disponible</p>
                <p style={{color:'rgba(253,230,138,0.5)',fontSize:11}}>Simula como responde tu IA en escenarios reales. Verificado con score de coherencia.</p>
              </div>
            </div>
            <Link href="/profiles" style={{flexShrink:0,background:'rgba(251,191,36,0.12)',border:'1px solid rgba(251,191,36,0.3)',color:'#fde68a',fontSize:11,fontWeight:700,padding:'7px 14px',borderRadius:8,whiteSpace:'nowrap',letterSpacing:'0.03em'}}>Ir a Forge</Link>
          </div>
        )}
              </a>
          </div>
        )}
        {/* Contextos recientes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Contextos recientes</h2>
            <Link href="/contextos" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">Ver todos</Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-violet-400" dangerouslySetInnerHTML={{ __html: '&#9632;' }} />
              </div>
              <h3 className="text-white font-semibold mb-2">Tu primera memoria</h3>
              <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
                Crea tu primer contexto. Guarda qui??n eres, c??mo piensas, qu?? necesita tu IA.
              </p>
              <Link href="/dashboard/new" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all">
                Crear primer contexto
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-5 py-4 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-violet-400 font-bold">{project.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{project.name}</p>
                      <p className="text-zinc-500 text-xs">
                        {project.versions?.length || 0} versiones ?? {new Date(project.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => copyContext(project)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all"
                    >
                      {copiedId === project.id ? (
                        <><span dangerouslySetInnerHTML={{ __html: '&#10003;' }} className="text-emerald-400" /><span className="text-emerald-400">Copiado</span></>
                      ) : (
                        <><span dangerouslySetInnerHTML={{ __html: '&#9112;' }} /> Copiar</>
                      )}
                    </button>
                    <Link href={`/dashboard/${project.id}`} className="opacity-0 group-hover:opacity-100 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Promo code input - visible para Free users */}
        {!isPro && (
          <div className="mt-8 bg-gradient-to-br from-violet-900/20 to-zinc-900 border border-violet-800/30 rounded-2xl p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <p className="text-white font-medium mb-1">??Tienes un c??digo?</p>
                <p className="text-zinc-400 text-sm">Aplica un c??digo promocional para acceder a Pro gratis.</p>
              </div>
              <PromoInput />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function PromoInput() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const apply = async () => {
    if (!code.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', promoCode: code.trim().toUpperCase() })
      })
      const data = await res.json()
      if (data.url) {
        setStatus('success')
        setMsg('Redirigiendo a pago...')
        window.location.href = data.url
      } else {
        setStatus('error')
        setMsg('C??digo no v??lido o expirado')
      }
    } catch {
      setStatus('error')
      setMsg('Error al aplicar el c??digo')
    }
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && apply()}
          placeholder="KEEPER2025"
          className="bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-xl w-40 focus:outline-none focus:border-violet-500 font-mono tracking-wider"
        />
        <button
          onClick={apply}
          disabled={status === 'loading'}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-xl font-medium transition-all"
        >
          {status === 'loading' ? '...' : 'Aplicar'}
        </button>
      </div>
      {msg && (
        <p className={`text-xs ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>
      )}
    </div>
  )
}