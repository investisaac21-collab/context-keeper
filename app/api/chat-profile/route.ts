import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    const { message, systemPrompt, history = [] } = await req.json()
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    const groqKey = process.env.GROQ_API_KEY
    if (!groqKey) return NextResponse.json({ error: 'GROQ no configurado' }, { status: 500 })
    const messages = [{ role: 'system', content: systemPrompt || 'Eres un asistente de IA. Responde siempre en el idioma del usuario.' }, ...history.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })), { role: 'user', content: message }]
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', headers:{Authorization:'Bearer '+groqKey,'Content-Type':'application/json'},
      body:JSON.stringify({ model:'llama-3.3-70b-versatile', messages, max_tokens:800, temperature:0.7 })
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message||'Error de GROQ' }, { status: 500 })
    const reply = data.choices?.[0]?.message?.content || 'Sin respuesta'
    return NextResponse.json({ reply })
  } catch (err) { return NextResponse.json({ error: err instanceof Error?err.message:'Error desconocido' }, { status: 500 }) }
}
