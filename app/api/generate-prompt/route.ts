import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { description, language } = await req.json()

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Descripción requerida' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 })
    }

    const lang = language || 'español'

    const systemPrompt = `Eres un experto en crear prompts de IA profesionales y efectivos.
Tu tarea es generar un prompt claro, estructurado y listo para usar en ChatGPT, Claude u otras IAs.

REGLAS:
- Usa variables dinámicas en formato {{nombre_variable}} para partes que el usuario querrá personalizar
- El prompt debe estar en: ${lang}
- Sé concreto y accionable, no vago
- Incluye contexto, tarea y formato de salida esperado
- Máximo 300 palabras
- Devuelve SOLO el prompt, sin explicaciones ni texto extraño`

    const userPrompt = `Crea un prompt profesional para: ${description}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq error:', err)
      return NextResponse.json({ error: 'Error al llamar a la IA' }, { status: 500 })
    }

    const data = await response.json()
    const generated = data.choices?.[0]?.message?.content?.trim()

    if (!generated) {
      return NextResponse.json({ error: 'La IA no generó contenido' }, { status: 500 })
    }

    return NextResponse.json({ prompt: generated })

  } catch (error) {
    console.error('generate-prompt error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
