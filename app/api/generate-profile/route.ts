import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

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

  const { description } = await request.json()
  if (!description) return NextResponse.json({ error: 'Descripcion requerida' }, { status: 400 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  const prompt = `Eres un generador de perfiles de IA para un sistema llamado Keeper. Dado una descripcion, genera un perfil JSON estructurado.

DESCRIPCION: "${description}"

REGLAS CRITICAS:
- Si la descripcion contiene contenido sexual, violento, ilegal o inapropiado, responde EXACTAMENTE: {"error":"Este tipo de perfil no esta disponible en Keeper"}
- De lo contrario, genera un perfil profesional y util
- Responde SOLO con JSON valido en UNA SOLA LINEA, sin markdown, sin explicaciones

FORMATO (una sola linea):
{"name":"[nombre corto y memorable]","role":"[rol profesional conciso]","context":"[descripcion del perfil en 2-3 oraciones]","rules":"[reglas de comportamiento en una oracion]","variables":[{"name":"nombre_var","description":"descripcion","example":"ejemplo"}]}

Maximo 2 variables relevantes. Todo en el mismo idioma que la descripcion.`

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 500 }
      })
    })
    const data = await res.json()
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!raw) return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })

  const sanitized = sanitizeJson(raw)
  if (!sanitized) return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(sanitized)
  } catch (_e) {
    return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })
  }

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  return NextResponse.json(parsed)
}
