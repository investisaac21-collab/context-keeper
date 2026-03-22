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
      ? `Eres un experto en ingenieria de prompts y comunicacion con IAs.
Analiza el perfil de IA del usuario y devuelve un JSON en UNA SOLA LINEA con exactamente esta estructura:
{"score":8,"strengths":["punto 1","punto 2"],"improvements":["mejora 1","mejora 2"],"optimized":"version mejorada del perfil lista para copiar","tip":"consejo clave en una frase"}
CRITICO: El JSON debe estar en una sola linea sin saltos de linea reales en los valores. Responde SOLO el JSON.`
      : `Eres un experto en ingenieria de contexto para IAs.
Analiza el contexto del usuario y devuelve un JSON en UNA SOLA LINEA con exactamente esta estructura:
{"score":8,"strengths":["punto 1","punto 2"],"improvements":["mejora 1","mejora 2"],"optimized":"version mejorada del contexto lista para usar","tip":"consejo clave en una frase","variables":["{{variable1}}","{{variable2}}"]}
CRITICO: El JSON debe estar en una sola linea sin saltos de linea reales en los valores. Responde SOLO el JSON, sin markdown.`

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
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: 'Error GROQ: ' + err }, { status: 500 })
    }

    const groqData = await response.json()
    const rawText = groqData.choices[0]?.message?.content || '{}'

    // Strip markdown fences
    let text = rawText.replace(/\`\`\`(?:json)?\s*/gi, '').replace(/\`\`\`\s*/g, '').trim()

    // Find JSON boundaries
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'Respuesta invalida de IA' }, { status: 500 })
    }
    let rawJson = text.slice(jsonStart, jsonEnd + 1)

    // Sanitize control characters inside JSON string values
    rawJson = rawJson.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_match: string, inner: string) => {
      const sanitized = inner
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      return '"' + sanitized + '"'
    })

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
