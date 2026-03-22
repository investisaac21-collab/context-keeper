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
    localStorage.setItem('ck_onboarding_dismissed', 'true')
    setDismissed(true)
    onDismiss()
  }

  if (!mounted || dismissed) return null

  const steps = [
    {
      id: 'profile',
      title: 'Crea tu primer Keeper Profile',
      description: 'Define la identidad persistente de tu IA: nombre, rol, tono y reglas. La base de todo.',
      icon: '&#9671;',
      color: 'violet',
      done: false,
      action: { label: 'Ir a Profiles', onClick: () => { window.location.href = '/profiles' } },
    },
    {
      id: 'create',
      title: 'Guarda tu primera memoria',
      description: 'Crea un contexto con la personalidad e instrucciones que quieres que tu IA tenga siempre.',
      icon: '&#9632;',
      color: 'blue',
      done: hasProjects,
      action: !hasProjects ? { label: 'Crear contexto', onClick: onCreateProject } : null,
    },
    {
      id: 'lab',
      title: 'Analiza con Keeper Lab',
      description: 'El motor 4D evalua tu perfil en Claridad, Consistencia, Completitud y Efectividad.',
      icon: '&#9650;',
      color: 'blue',
      done: false,
      action: { label: 'Abrir Lab', onClick: () => { window.location.href = '/profiles' } },
    },
    {
      id: 'forge',
      title: 'Simula con Keeper Forge',
      description: 'Pon a prueba tu perfil en escenarios reales. Descubre sus gaps antes de usarlo.',
      icon: '&#9670;',
      color: 'amber',
      done: false,
      action: { label: 'Abrir Forge', onClick: () => { window.location.href = '/profiles' } },
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const allDone = completedCount === steps.length
  const percent = Math.round((completedCount / steps.length) * 100)

  if (allDone) {
    return (
      <div style={{ background: 'rgba(16,16,20,0.95)', border: '1px solid rgba(34,197,94,0.25)' }} className="rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 text-xl">
            &#10003;
          </div>
          <div>
            <h2 className="font-bold text-zinc-100 text-base">Sistema activado</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Has completado la configuracion de Keeper</p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-auto text-zinc-600 hover:text-zinc-400 transition text-lg leading-none"
            title="Cerrar"
          >
            &times;
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'rgba(12,12,16,0.97)',
        border: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '0 0 0 1px rgba(139,92,246,0.05), 0 4px 24px rgba(0,0,0,0.4)'
      }}
      className="rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span style={{ color: 'rgba(139,92,246,0.9)', fontSize: 10, letterSpacing: '0.1em' }} className="font-mono font-bold uppercase">KEEPER SYSTEM</span>
          </div>
          <h2 className="font-bold text-zinc-100 text-base">Primeros pasos</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Activa el sistema completo para el maximo rendimiento
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-600 hover:text-zinc-400 transition text-lg leading-none mt-1"
          title="Cerrar guia"
        >
          &times;
        </button>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-zinc-600">{completedCount} de {steps.length} completados</span>
          <span className="text-xs font-semibold text-violet-400">{percent}%</span>
        </div>
        <div className="h-1" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div
            style={{ width: percent + '%', background: 'rgba(139,92,246,0.8)', borderRadius: 2, transition: 'width 0.5s ease' }}
            className="h-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              background: step.done
                ? 'rgba(34,197,94,0.06)'
                : idx === completedCount
                ? 'rgba(139,92,246,0.07)'
                : 'rgba(255,255,255,0.02)',
              border: step.done
                ? '1px solid rgba(34,197,94,0.15)'
                : idx === completedCount
                ? '1px solid rgba(139,92,246,0.2)'
                : '1px solid rgba(255,255,255,0.04)',
              opacity: idx > completedCount ? 0.5 : 1
            }}
            className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200"
          >
            <div
              style={{
                background: step.done
                  ? 'rgba(34,197,94,0.15)'
                  : idx === completedCount
                  ? 'rgba(139,92,246,0.15)'
                  : 'rgba(255,255,255,0.05)',
                color: step.done
                  ? 'rgb(134,239,172)'
                  : idx === completedCount
                  ? 'rgb(167,139,250)'
                  : 'rgba(255,255,255,0.3)',
                fontSize: 11
              }}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold"
            >
              {step.done
                ? <span>&#10003;</span>
                : <span>{idx + 1}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: step.done ? 'rgba(134,239,172,0.7)' : 'rgba(255,255,255,0.85)' }}>
                {step.title}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                {step.description}
              </p>
            </div>

            {!step.done && step.action && (
              <button
                onClick={step.action.onClick}
                style={{
                  background: idx === completedCount ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.06)',
                  color: idx === completedCount ? 'white' : 'rgba(255,255,255,0.4)',
                  border: idx === completedCount ? 'none' : '1px solid rgba(255,255,255,0.08)'
                }}
                className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap hover:opacity-80"
              >
                {step.action.label}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-zinc-700 mt-4">
        Puedes cerrar esta guia y volver a ella cuando quieras.
      </p>
    </div>
  )
}
