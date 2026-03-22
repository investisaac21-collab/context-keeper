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
- NO uses saltos de linea dentro de los valores de cadena
- NO uses caracteres de control en los valores

FORMATO (una sola linea, sin saltos dentro de strings):
{"name":"[nombre corto]","role":"[rol conciso]","context":"[descripcion 2-3 oraciones sin saltos]","rules":"[reglas en una oracion]","variables":[{"name":"var1","description":"desc","example":"ej"}]}

Maximo 2 variables. Todo en el mismo idioma que la descripcion.`

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 800, responseMimeType: 'application/json' }
      })
    })
    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    raw = parts.find((p: {text?: string}) => p.text && p.text.trim())?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!raw) return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })

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
      return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })
  }

  if (parsed.error) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  return NextResponse.json(parsed)
}
