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
      title: 'Crea tu primer proyecto',
      description: 'Define un nombre, categor\u00c3\u00ada y escribe el prompt de contexto que quieres reutilizar.',
      icon: '&#128196;',
      done: hasProjects,
      action: !hasProjects ? { label: 'Crear proyecto', onClick: onCreateProject } : null,
    },
    {
      id: 'variables',
      title: 'Agrega variables din\u00c3\u00a1micas',
      description: 'Usa {{nombre}} en tu prompt y define valores por defecto para reutilizarlas f\u00c3\u00a1cilmente.',
      icon: '&#9881;',
      done: hasVariables,
      action: !hasVariables ? { label: 'Ir a Variables', onClick: onAddVariable } : null,
    },
    {
      id: 'preview',
      title: 'Previsualiza el resultado',
      description: 'Haz clic en Vista previa en cualquier proyecto para ver el prompt final con las variables reemplazadas.',
      icon: '&#128065;',
      done: hasPreview,
      action: null,
    },
    {
      id: 'copy',
      title: 'Copia y usa en tu IA favorita',
      description: 'Con un clic copias el prompt listo para pegar en ChatGPT, Claude, Gemini o cualquier otra herramienta.',
      icon: '&#128203;',
      done: hasCopied,
      action: null,
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
              <p className="font-semibold text-green-800 text-sm">&#161;Listo! Ya dominas Context Keeper</p>
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
            Completa esta gu\u00c3\u00ada para sacarle el m\u00c3\u00a1ximo provecho a Context Keeper
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-300 hover:text-gray-500 transition text-lg leading-none"
          title="Cerrar gu\u00c3\u00ada"
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
        Puedes cerrar esta gu\u00c3\u00ada y volver a ella cuando quieras.
      </p>
    </div>
  )
}
