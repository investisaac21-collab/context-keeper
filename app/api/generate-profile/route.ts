import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json()

    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: 'Descripción demasiado corta' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const systemPrompt = `Eres un experto en diseño de personajes y asistentes de IA para uso profesional.
Tu tarea es generar los campos de un perfil de asistente IA basándote en la descripción del usuario.
Keeper es una plataforma profesional. Solo generas perfiles con propósito laboral, creativo o educativo.
Si la descripción solicita contenido sexual, violento, ilegal o inapropiado, responde EXACTAMENTE con este JSON:
{"error": "Este tipo de perfil no está disponible en Keeper"}

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin saltos de línea reales dentro de los strings, usa \\n para separar reglas):
{
  "name": "Nombre corto y memorable",
  "role": "Descripción del rol y expertise en 1-2 frases",
  "tone": "Tono y estilo de comunicación",
  "rules": "Regla 1\\nRegla 2\\nRegla 3",
  "extra": "Contexto adicional relevante"
}

IMPORTANTE: El JSON debe ser estrictamente válido. NO incluyas saltos de línea reales dentro de los valores de los campos. Usa \\n como separador de reglas.
Responde SOLO con el JSON, sin texto adicional ni markdown.`

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
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Error de GROQ' }, { status: 500 })
    }

    const text = data.choices?.[0]?.message?.content || ''
    
    // Extract JSON block from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Describe un perfil profesional o creativo para continuar' }, { status: 400 })
    }

    // Sanitize: fix unescaped control characters inside JSON string values
    // Replace literal newlines/tabs inside JSON string values with escaped versions
    let rawJson = jsonMatch[0]
    // Replace literal newlines that appear inside JSON strings (not between keys)
    rawJson = rawJson.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
      return match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
    })

    let profile: any
    try {
      profile = JSON.parse(rawJson)
    } catch (parseErr) {
      // Last resort: try to extract fields manually
      const nameMatch = text.match(/"name"\s*:\s*"([^"]+)"/)
      const roleMatch = text.match(/"role"\s*:\s*"([^"\n]+)"/)
      const toneMatch = text.match(/"tone"\s*:\s*"([^"\n]+)"/)
      if (nameMatch && roleMatch) {
        profile = {
          name: nameMatch[1],
          role: roleMatch[1],
          tone: toneMatch ? toneMatch[1] : '',
          rules: '',
          extra: ''
        }
      } else {
        return NextResponse.json({ error: 'No se pudo generar el perfil. Intenta con una descripción más clara.' }, { status: 400 })
      }
    }
    
    // Check if model returned an error (inappropriate content)
    if (profile.error) {
      return NextResponse.json({ error: profile.error }, { status: 400 })
    }
    
    return NextResponse.json({ profile })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
