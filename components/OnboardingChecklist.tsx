'use client'

import { useState, useEffect } from 'react'

interface Props {
  hasProjects: boolean
  hasVariables: boolean
  hasCopied: boolean
  hasPreview: boolean
  onCreateProject: () => void
  onAddVariable: () => void
  onDismiss: () => void
}

export default function OnboardingChecklist({
  hasProjects,
  hasVariables,
  hasCopied,
  hasPreview,
  onCreateProject,
  onAddVariable,
  onDismiss,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const d = localStorage.getItem('ck_onboarding_dismissed')
    if (d === 'true') setDismissed(true)
  }, [])

  function handleDismiss() {
    setDismissed(true)
    localStorage.setItem('ck_onboarding_dismissed', 'true')
    onDismiss()
  }

  const steps = [
    {
      id: 'profile',
      done: hasProjects,
      color: '#a78bfa',
      colorBg: 'rgba(139,92,246,0.1)',
      colorBorder: 'rgba(139,92,246,0.25)',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      label: 'Crea tu primer Keeper Profile',
      desc: 'Dale identidad real a tu IA en 2 minutos.',
      cta: 'Crear perfil',
      action: onCreateProject,
    },
    {
      id: 'context',
      done: hasVariables,
      color: '#67e8f9',
      colorBg: 'rgba(6,182,212,0.1)',
      colorBorder: 'rgba(6,182,212,0.25)',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      label: 'Añade un contexto',
      desc: 'Define el entorno donde opera tu IA.',
      cta: 'Añadir contexto',
      action: onAddVariable,
    },
    {
      id: 'lab',
      done: hasCopied,
      color: '#93c5fd',
      colorBg: 'rgba(59,130,246,0.1)',
      colorBorder: 'rgba(59,130,246,0.25)',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      label: 'Analiza con Keeper Lab',
      desc: 'Descubre si tu perfil aguantaria en produccion.',
      cta: null,
      action: null,
    },
    {
      id: 'forge',
      done: hasPreview,
      color: '#fde68a',
      colorBg: 'rgba(251,191,36,0.1)',
      colorBorder: 'rgba(251,191,36,0.25)',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      label: 'Prueba Keeper Forge',
      desc: 'Simula como responde tu IA ante un escenario real.',
      cta: null,
      action: null,
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const progressPct = Math.round((completedCount / steps.length) * 100)

  if (!mounted || dismissed) return null

  return (
    <div
      style={{
        background: 'rgba(12,12,16,0.97)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 14,
        padding: '18px 20px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px rgba(167,139,250,0.6)' }}></div>
            <span style={{ color: '#e2d9f3', fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>Primeros pasos</span>
            <span style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', color: '#c4b5fd', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20 }}>{completedCount}/{steps.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 140, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: progressPct + '%', height: '100%', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 2, transition: 'width 0.6s ease' }}></div>
            </div>
            <span style={{ color: 'rgba(167,139,250,0.7)', fontSize: 10, fontWeight: 600 }}>{progressPct}%</span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px', borderRadius: 4 }}
          onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)' }}
          onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.25)' }}
        >x</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              background: step.done ? 'rgba(34,197,94,0.05)' : idx === completedCount ? step.colorBg : 'rgba(255,255,255,0.015)',
              border: step.done ? '1px solid rgba(34,197,94,0.15)' : idx === completedCount ? step.colorBorder : '1px solid rgba(255,255,255,0.04)',
              borderRadius: 10,
              padding: '10px 12px',
              opacity: idx > completedCount ? 0.45 : 1,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: step.done ? 'rgba(34,197,94,0.15)' : idx === completedCount ? step.colorBg : 'rgba(255,255,255,0.04)',
                border: step.done ? '1px solid rgba(34,197,94,0.3)' : idx === completedCount ? step.colorBorder : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {step.done ? (
                <svg width="13" height="13" fill="none" stroke="#4ade80" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg width="12" height="12" fill="none" stroke={idx === completedCount ? step.color : 'rgba(255,255,255,0.3)'} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                </svg>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: step.done ? 'rgba(255,255,255,0.45)' : idx === completedCount ? '#f0ebff' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, letterSpacing: '0.01em', textDecoration: step.done ? 'line-through' : 'none', marginBottom: 1 }}>{step.label}</div>
              {!step.done && idx <= completedCount && (
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 400 }}>{step.desc}</div>
              )}
            </div>
            {!step.done && idx === completedCount && step.action && (
              <button
                onClick={step.action}
                style={{ flexShrink: 0, background: step.colorBg, border: step.colorBorder, color: step.color, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.03em', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
              >{step.cta}</button>
            )}
          </div>
        ))}
      </div>

      {completedCount === steps.length && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, textAlign: 'center' }}>
          <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 700 }}>Sistema activo. Tu IA tiene identidad real.</span>
        </div>
      )}
    </div>
  )
}