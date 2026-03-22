import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { profileId, message, history } = await request.json()
  if (!profileId || !message) return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })

  const { data: profile } = await supabase
    .from('keeper_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', session.user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })

  const systemPrompt = `Eres ${profile.name}. Tu rol es: ${profile.role}.

${profile.context}

${profile.rules ? `REGLAS DE COMPORTAMIENTO:\n${profile.rules}\n` : ''}
${profile.variables?.length > 0 ? `VARIABLES DISPONIBLES:\n${profile.variables.map((v: {name: string, example: string}) => `- ${v.name}: ${v.example}`).join('\n')}` : ''}

Mantente siempre en el personaje. Responde de manera natural y coherente con tu rol.`

  const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  chatHistory.push({ role: 'user', parts: [{ text: message }] })

  let responseText = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: chatHistory,
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
      })
    })
    const data = await res.json()
    responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch (_e) {
    return NextResponse.json({ error: 'Error de conexion con Gemini' }, { status: 500 })
  }

  if (!responseText) return NextResponse.json({ error: 'No se pudo generar respuesta' }, { status: 500 })

  return NextResponse.json({ response: responseText })
}
