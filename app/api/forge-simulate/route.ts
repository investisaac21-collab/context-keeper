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

    const ra = profile.rules || []
    const profileDesc = ['PERFIL: '+profile.name,profile.role?'ROL: '+profile.role:'',profile.tone?'TONO: '+profile.tone:'',profile.goals?'OBJETIVO: '+profile.goals:'',ra.length?'REGLAS: '+ra.join(' | '):'',profile.limits?'LIMITES: '+profile.limits:'',profile.base_memory?'MEMORIA: '+profile.base_memory:'',profile.response_patterns?'PATRONES: '+profile.response_patterns:'',profile.relationships?'RELACIONES: '+profile.relationships:'',profile.extra?'CONTEXTO: '+profile.extra:''].filter(Boolean).join('\n')

    let systemPrompt: string, userMessage: string
    if (mode === 'scenario' && scenario) {
      systemPrompt = `Eres un motor de simulacion y validacion de identidades de IA. Simula como responderia el perfil dado en el escenario indicado. Devuelve un JSON en UNA SOLA LINEA: {"simulated_response":"como responderia el perfil","consistency_score":8,"detected_issues":["issue 1"],"strengths_shown":["fortaleza 1"],"recommendation":"recomendacion concreta","verdict":"SOLIDO|ACEPTABLE|INCONSISTENTE"} CRITICO: JSON en una sola linea. Sin markdown. Responde SOLO el JSON.`
      userMessage = `PERFIL A SIMULAR:\n${profileDesc}\n\nESCENARIO: ${scenario}`
    } else if (mode === 'stress') {
      systemPrompt = `Eres un motor de estres y validacion de identidades de IA. Devuelve un JSON en UNA SOLA LINEA: {"stress_questions":["pregunta 1","pregunta 2","pregunta 3"],"predicted_failures":["fallo 1","fallo 2"],"consistency_score":7,"critical_gaps":["gap 1"],"hardening_suggestions":["sugerencia 1","sugerencia 2"],"overall_verdict":"ROBUSTO|FRAGIL|NECESITA_TRABAJO"} CRITICO: JSON en una sola linea. Sin markdown. Responde SOLO el JSON.`
      userMessage = `Somete a estres este perfil:\n${profileDesc}`
    } else {
      systemPrompt = `Eres un validador rapido de identidades de IA. Devuelve un JSON en UNA SOLA LINEA: {"test_interaction":{"question":"pregunta de prueba","expected_response":"como deberia responder"},"quick_verdict":"COHERENTE|INCONSISTENTE|INCOMPLETO","notes":"observacion en una frase"} CRITICO: JSON en una sola linea. Sin markdown. Responde SOLO el JSON.`
      userMessage = `Valida rapidamente este perfil:\n${profileDesc}`
    }

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }], temperature: 0.4, max_tokens: 1500 }),
    })
    if (!response.ok) { const err = await response.text(); return NextResponse.json({ error: 'Error GROQ: ' + err }, { status: 500 }) }
    const groqData = await response.json()
    const rawText = groqData.choices[0]?.message?.content || '{}'
    let text = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
    const jsonStart = text.indexOf('{'), jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) return NextResponse.json({ error: 'Respuesta invalida de IA' }, { status: 500 })
    let rawJson = text.slice(jsonStart, jsonEnd + 1)
    rawJson = rawJson.replace(/(?<!\\)\n/g, ' ').replace(/(?<!\\)\r/g, ' ')
    rawJson = rawJson.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_m: string, inner: string) => '"' + inner.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"')
    rawJson = rawJson.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    let result: Record<string, unknown>
    try { result = JSON.parse(rawJson) }
    catch (_e) { return NextResponse.json({ error: 'No se pudo procesar la simulacion' }, { status: 500 }) }
    return NextResponse.json({ result, mode })
  } catch (error) { console.error('forge-simulate error:', error); return NextResponse.json({ error: 'Error interno' }, { status: 500 }) }
}
