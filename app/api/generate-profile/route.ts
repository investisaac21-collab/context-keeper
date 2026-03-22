import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

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

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json()
    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: 'Descripcion demasiado corta' }, { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })

    const prompt = `Eres un experto en diseno de personajes y asistentes de IA para uso profesional.
Genera los campos de un perfil de asistente IA basandote en la descripcion del usuario.
Keeper es una plataforma profesional. Solo generas perfiles con proposito laboral, creativo o educativo.
Si la descripcion solicita contenido sexual, violento, ilegal o inapropiado, responde SOLO con: {"error":"Este tipo de perfil no esta disponible en Keeper"}
Responde SOLO con un objeto JSON valido en una sola linea:
{"name":"Nombre corto","role":"Rol y expertise en 1-2 frases","tone":"Tono y estilo","rules":"Regla 1\\nRegla 2\\nRegla 3","extra":"Contexto adicional"}
CRITICO: JSON en UNA SOLA LINEA. USA \\n para separar reglas. Sin markdown. Solo el JSON.
Descripcion del usuario: ${description.trim()}`

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 500 } })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error Gemini' }, { status: 500 })

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const rawJson = sanitizeJson(raw)
    if (!rawJson) return NextResponse.json({ error: 'Describe un perfil profesional o creativo para continuar' }, { status: 400 })

    let profile: Record<string, unknown>
    try {
      profile = JSON.parse(rawJson)
    } catch (_e) {
      const nm = raw.match(/"name"\s*:\s*"([^"\n\r]+)"/)
      const rl = raw.match(/"role"\s*:\s*"([^"\n\r]+)"/)
      const tn = raw.match(/"tone"\s*:\s*"([^"\n\r]+)"/)
      if (nm) { profile = { name: nm[1], role: rl?.[1] || '', tone: tn?.[1] || '', rules: '', extra: '' } }
      else return NextResponse.json({ error: 'No se pudo generar el perfil. Intenta con una descripcion mas clara.' }, { status: 400 })
    }
    if (profile.error) return NextResponse.json({ error: profile.error }, { status: 400 })
    return NextResponse.json({ profile })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error desconocido' }, { status: 500 })
  }
}
