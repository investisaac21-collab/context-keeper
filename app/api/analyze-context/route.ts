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
      ? `Eres un experto en ingeniería de prompts y comunicación con IAs. 
Analiza el perfil de IA del usuario y devuelve un JSON con exactamente esta estructura:
{
  "score": número del 1 al 10,
  "strengths": ["máximo 3 puntos fuertes, frases cortas"],
  "improvements": ["máximo 3 mejoras concretas y accionables"],
  "optimized": "versión mejorada del perfil, lista para copiar",
  "tip": "un consejo clave de 1 frase"
}
Sé directo, práctico y orientado a resultados. Sin rodeos.`
      : `Eres un experto en ingeniería de contexto para IAs.
Analiza el contexto del usuario y devuelve un JSON con exactamente esta estructura:
{
  "score": número del 1 al 10,
  "strengths": ["máximo 3 puntos fuertes, frases cortas"],
  "improvements": ["máximo 3 mejoras concretas y accionables"],
  "optimized": "versión mejorada del contexto completo, lista para usar",
  "tip": "un consejo clave de 1 frase",
  "variables": ["variables dinámicas sugeridas como {{nombre_cliente}}, {{proyecto_actual}}"]
}
Sé directo, práctico. Responde SOLO el JSON, nada más.`

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
          { role: 'user', content: `Analiza esto:\n\n${content}` }
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
    
    // Extraer JSON de la respuesta
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Respuesta inválida de IA' }, { status: 500 })
    
    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('analyze-context error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}