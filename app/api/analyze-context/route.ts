import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

function sanitizeJson(raw: string): string {
  let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
  const s = text.indexOf('{'), e = text.lastIndexOf('}')
  if (s === -1 || e === -1) return ''
  let j = text.slice(s, e + 1)
  j = j.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
  j = j.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_m: string, inner: string) =>
    '"' + inner.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t') + '"'
  )
  return j
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { profileId, contextText, content } = await request.json()
  const textToAnalyze = contextText || content
  if (!profileId || !textToAnalyze) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })

  const { data: profile } = await supabase
    .from('keeper_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', session.user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  const prompt = `Eres un analizador experto de perfiles de IA para el sistema Keeper.

PERFIL: ${profile.name} - ${profile.role}
CONTEXTO DEL PERFIL: ${profile.context}
VARIABLES DEFINIDAS: ${JSON.stringify(profile.variables || [])}

TEXTO A ANALIZAR:
${textToAnalyze}

Analiza el texto y evalua que tan bien captura la esencia del perfil. Responde SOLO con JSON valido en UNA SOLA LINEA sin saltos dentro de strings:
{"summary":"[resumen ejecutivo en 2-3 oraciones]","key_points":["punto1","punto2","punto3"],"extracted_variables":{"nombre_variable":"valor_extraido"},"relevance_score":[numero del 1 al 10],"score":[mismo numero],"suggested_prompt":"[prompt sugerido]","context_type":"[meeting/decision/research/update/other]","tip":"[consejo principal para mejorar el perfil]","improvements":["mejora1","mejora2"],"optimized":"[version mejorada del texto, max 3 oraciones]"}

Idioma: el mismo que el texto de entrada.`

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
      })
    })
    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    raw = parts.find((p: {text?: string}) => p.text && p.text.trim())?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!raw) return NextResponse.json({ error: 'No se pudo analizar el contexto' }, { status: 500 })

  let parsed: Record<string, unknown>
  try {
    const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()
    const s = stripped.indexOf('{')
    const e = stripped.lastIndexOf('}')
    const jsonStr = (s !== -1 && e !== -1) ? stripped.slice(s, e + 1) : stripped
    parsed = JSON.parse(jsonStr)
  } catch (_e1) {
    try {
      parsed = JSON.parse(sanitizeJson(raw))
    } catch (_e2) {
      return NextResponse.json({ error: 'No se pudo analizar el contexto' }, { status: 500 })
    }
  }

  return NextResponse.json({ analysis: parsed })
}
