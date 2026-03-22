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

  const { profileId, contextId } = await request.json()
  if (!profileId) return NextResponse.json({ error: 'profileId requerido' }, { status: 400 })

  const { data: profile } = await supabase
    .from('keeper_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', session.user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  let contextData = null
  if (contextId) {
    const { data: ctx } = await supabase
      .from('keeper_contexts')
      .select('*')
      .eq('id', contextId)
      .eq('profile_id', profileId)
      .single()
    contextData = ctx
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  const prompt = `Eres un experto en prompt engineering para sistemas de IA como ChatGPT, Claude y Gemini.

PERFIL:
Nombre: ${profile.name}
Rol: ${profile.role}
Contexto: ${profile.context}
Reglas: ${profile.rules || 'Ninguna especifica'}
Variables: ${JSON.stringify(profile.variables || [])}

${contextData ? `CONTEXTO ADICIONAL:\n${contextData.content}\n` : ''}

Genera un prompt de sistema optimizado para este perfil. Responde SOLO con JSON en UNA SOLA LINEA:
{"prompt":"[prompt de sistema completo y optimizado]","tokens_estimated":[numero],"optimization_tips":["tip1","tip2"]}`

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      })
    })
    const data = await res.json()
    raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!raw) return NextResponse.json({ error: 'No se pudo generar el prompt' }, { status: 500 })

  const sanitized = sanitizeJson(raw)
  if (!sanitized) return NextResponse.json({ error: 'No se pudo generar el prompt' }, { status: 500 })

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(sanitized)
  } catch (_e) {
    return NextResponse.json({ error: 'No se pudo generar el prompt' }, { status: 500 })
  }

  return NextResponse.json(parsed)
}
