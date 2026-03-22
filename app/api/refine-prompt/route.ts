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

  const { currentPrompt, feedback, profileId } = await request.json()
  if (!currentPrompt || !feedback) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })

  let profileInfo = ''
  if (profileId) {
    const { data: profile } = await supabase
      .from('keeper_profiles')
      .select('name, role, context')
      .eq('id', profileId)
      .eq('user_id', session.user.id)
      .single()
    if (profile) {
      profileInfo = `PERFIL: ${profile.name} - ${profile.role}\n`
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  const prompt = `Eres un experto en prompt engineering. Refina el siguiente prompt basandote en el feedback del usuario.

${profileInfo}PROMPT ACTUAL:
${currentPrompt}

FEEDBACK DEL USUARIO:
${feedback}

Genera una version mejorada del prompt. Responde SOLO con JSON en UNA SOLA LINEA:
{"refined_prompt":"[prompt refinado y mejorado]","changes_made":["cambio1","cambio2"],"improvement_score":[1-10]}`

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      })
    })
    const data = await res.json()
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!raw) return NextResponse.json({ error: 'No se pudo refinar el prompt' }, { status: 500 })

  const sanitized = sanitizeJson(raw)
  if (!sanitized) return NextResponse.json({ error: 'No se pudo refinar el prompt' }, { status: 500 })

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(sanitized)
  } catch (_e) {
    return NextResponse.json({ error: 'No se pudo refinar el prompt' }, { status: 500 })
  }

  return NextResponse.json(parsed)
}
