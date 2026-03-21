'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    currency: '',
    desc: 'Empieza a guardar tu memoria operativa',
    features: [
      'Hasta 3 contextos',
      'Variables de contexto dinámicas',
      'Importar / exportar JSON',
      'Plantillas predefinidas',
    ],
    cta: 'Empezar gratis',
    ctaHref: '/login',
    highlight: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: 9,
    currency: '€',
    desc: 'Memoria completa, sin límites',
    features: [
      'Todo lo del plan Free',
      'Contextos ilimitados',
      'Historial de versiones y rollback',
      'Tokens de memoria globales',
      'Soporte prioritario',
      'Acceso anticipado a Keeper Lab',
    ],
    cta: 'Hazte Pro',
    ctaHref: null,
    highlight: true,
    badge: 'MÁS POPULAR',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    name: 'Team',
    price: 20,
    currency: '€',
    desc: 'Memoria compartida para todo el equipo',
    features: [
      'Todo lo del plan Pro',
      'Hasta 5 miembros',
      'Contextos compartidos entre miembros',
      'Panel de administrador',
      'Facturación centralizada',
      'Permisos por rol (admin, editor, viewer)',
    ],
    cta: 'Empezar con Team',
    ctaHref: null,
    highlight: false,
    badge: 'PARA EQUIPOS',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        supabase.from('subscriptions').select('plan').eq('user_id', data.user.id).single().then(({ data: sub }) => {
          if (sub) setCurrentPlan(sub.plan)
        })
      }
    })
  }, [])

  const handleUpgrade = async (priceId: string | undefined, planName: string) => {
    if (!priceId) return
    if (!user) { router.push('/login'); return }
    setLoading(planName)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId: user.id }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(null)
      alert('Error al iniciar el pago. Inténtalo de nuevo.')
    }
  }

  const CheckIcon = () => (
    <svg className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden">
      {/* Atmospheric glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at top, rgba(109,40,217,0.12) 0%, transparent 60%)', filter: 'blur(40px)' }}
        />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(67,20,160,0.08) 0%, transparent 60%)', filter: 'blur(60px)' }}
        />
        {/* Subtle grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(109,40,217,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(109,40,217,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)'
        }} />
      </div>

      <Navbar userEmail={user?.email} plan={currentPlan} />

      <div className={
        'relative z-10 max-w-5xl mx-auto px-6 py-20 transition-all duration-700 ' +
        (mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')
      }>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-violet-400 mb-6"
            style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.25)' }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Planes simples. Sin sorpresas.
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
            Elige tu plan
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            Desde gratis hasta ilimitado. Cancela cuando quieras.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-6 flex flex-col transition-all duration-300 group"
              style={plan.highlight
                ? {
                    background: 'linear-gradient(160deg, rgba(109,40,217,0.12) 0%, rgba(67,20,160,0.08) 100%)',
                    border: '1px solid rgba(109,40,217,0.35)',
                    boxShadow: '0 0 40px rgba(109,40,217,0.12), inset 0 1px 0 rgba(109,40,217,0.2)',
                  }
                : {
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }
              }
            >
              {/* Hover glow for non-highlight */}
              {!plan.highlight && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'rgba(109,40,217,0.04)', boxShadow: '0 0 20px rgba(109,40,217,0.08)' }}
                />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-bold tracking-widest rounded-full"
                    style={plan.highlight
                      ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', boxShadow: '0 4px 12px rgba(109,40,217,0.4)' }
                      : { background: 'rgba(255,255,255,0.08)', color: 'rgba(161,161,170,0.8)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {currentPlan === plan.name.toLowerCase() && (
                    <span className="text-xs px-2 py-0.5 rounded-full text-violet-300" style={{ background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(109,40,217,0.3)' }}>
                      Actual
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-white">Gratis</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-zinc-500 text-base mb-1.5">&#x20ac;/mes</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-zinc-600">{plan.desc}</p>
              </div>

              {/* CTA */}
              <div className="mb-6">
                {plan.ctaHref ? (
                  <Link href={plan.ctaHref}
                    className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)'
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.priceId, plan.name)}
                    disabled={loading === plan.name || currentPlan === plan.name.toLowerCase()}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 relative overflow-hidden group/cta"
                    style={plan.highlight
                      ? {
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                          color: 'white',
                          boxShadow: '0 4px 16px rgba(109,40,217,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.7)',
                        }
                    }
                  >
                    <div className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300"
                      style={plan.highlight
                        ? { background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }
                        : { background: 'rgba(109,40,217,0.08)' }
                      }
                    />
                    <span className="relative z-10">
                      {loading === plan.name ? 'Redirigiendo...' :
                        currentPlan === plan.name.toLowerCase() ? 'Plan actual' : plan.cta}
                    </span>
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="h-px mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="text-sm text-zinc-400 leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA for free users */}
        <div className="text-center">
          <p className="text-zinc-600 text-sm">
            ¿Tienes un c&#xF3;digo promocional?{' '}
            <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 transition-colors duration-200 underline underline-offset-2">
              Aplícalo en el dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
