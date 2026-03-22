import { NextRequest, NextResponse } from 'next/server'
export async function POST(req: NextRequest) {
  try {
    const { description, language } = await req.json()
    if (!description || description.trim().length < 5) return NextResponse.json({ error: 'Descripcion demasiado corta' }, { status: 400 })
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    const langNames: Record<string,string> = { es:'espanol',en:'English',fr:'francais',de:'Deutsch',pt:'portugues',it:'italiano',zh:'chino',ja:'japones' }
    const targetLang = langNames[language||'es']||'espanol'
    const systemPrompt = `Eres un experto en diseno de prompts para modelos de IA (ChatGPT, Claude, Gemini). Genera un prompt profesional, claro y reutilizable. Escribe en ${targetLang}. Usa variables dinamicas con doble llave: {{nombre_variable}}. NO incluyas explicaciones, solo el prompt final. NO uses markdown.`
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST', headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
      body:JSON.stringify({ model:'llama-3.1-8b-instant', messages:[{role:'system',content:systemPrompt},{role:'user',content:description.trim()}], max_tokens:800, temperature:0.7 })
    })
    if (!response.ok) { const err=await response.text(); return NextResponse.json({error:'Error al llamar a Groq'},{status:500}) }
    const data = await response.json()
    const generatedPrompt = data.choices?.[0]?.message?.content?.trim()
    if (!generatedPrompt) return NextResponse.json({ error: 'Respuesta vacia de la IA' }, { status: 500 })
    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) { return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 }) }
}
