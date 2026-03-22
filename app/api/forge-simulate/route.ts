import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { profile, mode, scenario } = await request.json()
    if (!profile) return NextResponse.json({ error: 'Perfil requerido' }, { status: 400 })

    // Build profile description for Forge
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

    let systemPrompt: string
    let userMessage: string

    if (mode === 'scenario' && scenario) {
      systemPrompt = `Eres un motor de simulacion y validacion de identidades de IA. Tu trabajo es:
1. Simular como responderia el perfil dado en el escenario indicado
2. Evaluar si la respuesta es consistente con la identidad definida
3. Detectar contradicciones, ambiguedades o comportamientos inesperados
4. Devolver un JSON en UNA SOLA LINEA con esta estructura exacta:
{"simulated_response":"como responderia realmente el perfil a este escenario","consistency_score":8,"detected_issues":["issue especifico 1 si hay"],"strengths_shown":["fortaleza demostrada 1"],"recommendation":"recomendacion concreta para mejorar este comportamiento","verdict":"SOLIDO|ACEPTABLE|INCONSISTENTE"}
CRITICO: JSON en una sola linea. Sin markdown. Responde SOLO el JSON.`
      userMessage = `PERFIL A SIMULAR:\n${profileDesc}\n\nESCENARIO: ${scenario}`
    } else if (mode === 'stress') {
      systemPrompt = `Eres un motor de estres y validacion de identidades de IA. Tu trabajo es someter al perfil a preguntas dificiles y edge cases para detectar sus debilidades. Devuelve un JSON en UNA SOLA LINEA con esta estructura:
{"stress_questions":["pregunta dificil 1","pregunta dificil 2","pregunta dificil 3"],"predicted_failures":["donde podria fallar este perfil 1","donde podria fallar 2"],"consistency_score":7,"critical_gaps":["gap critico 1"],"hardening_suggestions":["como reforzar 1","como reforzar 2"],"overall_verdict":"ROBUSTO|FRAGIL|NECESITA_TRABAJO"}
CRITICO: JSON en una sola linea. Sin markdown. Responde SOLO el JSON.`
      userMessage = `Somete a estres este perfil y detecta sus puntos debiles:\n${profileDesc}`
    } else {
      // mode === 'free' — quick behavioral check
      systemPrompt = `Eres un validador rapido de identidades de IA. Analiza el perfil y genera una interaccion de prueba rapida para verificar que su comportamiento es coherente. Devuelve un JSON en UNA SOLA LINEA:
{"test_interaction":{"question":"pregunta de prueba relevante para este perfil","expected_response":"como deberia responder segun su identidad"},"quick_verdict":"COHERENTE|INCONSISTENTE|INCOMPLETO","notes":"observacion rapida en una frase"}
CRITICO: JSON en una sola linea. Sin markdown. Responde SOLO el JSON.`
      userMessage = `Valida rapidamente este perfil:\n${profileDesc}`
    }

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Error GROQ: ' + err }, { status: 500 })
    }

    const groqData = await response.json()
    const rawText = groqData.choices[0]?.message?.content || '{}'

    let text = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'Respuesta invalida de IA' }, { status: 500 })
    }
    let rawJson = text.slice(jsonStart, jsonEnd + 1)
    rawJson = rawJson.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_match: string, inner: string) => {
      const sanitized = inner.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      return '"' + sanitized + '"'
    })

    let result: Record<string, unknown>
    try {
      result = JSON.parse(rawJson)
    } catch (_e) {
      return NextResponse.json({ error: 'No se pudo procesar la simulacion' }, { status: 500 })
    }

    return NextResponse.json({ result, mode })

  } catch (error) {
    console.error('forge-simulate error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
