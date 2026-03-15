'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    desc: 'Para empezar sin compromiso',
    color: 'border-gray-200',
    badge: null,
    features: [
      'Hasta 3 proyectos',
      'Variables dinámicas',
      'Importar / exportar JSON',
      'Plantillas predefinidas',
    ],
    locked: [],
    cta: 'Empezar gratis',
    ctaHref: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 9,
    desc: 'Para profesionales que usan IA a diario',
    color: 'border-indigo-500',
    badge: 'MÁS POPULAR',
    features: [
      'Todo lo del plan Free',
      'Proyectos ilimitados',
      'Historial de versiones y rollback',
      'Variables globales guardadas',
      'Soporte prioritario',
      'Acceso anticipado a nuevas funciones',
    ],
    locked: [],
    cta: 'Hazte Pro',
    ctaHref: null,
    highlight: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    name: 'Team',
    price: 20,
    desc: 'Para equipos que trabajan con IA juntos',
    color: 'border-purple-400',
    badge: 'PARA EQUIPOS',
    features: [
      'Todo lo del plan Pro',
      'Hasta 5 miembros',
      'Prompts compartidos entre miembros',
      'Panel de administrador',
      'Facturación centralizada',
      'Permisos por rol (admin, editor, viewer)',
    ],
    locked: [],
    cta: 'Empezar con Team',
    ctaHref: null,
    highlight: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
  },
]

const FAQ = [
  {
    q: '¿Qué incluye el plan Free?',
    a: 'El plan Free incluye hasta 3 proyectos, variables dinámicas, plantillas predefinidas e importación/exportación JSON. Sin tarjeta de crédito.',
  },
  {
    q: '¿Qué funciones exactas se desbloquean con Pro?',
    a: 'Con Pro desbloqueas proyectos ilimitados, historial de versiones con rollback, variables globales guardadas, soporte prioritario y acceso anticipado a nuevas funciones.',
  },
  {
    q: '¿Cuál es la diferencia entre Pro y Team?',
    a: 'Team incluye todo lo de Pro más colaboración para hasta 5 miembros, prompts compartidos, panel de administrador, facturación centralizada y permisos por rol (admin, editor, viewer).',
  },
  {
    q: '¿Team incluye permisos por rol?',
    a: 'Sí. Con el plan Team puedes asignar roles a cada miembro: admin (control total), editor (puede crear y editar) y viewer (solo lectura).',
  },
  {
    q: '¿Qué pasa con mis proyectos si cancelo?',
    a: 'Tus proyectos siempre son tuyos. Si cancelas Pro o Team, volverás al plan Free y conservarás hasta 3 proyectos. El resto quedará archivado y podrás recuperarlo si vuelves a suscribirte.',
  },
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí, puedes subir o bajar de plan cuando quieras desde tu página de cuenta. Los cambios se aplican de forma inmediata.',
  },
  {
    q: '¿Qué pasa si llego al límite gratuito?',
    a: 'Si llegas al límite de 3 proyectos en el plan Free, no podrás crear nuevos proyectos hasta que actualices al plan Pro o elimines alguno existente.',
  },
  {
    q: '¿Habrá plan anual con descuento?',
    a: 'Estamos preparando un plan anual con descuento. Próximamente podrás pagar por año y ahorrar hasta un 20%. Si quieres ser notificado, escríbenos.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  async function handleCheckout(plan: typeof PLANS[0]) {
    if (plan.ctaHref) { router.push(plan.ctaHref); return }
    setLoading(plan.name)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* HERO */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Planes y precios</h1>
          <p className="text-gray-500 text-lg">Empieza gratis. Sin tarjeta de crédito. Cancela cuando quieras.</p>

          {/* TOGGLE MENSUAL / ANUAL */}
          <div className="inline-flex items-center gap-3 mt-6 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${billing === 'monthly' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Anual
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">-20%</span>
            </button>
          </div>

          {billing === 'yearly' && (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Próximamente disponible — apúntate para ser el primero en saberlo
            </p>
          )}
        </div>

        {/* CARDS DE PLANES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 bg-white p-6 flex flex-col shadow-sm transition hover:shadow-md ${plan.highlight ? 'border-indigo-500 shadow-indigo-100' : plan.color}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full shadow ${
                  plan.name === 'Team' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{plan.desc}</p>
              </div>

              <div className="mb-6">
                {plan.price === 0 ? (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">0 €</span>
                    <span className="text-gray-400 text-sm mb-1">/mes</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {billing === 'yearly' ? Math.round(plan.price * 0.8) : plan.price} €
                    </span>
                    <span className="text-gray-400 text-sm mb-1">/mes</span>
                  </div>
                )}
                {billing === 'yearly' && plan.price > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Facturado anualmente · ahorras {Math.round(plan.price * 0.2 * 12)} €/año
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={loading === plan.name}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
                  plan.highlight
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    : plan.name === 'Team'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } ${loading === plan.name ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading === plan.name ? 'Redirigiendo...' : plan.cta}
              </button>
            </div>
          ))}
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
                  <th className="text-center py-3 text-indigo-600 font-semibold">Pro</th>
                  <th className="text-center py-3 text-purple-600 font-semibold">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Proyectos', '3', 'Ilimitados', 'Ilimitados'],
                  ['Variables dinámicas', '✓', '✓', '✓'],
                  ['Plantillas predefinidas', '✓', '✓', '✓'],
                  ['Importar / exportar JSON', '✓', '✓', '✓'],
                  ['Historial de versiones', '✗', '✓', '✓'],
                  ['Variables globales', '✗', '✓', '✓'],
                  ['Soporte prioritario', '✗', '✓', '✓'],
                  ['Miembros del equipo', '✗', '✗', 'Hasta 5'],
                  ['Prompts compartidos', '✗', '✗', '✓'],
                  ['Panel de administrador', '✗', '✗', '✓'],
                  ['Permisos por rol', '✗', '✗', '✓'],
                  ['Facturación centralizada', '✗', '✗', '✓'],
                ].map(([feature, free, pro, team]) => (
                  <tr key={feature}>
                    <td className="py-3 text-gray-700">{feature}</td>
                    <td className="py-3 text-center text-gray-400">{free}</td>
                    <td className="py-3 text-center text-indigo-600 font-medium">{pro}</td>
                    <td className="py-3 text-center text-purple-600 font-medium">{team}</td>
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
      </main>
    </div>
  )
}
