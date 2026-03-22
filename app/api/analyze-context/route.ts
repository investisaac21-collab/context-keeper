import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'

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

    const { content, type } = await request.json()
    if (!content) return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })

    const prompt = type === 'profile'
      ? `Eres un experto en ingenieria de prompts e identidades de IA. Analiza el perfil de IA y devuelve un JSON en UNA SOLA LINEA: {"score":8,"clarity":8,"consistency":7,"completeness":6,"effectiveness":9,"strengths":["punto 1","punto 2"],"improvements":["mejora especifica 1","mejora especifica 2"],"optimized":"version mejorada lista para usar","tip":"consejo clave actionable en una frase"}. CRITICO: todos los scores del 1 al 10. Las mejoras deben ser ESPECIFICAS. JSON en una sola linea. Solo el JSON.\n\nPERFIL:\n${content}`
      : `Eres un experto en ingenieria de contexto para IAs. Analiza el contexto y devuelve un JSON en UNA SOLA LINEA: {"score":8,"clarity":8,"consistency":7,"completeness":6,"effectiveness":9,"strengths":["punto 1","punto 2"],"improvements":["mejora 1","mejora 2"],"optimized":"version mejorada lista para usar","tip":"consejo clave en una frase","variables":["{{variable1}}","{{variable2}}"]}. CRITICO: todos los scores del 1 al 10. JSON en una sola linea. Solo el JSON.\n\nCONTEXTO:\n${content}`

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 1200 } })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error Gemini' }, { status: 500 })

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const rawJson = sanitizeJson(raw)
    if (!rawJson) return NextResponse.json({ error: 'Respuesta invalida de IA' }, { status: 500 })

    let analysis: Record<string, unknown>
    try { analysis = JSON.parse(rawJson) }
    catch (_e) { return NextResponse.json({ error: 'No se pudo analizar la respuesta de IA' }, { status: 500 }) }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('analyze-context error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
