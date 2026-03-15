'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    desc: 'Para empezar sin compromiso',
    features: [
      '3 proyectos',
      'Variables dinamicas',
      'Exportar / Importar JSON',
      'Plantillas predefinidas',
    ],
    cta: 'Empezar gratis',
    href: '/login',
    highlight: false,
    priceId: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    desc: 'Para profesionales que usan IA a diario',
    features: [
      'Proyectos ilimitados',
      'Historial de versiones y rollback',
      'Variables globales guardadas',
      'Soporte prioritario',
      'Acceso anticipado a nuevas features',
    ],
    cta: 'Hazte Pro',
    href: null,
    highlight: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  },
  {
    id: 'team',
    name: 'Team',
    price: 20,
    desc: 'Para equipos que comparten prompts',
    features: [
      'Todo lo de Pro',
      'Hasta 5 miembros del equipo',
      'Prompts compartidos entre miembros',
      'Panel de administrador',
      'Facturacion centralizada',
    ],
    cta: 'Ver Team',
    href: null,
    highlight: false,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleCheckout = async (priceId: string, planId: string) => {
    setLoading(planId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al iniciar el pago. Intentalo de nuevo.')
      }
    } catch {
      alert('Error al conectar con el servidor de pagos.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Context Keeper</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Mi dashboard</Link>
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Entrar
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Planes y precios</h1>
        <p className="text-lg text-gray-500">Empieza gratis. Sin tarjeta de credito. Cancela cuando quieras.</p>
      </section>

      {/* PLANS */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-7 border flex flex-col ${
                plan.highlight
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105'
                  : 'bg-white border-gray-200'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-3">Mas popular</div>
              )}
              <div className="mb-5">
                <h2 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold">{plan.price}€</span>
                  <span className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>/mes</span>
                </div>
                <p className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{plan.desc}</p>
              </div>
              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-indigo-300' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.href ? (
                <Link
                  href={plan.href}
                  className={`block text-center text-sm font-semibold py-3 rounded-xl transition-colors ${
                    plan.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => plan.priceId && handleCheckout(plan.priceId, plan.id)}
                  disabled={loading === plan.id || !plan.priceId}
                  className={`w-full text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {loading === plan.id ? 'Cargando...' : plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-6">
          {[
            { q: 'Puedo cancelar en cualquier momento?', a: 'Si, cancela cuando quieras desde tu cuenta. Sin penalizaciones ni compromisos.' },
            { q: 'Mis datos estan seguros?', a: 'Totalmente. Usamos Supabase con RLS para que solo tu accedas a tus proyectos. Nunca compartimos tus datos.' },
            { q: 'Que pasa si llego al limite gratuito?', a: 'Seguiras viendo tus 3 proyectos existentes. Para crear mas necesitas el plan Pro.' },
            { q: 'Hay descuento anual?', a: 'Proximamente. Suscribete ahora y te avisamos cuando lancemos el plan anual con descuento.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-5">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-500 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
