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

    const { content, type } = await request.json()
    if (!content) return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })

    const systemPrompt = type === 'profile'
      ? `Eres un experto en ingenieria de prompts e identidades de IA. Analiza el perfil de IA del usuario y devuelve un JSON en UNA SOLA LINEA con exactamente esta estructura: {"score":8,"clarity":8,"consistency":7,"completeness":6,"effectiveness":9,"strengths":["punto 1","punto 2"],"improvements":["mejora especifica 1","mejora especifica 2"],"optimized":"version mejorada del perfil lista para usar","tip":"consejo clave actionable en una frase"}. CRITICO: score/clarity/consistency/completeness/effectiveness son numeros del 1 al 10. Las mejoras deben ser ESPECIFICAS con texto exacto a cambiar o anadir, no consejos genericos. El JSON debe estar en una sola linea. Responde SOLO el JSON.`
      : `Eres un experto en ingenieria de contexto para IAs. Analiza el contexto del usuario y devuelve un JSON en UNA SOLA LINEA con exactamente esta estructura: {"score":8,"clarity":8,"consistency":7,"completeness":6,"effectiveness":9,"strengths":["punto 1","punto 2"],"improvements":["mejora 1","mejora 2"],"optimized":"version mejorada del contexto lista para usar","tip":"consejo clave en una frase","variables":["{{variable1}}","{{variable2}}"]}. CRITICO: Todos los scores del 1 al 10. JSON en una sola linea sin saltos de linea reales. Responde SOLO el JSON, sin markdown.`

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
          { role: 'user', content: 'Analiza esto:\n\n' + content }
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Error GROQ: ' + err }, { status: 500 })
    }

    const groqData = await response.json()
    const rawText = groqData.choices[0]?.message?.content || '{}'

    // Layer 1: strip markdown fences
    let text = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()

    // Layer 2: find JSON boundaries
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'Respuesta invalida de IA' }, { status: 500 })
    }
    let rawJson = text.slice(jsonStart, jsonEnd + 1)

    // Layer 3 (pre-sanitize): replace bare real newlines with space before regex parsing
    // This fixes: "Bad control character in string literal in JSON"
    rawJson = rawJson.replace(/(?<!\\)\n/g, ' ').replace(/(?<!\\)\r/g, ' ')

    // Layer 4: escape real newlines/tabs inside string values
    rawJson = rawJson.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_match: string, inner: string) => {
      const sanitized = inner
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      return '"' + sanitized + '"'
    })

    // Layer 5: strip remaining control chars U+0000-U+001F
    rawJson = rawJson.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')

    let analysis: Record<string, unknown>
    try {
      analysis = JSON.parse(rawJson)
    } catch (_e) {
      return NextResponse.json({ error: 'No se pudo analizar la respuesta de IA' }, { status: 500 })
    }

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('analyze-context error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
