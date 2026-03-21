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
      id: 'create',
      title: 'Guarda tu primera memoria',
      description: 'Crea un contexto con la personalidad, instrucciones y tono que quieres que tu IA tenga siempre.',
      icon: '&#128196;',
      done: hasProjects,
      action: !hasProjects ? { label: 'Crear contexto', onClick: onCreateProject } : null,
    },
    {
      id: 'variables',
      title: 'Añade tokens de memoria',
      description: 'Usa {{variable}} en tu contexto para personalizar partes dinamicas. Tu nombre, empresa, stack — siempre disponibles.',
      icon: '&#9881;',
      done: hasVariables,
      action: !hasVariables ? { label: 'Agregar token', onClick: onAddVariable } : null,
    },
    {
      id: 'copy',
      title: 'Copia y activa tu IA',
      description: 'Un clic copia el contexto completo listo para pegar en ChatGPT, Claude o Gemini. Tu IA ya sabe quien eres.',
      icon: '&#128203;',
      done: hasCopied,
      action: null,
    },
    {
      id: 'profile',
      title: 'Crea tu primer Keeper Profile',
      description: 'Define la identidad persistente de tu IA: tono, rol y reglas. Pegala en cualquier chat para que siempre sepa como ser.',
      icon: '&#128100;',
      done: false,
      action: { label: 'Ir a Profiles', onClick: () => { window.location.href = '/profiles' } },
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const allDone = completedCount === steps.length
  const percent = Math.round((completedCount / steps.length) * 100)

  if (allDone) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
              <span dangerouslySetInnerHTML={{ __html: '&#10003;' }} />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">&#161;Listo! Ya dominas Keeper</p>
              <p className="text-xs text-green-600 mt-0.5">Completaste todos los pasos de inicio.</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-xs text-green-500 hover:text-green-700 transition">
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900 text-base">Primeros pasos</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Completa esta guía para sacarle el máximo provecho a Keeper
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-300 hover:text-gray-500 transition text-lg leading-none"
          title="Cerrar guía"
        >
          &times;
        </button>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">{completedCount} de {steps.length} completados</span>
          <span className="text-xs font-semibold text-violet-600">{percent}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
            style={{ width: percent + '%' }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={"flex items-start gap-3 p-3 rounded-lg transition " + (
              step.done
                ? 'bg-green-50 border border-green-100'
                : idx === completedCount
                ? 'bg-white border border-violet-200 shadow-sm'
                : 'bg-white/60 border border-gray-100 opacity-60'
            )}
          >
            <div className={"flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold " + (
              step.done
                ? 'bg-green-100 text-green-600'
                : idx === completedCount
                ? 'bg-violet-100 text-violet-600'
                : 'bg-gray-100 text-gray-400'
            )}>
              {step.done
                ? <span dangerouslySetInnerHTML={{ __html: '&#10003;' }} />
                : <span className="text-xs">{idx + 1}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <p className={"text-sm font-medium " + (step.done ? 'text-green-700 line-through' : 'text-gray-900')}>
                <span dangerouslySetInnerHTML={{ __html: step.icon }} />
                {' '}{step.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {step.description}
              </p>
            </div>

            {step.action && idx === completedCount && (
              <button
                onClick={step.action.onClick}
                className="flex-shrink-0 text-xs bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition font-medium whitespace-nowrap"
              >
                {step.action.label}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-gray-400 mt-4">
        Puedes cerrar esta guía y volver a ella cuando quieras.
      </p>
    </div>
  )
}
