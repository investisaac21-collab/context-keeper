'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    desc: 'Empieza a guardar tu memoria operativa',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Hasta 3 contextos',
      'Variables de contexto dinámicas',
      'Importar / exportar JSON',
      'Plantillas predefinidas',
    ],
    cta: 'Empezar gratis',
    ctaHref: '/login',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 9,
    desc: 'Memoria completa, sin límites',
    color: 'border-violet-500',
    badge: 'MÁS POPULAR',
    features: [
      'Todo lo del plan Free',
      'Contextos ilimitados',
      'Historial de versiones y rollback',
      'Tokens de memoria globales',
      'Soporte prioritario',
      'Acceso anticipado a Keeper Lab',
    ],
    cta: 'Hazte Pro — 9 €/mes',
    ctaHref: null,
    highlight: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    name: 'Team',
    price: 20,
    desc: 'Memoria compartida para todo el equipo',
    color: 'border-purple-400',
    badge: 'PARA EQUIPOS',
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
  },
]

const FAQ = [
  { q: '¿Qué incluye el plan Free?', a: 'El plan Free incluye hasta 3 contextos, variables dinámicas, plantillas predefinidas e importación/exportación JSON. Sin tarjeta de crédito.' },
  { q: '¿Qué funciones exactas se desbloquean con Pro?', a: 'Con Pro desbloqueas proyectos ilimitados, historial de versiones con rollback, variables globales guardadas, soporte prioritario y acceso anticipado a nuevas funciones.' },
  { q: '¿Cuál es la diferencia entre Pro y Team?', a: 'Team incluye todo lo de Pro más colaboración para hasta 5 miembros, prompts compartidos, panel de administrador, facturación centralizada y permisos por rol (admin, editor, viewer).' },
  { q: '¿Team incluye permisos por rol?', a: 'Sí. Con el plan Team puedes asignar roles a cada miembro: admin (control total), editor (puede crear y editar) y viewer (solo lectura).' },
  { q: '¿Qué pasa con mis proyectos si cancelo?', a: 'Tus proyectos siempre son tuyos. Si cancelas Pro o Team, volverás al plan Free y conservarás hasta 3 contextos. El resto quedará archivado y podrás recuperarlo si vuelves a suscribirte.' },
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes subir o bajar de plan cuando quieras desde tu página de cuenta. Los cambios se aplican de forma inmediata.' },
  { q: '¿Qué pasa si llego al límite gratuito?', a: 'Si llegas al límite de 3 contextos en el plan Free, no podrás crear nuevos proyectos hasta que actualices al plan Pro o elimines alguno existente.' },
  { q: '¿Habrá plan anual con descuento?', a: 'Estamos preparando un plan anual con descuento. Próximamente podrás pagar por año y ahorrar hasta un 20%. Si quieres ser notificado, escríbenos.' },
]

export default function PricingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [userInfo, setUserInfo] = useState<{ id: string; email: string; plan: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('subscriptions').select('plan').eq('user_id', user.id).single().then(({ data: sub }) => {
        setUserInfo({ id: user.id, email: user.email || '', plan: sub?.plan || 'free' })
      })
    })
  }, [])

  async function handleCheckout(plan: typeof PLANS[0]) {
    if (plan.ctaHref) { router.push(plan.ctaHref); return }
    if (!userInfo) { router.push('/login'); return }

    setLoading(plan.name)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: userInfo.id,
          email: userInfo.email,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error al iniciar el pago. Inténtalo de nuevo.')
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(null)
    }
  }

  const getPlanBtnLabel = (planName: string, defaultCta: string) => {
    if (!userInfo) return defaultCta
    if (userInfo.plan === planName.toLowerCase()) return 'Plan actual'
    return defaultCta
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={userInfo?.email} plan={userInfo?.plan || 'free'} />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Planes y precios</h1>
          <p className="text-gray-500 text-lg">Tu memoria operativa de IA, lista en segundos. Sin tarjeta. Cancela cuando quieras.</p>
          <div className="inline-flex items-center gap-3 mt-6 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${billing === 'monthly' ? 'bg-violet-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-violet-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Anual
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">-20%</span>
            </button>
          </div>
          {billing === 'yearly' && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Próximamente disponible &#8212; apúntate para ser el primero en saberlo
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map(plan => {
            const isCurrentPlan = userInfo?.plan === plan.name.toLowerCase()
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 bg-white p-6 flex flex-col shadow-sm transition hover:shadow-md ${
                  plan.highlight ? 'border-violet-500 shadow-violet-100' : plan.color
                } ${isCurrentPlan ? 'ring-2 ring-green-400' : ''}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full shadow ${
                    plan.name === 'Team' ? 'bg-purple-600 text-white' : 'bg-violet-600 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 text-xs font-bold px-3 py-1 rounded-full shadow bg-green-500 text-white">
                    Tu plan
                  </div>
                )}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? '0' : billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price} &#8364;
                    </span>
                    <span className="text-gray-400 text-sm mb-1">/mes</span>
                  </div>
                  {billing === 'yearly' && plan.price > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      Ahorras {Math.round(plan.price * 0.2 * 12)} &#8364;/año
                    </p>
                  )}
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-violet-500 mt-0.5 shrink-0">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={loading === plan.name || isCurrentPlan}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
                    isCurrentPlan
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : plan.highlight
                      ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md'
                      : plan.name === 'Team'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } ${loading === plan.name ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.name ? 'Redirigiendo...' : getPlanBtnLabel(plan.name, plan.cta)}
                </button>
              </div>
            )
          })}
        </div>

        {/* COMPARATIVA */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-16 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Comparativa de planes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-gray-500 font-medium w-1/2">Función</th>
                  <th className="text-center py-3 text-gray-700 font-semibold">Free</th>
                  <th className="text-center py-3 text-violet-600 font-semibold">Pro</th>
                  <th className="text-center py-3 text-purple-600 font-semibold">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Proyectos', '3', 'Ilimitados', 'Ilimitados'],
                  ['Variables dinámicas', '&#10003;', '&#10003;', '&#10003;'],
                  ['Plantillas predefinidas', '&#10003;', '&#10003;', '&#10003;'],
                  ['Importar / exportar JSON', '&#10003;', '&#10003;', '&#10003;'],
                  ['Historial de versiones', '&#10007;', '&#10003;', '&#10003;'],
                  ['Variables globales', '&#10007;', '&#10003;', '&#10003;'],
                  ['Soporte prioritario', '&#10007;', '&#10003;', '&#10003;'],
                  ['Miembros del equipo', '&#10007;', '&#10007;', 'Hasta 5'],
                  ['Contextos compartidos', '&#10007;', '&#10007;', '&#10003;'],
                  ['Panel de administrador', '&#10007;', '&#10007;', '&#10003;'],
                  ['Permisos por rol', '&#10007;', '&#10007;', '&#10003;'],
                  ['Facturación centralizada', '&#10007;', '&#10007;', '&#10003;'],
                ].map(([feature, free, pro, team]) => (
                  <tr key={feature}>
                    <td className="py-3 text-gray-700">{feature}</td>
                    <td className="py-3 text-center text-gray-400" dangerouslySetInnerHTML={{ __html: free }} />
                    <td className="py-3 text-center text-violet-600 font-medium" dangerouslySetInnerHTML={{ __html: pro }} />
                    <td className="py-3 text-center text-purple-600 font-medium" dangerouslySetInnerHTML={{ __html: team }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                >
                  <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                  <span className={`text-gray-400 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      {/* KEEPER LAB + PROFILES — próximamente */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Próximamente en Pro y Team</span>
                <h3 className="text-xl font-bold text-gray-900">Keeper Lab + Keeper Profiles</h3>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-violet-100">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                  <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Keeper Lab</h4>
                <p className="text-sm text-gray-600">Refinamiento profundo de contexto con IA. Analiza, mejora y optimiza tu memoria operativa antes de usarla con cualquier IA.</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-violet-100">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
                  <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Keeper Profiles</h4>
                <p className="text-sm text-gray-600">Perfiles de IA reutilizables con personalidad, tono, reglas y comportamiento configurables. Una identidad persistente para cada flujo de trabajo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      </main>
    </div>
  )
}
