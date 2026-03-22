'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const steps = [
  {
    id: 1,
    title: 'Bienvenido a Keeper',
    subtitle: 'La memoria operativa de tu IA',
    description: 'Keeper guarda el contexto de tus IAs para que nunca pierdas el hilo. Cada perfil recuerda quien es, como habla y que sabe.',
    icon: 'K',
    cta: 'Empezar',
    detail: null
  },
  {
    id: 2,
    title: 'Crea tu primer perfil',
    subtitle: 'Dale identidad a tu IA',
    description: 'Un perfil define la personalidad, el rol y las reglas de tu asistente. Puedes generarlo con IA en segundos o configurarlo manualmente.',
    icon: 'P',
    cta: 'Siguiente',
    detail: 'Ejemplos: Chef ejecutivo, Analista financiero, Entrenador personal, Detective noir...'
  },
  {
    id: 3,
    title: 'Prueba el Forge',
    subtitle: 'Pon a prueba tu IA',
    description: 'El Forge simula conversaciones extremas para descubrir los limites de tu perfil. Detecta contradicciones, fisuras de rol y puntos debiles antes de usarlo en produccion.',
    icon: 'F',
    cta: 'Ir al Forge',
    detail: null
  }
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
    })
  }, [router, supabase])

  async function handleCta() {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      setLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await fetch('/api/setup-profiles', { method: 'POST' }).catch(() => {})
        }
      } catch (_e) {}
      router.push('/profiles?forge=true')
    }
  }

  function handleSkip() {
    router.push('/dashboard')
  }

  const current = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Logo */}
      <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', background: '#7c3aed', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', color: '#fff' }}>
          K
        </div>
        <span style={{ color: '#fff', fontSize: '20px', fontWeight: '600' }}>Keeper</span>
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '48px' }}>
        <div style={{ height: '3px', background: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#7c3aed', width: progress + '%', transition: 'width 0.4s ease', borderRadius: '2px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          {steps.map((s, i) => (
            <span key={s.id} style={{ fontSize: '12px', color: i <= step ? '#7c3aed' : '#52525b' }}>
              Paso {s.id}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '480px', background: '#111111', border: '1px solid #27272a', borderRadius: '20px', padding: '48px', textAlign: 'center' }}>
        
        {/* Icon */}
        <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: '28px', fontWeight: '800', color: '#fff', boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
          {current.icon}
        </div>

        {/* Title */}
        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.2' }}>
          {current.title}
        </h1>
        <p style={{ color: '#7c3aed', fontSize: '14px', fontWeight: '500', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {current.subtitle}
        </p>
        <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', marginBottom: current.detail ? '16px' : '40px' }}>
          {current.description}
        </p>
        {current.detail && (
          <div style={{ background: '#1a1a1a', border: '1px solid #3f3f46', borderRadius: '10px', padding: '12px 16px', marginBottom: '40px', textAlign: 'left' }}>
            <p style={{ color: '#71717a', fontSize: '13px', lineHeight: '1.5' }}>{current.detail}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCta}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px', opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}
        >
          {loading ? 'Preparando...' : current.cta}
        </button>

        {/* Skip */}
        {step < steps.length - 1 && (
          <button
            onClick={handleSkip}
            style={{ background: 'none', border: 'none', color: '#52525b', fontSize: '14px', cursor: 'pointer', padding: '8px' }}
          >
            Saltar introduccion
          </button>
        )}

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{ width: i === step ? '24px' : '8px', height: '8px', background: i === step ? '#7c3aed' : '#3f3f46', borderRadius: '4px', transition: 'all 0.3s ease', cursor: 'pointer' }}
              onClick={() => i < step && setStep(i)}
            />
          ))}
        </div>
      </div>

      {/* Bottom hint */}
      <p style={{ color: '#3f3f46', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
        Keeper &mdash; Memoria operativa para tus IAs
      </p>
    </div>
  )
}
