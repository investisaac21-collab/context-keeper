import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { description, language } = await req.json()

    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: 'Descripción demasiado corta' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const langName: Record<string, string> = {
      es: 'español',
      en: 'English',
      fr: 'français',
      de: 'Deutsch',
      pt: 'português',
      it: 'italiano',
      zh: 'chino',
      ja: 'japonés',
    }
    const targetLang = langName[language || 'es'] || 'español'

    const systemPrompt = `Eres un experto en diseño de prompts para modelos de IA (ChatGPT, Claude, Gemini).

Tu tarea es generar un prompt profesional, claro y reutilizable basándote en la descripción del usuario.

Reglas obligatorias:
- Escribe el prompt en ${targetLang}
- Usa variables dinámicas con doble llave para partes personalizables: {{nombre_variable}}
- El prompt debe ser directo, estructurado y listo para copiar y usar
- Incluye contexto, objetivo y formato esperado cuando sea relevante
- NO incluyas explicaciones ni meta-comentarios, solo el prompt final
- NO uses markdown, solo texto plano
- Variables sugeridas: {{tema}}, {{tono}}, {{público_objetivo}}, {{formato}}, {{idioma}}, etc.

Genera SOLO el prompt, sin introducción ni cierre.`

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
          { role: 'user', content: description.trim() },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq error:', err)
      return NextResponse.json({ error: 'Error al llamar a Groq' }, { status: 500 })
    }

    const data = await response.json()
    const generatedPrompt = data.choices?.[0]?.message?.content?.trim()

    if (!generatedPrompt) {
      return NextResponse.json({ error: 'Respuesta vacía de la IA' }, { status: 500 })
    }

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error('Generate prompt error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
