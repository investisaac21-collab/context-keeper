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
  const firstName = userName?.split(' ')[0] || userName?.split('@')[0] || 'ahí'

  const copyContext = async (project: Project) => {
    const text = `[${project.name}]\n${project.description || ''}`
    await navigator.clipboard.writeText(text)
    setCopiedId(project.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
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
            <p className="text-zinc-400 text-sm mt-1">Tu memoria operativa está activa.</p>
          </div>
          <div className="flex items-center gap-3">
            {!isPro && (
              <Link href="/pricing" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-full font-medium transition-all">
                <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} />
                Hazte Pro — 9 €/mes
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
            { label: 'Contextos', value: stats.totalContextos, icon: '&#9632;', color: 'text-violet-400' },
            { label: 'Perfiles', value: stats.totalProfiles, icon: '&#9632;', color: 'text-blue-400' },
            { label: 'Versiones', value: stats.totalVersions, icon: '&#9632;', color: 'text-emerald-400' },
            { label: 'Plan', value: isPro ? (plan === 'team' ? 'Team' : 'Pro') : 'Free', icon: '&#9670;', color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-2 flex items-center gap-1.5">
                <span className={`text-xs ${stat.color}`} dangerouslySetInnerHTML={{ __html: stat.icon }} />
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
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
              <p className="text-zinc-500 text-xs">Analiza y mejora con IA</p>
            </div>
          </Link>
          <Link href="/pricing" className="group flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-700 transition-all">
              <span dangerouslySetInnerHTML={{ __html: '&#10024;' }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Ver planes</p>
              <p className="text-zinc-500 text-xs">{isPro ? 'Gestiona tu suscripción' : 'Upgrade a Pro'}</p>
            </div>
          </Link>
        </div>

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
                Crea tu primer contexto. Guarda quién eres, cómo piensas, qué necesita tu IA.
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
                        {project.versions?.length || 0} versiones · {new Date(project.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
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
                <p className="text-white font-medium mb-1">¿Tienes un código?</p>
                <p className="text-zinc-400 text-sm">Aplica un código promocional para acceder a Pro gratis.</p>
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
        setMsg('Código no válido o expirado')
      }
    } catch {
      setStatus('error')
      setMsg('Error al aplicar el código')
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