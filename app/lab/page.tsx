'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Analysis {
  score: number
  strengths: string[]
  improvements: string[]
  optimized: string
  tip: string
  variables?: string[]
}

export default function LabPage() {
  const [content, setContent] = useState('')
  const [type, setType] = useState<'context' | 'profile'>('context')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const analyze = async () => {
    if (!content.trim() || content.trim().length < 20) {
      setError('Escribe al menos 20 caracteres para analizar.')
      return
    }
    setLoading(true)
    setError('')
    setAnalysis(null)
    try {
      const res = await fetch('/api/analyze-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setAnalysis(data.analysis)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al analizar')
    } finally {
      setLoading(false)
    }
  }

  const copyOptimized = async () => {
    if (!analysis?.optimized) return
    await navigator.clipboard.writeText(analysis.optimized)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-400'
    if (s >= 5) return 'text-amber-400'
    return 'text-red-400'
  }

  const scoreBg = (s: number) => {
    if (s >= 8) return 'bg-emerald-900/30 border-emerald-700/50'
    if (s >= 5) return 'bg-amber-900/30 border-amber-700/50'
    return 'bg-red-900/30 border-red-700/50'
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Dashboard</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-white text-sm">Keeper Lab</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <span className="text-lg" dangerouslySetInnerHTML={{ __html: '&#9998;' }} />
            </div>
            <h1 className="text-3xl font-bold">Keeper Lab</h1>
          </div>
          <p className="text-zinc-400 ml-[52px]">Analiza tu contexto con IA. Obtén un score, mejoras concretas y una versión optimizada lista para usar.</p>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'context', label: 'Contexto', icon: '&#9632;' },
            { id: 'profile', label: 'Keeper Profile', icon: '&#9670;' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setType(t.id as 'context' | 'profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                type === t.id
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: t.icon }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
            <span className="text-zinc-400 text-sm">
              {type === 'context' ? 'Pega tu contexto aquí' : 'Pega tu Keeper Profile aquí'}
            </span>
            <span className="text-zinc-600 text-xs">{content.length} chars</span>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={type === 'context'
              ? 'Ej: Soy diseñador UX freelance. Trabajo con startups B2B. Mi tono es directo y sin rodeos...'
              : 'Ej: Nombre: Estratega de Producto. Rol: PM senior en SaaS. Tono: directo, orientado a datos...'}
            rows={8}
            className="w-full bg-transparent text-white text-sm px-5 py-4 resize-none focus:outline-none placeholder:text-zinc-600 leading-relaxed"
          />
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <button
          onClick={analyze}
          disabled={loading || content.trim().length < 20}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mb-10"
        >
          {loading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Analizando con IA...
            </>
          ) : (
            <>
              <span dangerouslySetInnerHTML={{ __html: '&#9998;' }} />
              Analizar con Keeper Lab
            </>
          )}
        </button>

        {/* Results */}
        {analysis && (
          <div className="space-y-5 animate-fadeIn">

            {/* Score */}
            <div className={`border rounded-2xl p-6 flex items-center gap-6 ${scoreBg(analysis.score)}`}>
              <div className="text-center">
                <p className={`text-6xl font-black ${scoreColor(analysis.score)}`}>{analysis.score}</p>
                <p className="text-zinc-400 text-xs mt-1">de 10</p>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  {analysis.score >= 8 ? 'Excelente contexto' : analysis.score >= 5 ? 'Contexto mejorable' : 'Necesita trabajo'}
                </h3>
                <p className="text-zinc-300 text-sm italic">"{analysis.tip}"</p>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-emerald-800/30 rounded-2xl p-5">
                <h4 className="text-emerald-400 text-sm font-semibold mb-3 flex items-center gap-2">
                  <span dangerouslySetInnerHTML={{ __html: '&#10003;' }} />
                  Puntos fuertes
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">&#9670;</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-zinc-900 border border-amber-800/30 rounded-2xl p-5">
                <h4 className="text-amber-400 text-sm font-semibold mb-3 flex items-center gap-2">
                  <span dangerouslySetInnerHTML={{ __html: '&#9650;' }} />
                  Mejoras sugeridas
                </h4>
                <ul className="space-y-2">
                  {analysis.improvements.map((imp, i) => (
                    <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">&#9670;</span>
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Variables sugeridas */}
            {analysis.variables && analysis.variables.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h4 className="text-violet-400 text-sm font-semibold mb-3">Variables dinámicas sugeridas</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.variables.map((v, i) => (
                    <span key={i} className="bg-violet-900/30 border border-violet-700/50 text-violet-300 text-xs px-3 py-1.5 rounded-full font-mono">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optimized version */}
            <div className="bg-zinc-900 border border-violet-800/40 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
                <span className="text-violet-400 text-sm font-medium flex items-center gap-2">
                  <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} />
                  Versión optimizada — lista para usar
                </span>
                <button
                  onClick={copyOptimized}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all"
                >
                  {copied ? (
                    <span className="text-emerald-400">&#10003; Copiado</span>
                  ) : (
                    <>Copiar contexto</>
                  )}
                </button>
              </div>
              <div className="p-5">
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{analysis.optimized}</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}