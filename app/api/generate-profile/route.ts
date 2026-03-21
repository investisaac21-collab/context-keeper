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

    const systemPrompt = `Eres un experto en diseño de personajes y asistentes de IA.
Tu tarea es generar los campos de un perfil de asistente IA basándote en la descripción del usuario.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "name": "Nombre del personaje (corto, memorable)",
  "role": "Descripción del rol y expertise (1-2 frases)",
  "tone": "Tono y estilo de comunicación",
  "rules": "Regla 1\nRegla 2\nRegla 3",
  "extra": "Contexto adicional relevante"
}

Reglas:
- El nombre debe ser creativo y representativo del personaje
- El rol debe ser específico y profesional
- El tono debe describir cómo habla/escribe
- Las reglas son instrucciones de comportamiento (máximo 4, separadas por salto de línea)
- El extra es contexto de empresa, audiencia o proyecto
- Responde SOLO con el JSON, sin texto adicional`

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
        temperature: 0.8,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Error de GROQ' }, { status: 500 })
    }

    const text = data.choices?.[0]?.message?.content || ''
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No se pudo generar el perfil' }, { status: 500 })
    }
    
    const profile = JSON.parse(jsonMatch[0])
    return NextResponse.json({ profile })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
