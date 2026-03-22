import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json()

    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: 'Descripcion demasiado corta' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const systemPrompt = `Eres un experto en diseno de personajes y asistentes de IA para uso profesional.
Tu tarea es generar los campos de un perfil de asistente IA basandote en la descripcion del usuario.
Keeper es una plataforma profesional. Solo generas perfiles con proposito laboral, creativo o educativo.
Si la descripcion solicita contenido sexual, violento, ilegal o inapropiado, responde SOLO con: {"error":"Este tipo de perfil no esta disponible en Keeper"}

Responde SOLO con un objeto JSON valido en una sola linea, sin saltos de linea reales dentro de los valores:
{"name":"Nombre corto","role":"Rol y expertise en 1-2 frases","tone":"Tono y estilo","rules":"Regla 1\\nRegla 2\\nRegla 3","extra":"Contexto adicional"}

CRITICO: El JSON debe estar en UNA SOLA LINEA. NO uses saltos de linea reales dentro de strings. Usa \\n para separar reglas.
Responde UNICAMENTE con el JSON, sin markdown, sin backticks, sin texto adicional.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description.trim() },
        ],
        max_tokens: 400,
        temperature: 0.6,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Error de GROQ' }, { status: 500 })
    }

    const raw = data.choices?.[0]?.message?.content || ''

    // Layer 1: strip markdown fences
    let text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim()

    // Layer 2: find the JSON object boundaries
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: 'Describe un perfil profesional o creativo para continuar' }, { status: 400 })
    }
    let rawJson = text.slice(jsonStart, jsonEnd + 1)

    // Layer 3 (pre-sanitize): replace bare real newlines with space before regex parsing
    // This fixes: "Bad control character in string literal in JSON"
    rawJson = rawJson.replace(/(?<!\\)\n/g, ' ').replace(/(?<!\\)\r/g, ' ')

    // Layer 4: sanitize control characters inside JSON string values
    rawJson = rawJson.replace(/"((?:[^"\\\r\n]|\\.)*)"/g, (_match: string, inner: string) => {
      const sanitized = inner
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      return '"' + sanitized + '"'
    })

    // Layer 5: strip remaining control chars U+0000-U+001F
    rawJson = rawJson.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')

    let profile: Record<string, unknown>
    try {
      profile = JSON.parse(rawJson)
    } catch (_e) {
      // Last resort: manual field extraction
      const nm = raw.match(/"name"\s*:\s*"([^"\n\r]+)"/)
      const rl = raw.match(/"role"\s*:\s*"([^"\n\r]+)"/)
      const tn = raw.match(/"tone"\s*:\s*"([^"\n\r]+)"/)
      if (nm) {
        profile = {
          name: nm[1],
          role: rl ? rl[1] : '',
          tone: tn ? tn[1] : '',
          rules: '',
          extra: ''
        }
      } else {
        return NextResponse.json({ error: 'No se pudo generar el perfil. Intenta con una descripcion mas clara.' }, { status: 400 })
      }
    }

    if (profile.error) {
      return NextResponse.json({ error: profile.error }, { status: 400 })
    }

    return NextResponse.json({ profile })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
