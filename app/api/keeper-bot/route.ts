import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'Gemini no configurado' }, { status: 500 })

    const { message, history = [], contexts = [], profiles = [] } = await req.json()
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

    // Build context summary for the bot
    const ctxSummary = contexts.length > 0
      ? 'Contextos guardados del usuario:\n' + contexts.map((c: any) =>
          `- "${c.name}" [${c.tag || c.category || 'sin categoria'}]: ${(c.context || '').substring(0, 200)}`
        ).join('\n')
      : 'El usuario no tiene contextos guardados aun.'

    const profileSummary = profiles.length > 0
      ? '\n\nPerfiles Keeper del usuario:\n' + profiles.map((p: any) =>
          `- "${p.name}" (rol: ${p.role || '-'}, tono: ${p.tone || '-'})`
        ).join('\n')
      : ''

    const systemPrompt = `Eres Keeper Bot, el asistente personal inteligente dentro de la app Keeper.

Keeper es una herramienta para guardar contextos, instrucciones y perfiles de IA que el usuario usa con ChatGPT, Claude y Gemini.

Tus capacidades:
- Conoces todos los contextos y perfiles guardados del usuario
- Puedes sugerir que contexto usar para cada tarea
- Puedes explicar, mejorar o crear nuevos contextos
- Ayudas a organizar y aprovechar mejor la memoria del usuario
- Respondes siempre en espanol, de forma directa y util
- Eres conciso: maximo 3-4 frases por respuesta salvo que el usuario pida mas detalle

Datos actuales del usuario:
${ctxSummary}${profileSummary}

Cuando el usuario pregunte por un contexto especifico, citalo por nombre.
Si no tiene contextos relevantes, sugiere que cree uno.`

    // Build Gemini multi-turn contents
    const contents: any[] = []
    for (const m of history) {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })
    }
    contents.push({ role: 'user', parts: [{ text: message }] })

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
      })
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error Gemini' }, { status: 500 })

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta'
    return NextResponse.json({ reply })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}