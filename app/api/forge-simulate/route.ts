import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

function sanitizeJson(raw: string): string {
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
  const s = text.indexOf('{'), e = text.lastIndexOf('}')
  if (s === -1 || e === -1) return ''
  let j = text.slice(s, e + 1)
  j = j.replace(/(?<!\\)\n/g, ' ').replace(/(?<!\\)\r/g, ' ')
  j = j.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_m: string, inner: string) =>
    '"' + inner.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"'
  )
  j = j.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
  return j
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { profile, mode, scenario } = await request.json()
    if (!profile) return NextResponse.json({ error: 'Perfil requerido' }, { status: 400 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })

    const ra = profile.rules || []
    const profileDesc = [
      'PERFIL: ' + profile.name,
      profile.role ? 'ROL: ' + profile.role : '',
      profile.tone ? 'TONO: ' + profile.tone : '',
      profile.goals ? 'OBJETIVO: ' + profile.goals : '',
      ra.length ? 'REGLAS: ' + ra.join(' | ') : '',
      profile.limits ? 'LIMITES: ' + profile.limits : '',
      profile.base_memory ? 'MEMORIA: ' + profile.base_memory : '',
      profile.response_patterns ? 'PATRONES: ' + profile.response_patterns : '',
      profile.relationships ? 'RELACIONES: ' + profile.relationships : '',
      profile.extra ? 'CONTEXTO: ' + profile.extra : '',
    ].filter(Boolean).join('\n')

    let prompt: string
    if (mode === 'scenario' && scenario) {
      prompt = `Eres un motor de simulacion y validacion de identidades de IA.
Simula como responderia el perfil dado en el escenario indicado y evalua la consistencia.
Devuelve un JSON en UNA SOLA LINEA: {"simulated_response":"como responderia el perfil","consistency_score":8,"detected_issues":["issue 1"],"strengths_shown":["fortaleza 1"],"recommendation":"recomendacion concreta","verdict":"SOLIDO|ACEPTABLE|INCONSISTENTE"}
JSON en una sola linea. Sin markdown. Solo el JSON.

${profileDesc}

ESCENARIO: ${scenario}`
    } else if (mode === 'stress') {
      prompt = `Eres un motor de estres y validacion de identidades de IA.
Somete al perfil a preguntas dificiles y detecta sus debilidades.
Devuelve un JSON en UNA SOLA LINEA: {"stress_questions":["pregunta 1","pregunta 2","pregunta 3"],"predicted_failures":["fallo 1","fallo 2"],"consistency_score":7,"critical_gaps":["gap 1"],"hardening_suggestions":["sugerencia 1","sugerencia 2"],"overall_verdict":"ROBUSTO|FRAGIL|NECESITA_TRABAJO"}
JSON en una sola linea. Sin markdown. Solo el JSON.

${profileDesc}`
    } else {
      prompt = `Eres un validador rapido de identidades de IA.
Analiza el perfil y genera una interaccion de prueba para verificar coherencia.
Devuelve un JSON en UNA SOLA LINEA: {"test_interaction":{"question":"pregunta de prueba","expected_response":"como deberia responder"},"quick_verdict":"COHERENTE|INCONSISTENTE|INCOMPLETO","notes":"observacion en una frase"}
JSON en una sola linea. Sin markdown. Solo el JSON.

${profileDesc}`
    }

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 1500 } })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error Gemini' }, { status: 500 })

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const rawJson = sanitizeJson(raw)
    if (!rawJson) return NextResponse.json({ error: 'Respuesta invalida de IA' }, { status: 500 })

    let result: Record<string, unknown>
    try { result = JSON.parse(rawJson) }
    catch (_e) { return NextResponse.json({ error: 'No se pudo procesar la simulacion' }, { status: 500 }) }

    return NextResponse.json({ result, mode })
  } catch (error) {
    console.error('forge-simulate error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
