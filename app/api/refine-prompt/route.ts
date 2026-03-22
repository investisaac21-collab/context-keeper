import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const { currentPrompt, instruction } = await req.json()
    if (!currentPrompt?.trim() || !instruction?.trim()) return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 })
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 500 })
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({ model:'llama-3.1-8b-instant', messages:[{role:'system',content:'Eres un experto en ingenieria de prompts. Refina y mejora prompts segun las instrucciones del usuario. Manten las variables dinamicas {{nombre}} exactamente igual. Preserva el idioma original. Solo devuelve el prompt refinado, sin explicaciones ni comentarios. No anadas markdown.'},{role:'user',content:`PROMPT ACTUAL: ${currentPrompt}\nINSTRUCCION DE REFINAMIENTO: ${instruction}\nDevuelve el prompt refinado:`}], max_tokens:1024, temperature:0.7 })
    })
    if (!response.ok) { const err=await response.text(); return NextResponse.json({error:'Error de Groq: '+err},{status:500}) }
    const data = await response.json()
    const refined = data.choices?.[0]?.message?.content?.trim()
    if (!refined) return NextResponse.json({ error: 'Respuesta vacia de Groq' }, { status: 500 })
    return NextResponse.json({ refined })
  } catch (err) { return NextResponse.json({ error: 'Error interno: '+String(err) }, { status: 500 }) }
}
