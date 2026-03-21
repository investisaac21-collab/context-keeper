import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) return NextResponse.json({ error: 'GROQ no configurado' }, { status: 500 })

    const { message, history = [], contexts = [], profiles = [] } = await req.json()
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

    // Build context summary for the bot
    const ctxSummary = contexts.length > 0
      ? 'Contextos guardados del usuario:\n' + contexts.map((c: any) =>
          `- "${c.name}" [${c.tag || c.category || 'sin categoría'}]: ${(c.context || '').substring(0, 200)}`
        ).join('\n')
      : 'El usuario no tiene contextos guardados aún.'

    const profileSummary = profiles.length > 0
      ? '\n\nPerfiles Keeper del usuario:\n' + profiles.map((p: any) =>
          `- "${p.name}" (rol: ${p.role || '-'}, tono: ${p.tone || '-'})`
        ).join('\n')
      : ''

    const systemPrompt = `Eres Keeper Bot, el asistente personal inteligente dentro de la app Keeper.

Keeper es una herramienta para guardar contextos, instrucciones y perfiles de IA que el usuario usa con ChatGPT, Claude y Gemini.

Tus capacidades:
- Conoces todos los contextos y perfiles guardados del usuario
- Puedes sugerir qué contexto usar para cada tarea
- Puedes explicar, mejorar o crear nuevos contextos
- Ayudas a organizar y aprovechar mejor la memoria del usuario
- Respondes siempre en español, de forma directa y útil
- Eres conciso: máximo 3-4 frases por respuesta salvo que el usuario pida más detalle

Datos actuales del usuario:
${ctxSummary}${profileSummary}

Cuando el usuario pregunte por un contexto específico, cítalo por nombre.
Si no tiene contextos relevantes, sugiere que cree uno.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ]

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + groqKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Error GROQ' }, { status: 500 })

    const reply = data.choices?.[0]?.message?.content || 'Sin respuesta'
    return NextResponse.json({ reply })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
