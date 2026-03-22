import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const { description, language } = await req.json()
    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: 'Descripcion demasiado corta' }, { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })

    const langNames: Record<string, string> = { es: 'espanol', en: 'English', fr: 'francais', de: 'Deutsch', pt: 'portugues', it: 'italiano', zh: 'chino', ja: 'japones' }
    const targetLang = langNames[language || 'es'] || 'espanol'

    const prompt = `Eres un experto en diseno de prompts para modelos de IA (ChatGPT, Claude, Gemini).
Genera un prompt profesional, claro y reutilizable basandote en la descripcion del usuario.
Reglas:
- Escribe el prompt en ${targetLang}
- Usa variables dinamicas con doble llave para partes personalizables: {{nombre_variable}}
- El prompt debe ser directo, estructurado y listo para copiar y usar
- Incluye contexto, objetivo y formato esperado cuando sea relevante
- NO incluyas explicaciones ni meta-comentarios, solo el prompt final
- NO uses markdown, solo texto plano
Genera SOLO el prompt, sin introduccion ni cierre.
Descripcion: ${description.trim()}`

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 800 } })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error Gemini' }, { status: 500 })

    const generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!generatedPrompt) return NextResponse.json({ error: 'Respuesta vacia de IA' }, { status: 500 })

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error('generate-prompt error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
