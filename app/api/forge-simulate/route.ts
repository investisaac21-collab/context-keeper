import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function sanitizeJson(raw: string): string {
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
  const s = text.indexOf('{'), e = text.lastIndexOf('}')
  if (s === -1 || e === -1) return ''
  let j = text.slice(s, e + 1)
  j = j.replace(/(?<!\\)\n/g, ' ').replace(/(?<!\\)\r/g, ' ')
  j = j.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_m: string, inner: string) =>
    '"' + inner.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t') + '"'
  )
  j = j.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
  return j
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { profileId, mode, scenario } = await request.json()
  if (!profileId || !mode) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })

  const { data: profile } = await supabase
    .from('keeper_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', session.user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  let prompt = ''
  if (mode === 'scenario') {
    prompt = `Eres un evaluador experto de perfiles de IA para el sistema Keeper.

PERFIL A EVALUAR:
Nombre: ${profile.name}
Rol: ${profile.role}
Contexto: ${profile.context}
Reglas: ${profile.rules || 'No definidas'}
Variables: ${JSON.stringify(profile.variables || [])}

ESCENARIO DE PRUEBA: "${scenario || 'Interaccion general con usuario'}"

Simula como responderia este perfil al escenario y evalua su consistencia. Responde SOLO con JSON en UNA SOLA LINEA:
{"simulated_response":"[como responderia el perfil]","consistency_score":[1-10],"detected_issues":["issue1","issue2"],"strengths_shown":["fortaleza1","fortaleza2"],"recommendation":"[recomendacion principal]","verdict":"SOLIDO"}`
  } else if (mode === 'stress') {
    prompt = `Eres un evaluador experto de perfiles de IA para el sistema Keeper.

PERFIL A EVALUAR:
Nombre: ${profile.name}
Rol: ${profile.role}
Contexto: ${profile.context}
Reglas: ${profile.rules || 'No definidas'}

Genera preguntas de estres para romper la consistencia del perfil y evalua sus puntos debiles. Responde SOLO con JSON en UNA SOLA LINEA:
{"stress_questions":["pregunta1","pregunta2","pregunta3"],"predicted_failures":["fallo1","fallo2"],"consistency_score":[1-10],"critical_gaps":["gap1","gap2"],"hardening_suggestions":["sugerencia1","sugerencia2"],"overall_verdict":"ROBUSTO"}`
  } else {
    prompt = `Eres un evaluador experto de perfiles de IA para el sistema Keeper.

PERFIL A EVALUAR:
Nombre: ${profile.name}
Rol: ${profile.role}
Contexto: ${profile.context}

Realiza una prueba libre de interaccion con este perfil. Responde SOLO con JSON en UNA SOLA LINEA:
{"test_interaction":{"question":"[pregunta de prueba]","expected_response":"[respuesta esperada]"},"quick_verdict":"COHERENTE","notes":"[observaciones]"}`
  }

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2500 }
      })
    })
    const data = await res.json()
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!raw) return NextResponse.json({ error: 'No se pudo simular' }, { status: 500 })

  const sanitized = sanitizeJson(raw)
  if (!sanitized) return NextResponse.json({ error: 'No se pudo simular' }, { status: 500 })

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(sanitized)
  } catch (_e) {
    return NextResponse.json({ error: 'No se pudo simular' }, { status: 500 })
  }

  return NextResponse.json({ result: parsed })
}
