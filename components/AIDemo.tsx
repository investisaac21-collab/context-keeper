'use client';
import { useState, useRef, useEffect } from 'react';

const PRESETS = [
  { label: 'Sin contexto', icon: '◯', color: 'text-zinc-400', hasContext: false },
  { label: 'Con Context Keeper', icon: '◆', color: 'text-violet-400', hasContext: true },
];

const DEMO_QUESTIONS = [
  'Ayúdame a escribir un email a un cliente',
  'Dame ideas para mi próximo post',
  'Revisa este párrafo que escribí',
  'Crea un plan para esta semana',
];

const RESPONSES_WITHOUT = [
  '¡Claro! Para ayudarte mejor, ¿podrías decirme a qué sector pertenece tu cliente? ¿Cuál es el tono que prefieres — formal o informal? ¿Cuál es el objetivo del email?',
  'Claro, ¿de qué trata tu cuenta? ¿Cuál es tu nicho? ¿Qué plataforma usas? ¿Qué tipo de contenido funciona mejor para ti?',
  'Por supuesto. Antes de revisar, ¿para qué audiencia está escrito? ¿Qué tono buscas? ¿Hay algún estilo específico que debería mantener?',
  '¡Perfecto! ¿A qué te dedicas? ¿Cuáles son tus prioridades esta semana? ¿Prefieres un plan por horas o por bloques?',
];

const RESPONSES_WITH = [
  'Perfecto. Sabiendo que eres founder de un SaaS B2B con tono directo y profesional, aquí tienes:\n\n**Asunto:** Propuesta de colaboración — [Tu empresa]\n\n"Hola [nombre], te escribo directamente porque creo que podemos crear algo interesante juntos..."',
  'Basándome en tu perfil como creador de contenido tech en español, aquí van 3 ideas para esta semana:\n\n◆ "El stack que uso en 2025" (alto engagement)\n◆ "Errores que cometí lanzando mi SaaS" (storytelling)\n◆ "Herramientas de IA que nadie menciona" (valor)',
  'Revisado con tu estilo habitual — directo, sin rodeos, orientado a resultados. He ajustado 3 frases para que suenen más a ti y he eliminado el relleno del segundo párrafo.',
  'Aquí tu semana, Isaac. Lunes-martes: desarrollo del feature de pagos. Miércoles: calls con usuarios. Jueves: contenido y marketing. Viernes: revisión + planificación siguiente sprint.',
];

export default function AIDemo() {
  const [activePreset, setActivePreset] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [hasResponded, setHasResponded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runDemo = (presetIdx: number, questionIdx: number) => {
    setActivePreset(presetIdx);
    setActiveQuestion(questionIdx);
    setHasResponded(false);
    setDisplayedResponse('');
    setIsTyping(true);
    
    const response = presetIdx === 0 
      ? RESPONSES_WITHOUT[questionIdx] 
      : RESPONSES_WITH[questionIdx];
    
    const delay = presetIdx === 0 ? 18 : 12;
    let i = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (i < response.length) {
        setDisplayedResponse(response.slice(0, i + 1));
        i++;
      } else {
        clearInterval(intervalRef.current!);
        setIsTyping(false);
        setHasResponded(true);
      }
    }, delay);
  };

  useEffect(() => {
    runDemo(0, 0);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formattedResponse = displayedResponse
    .split('\n')
    .map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return `<span key="${i}">${bold}</span>`;
    })
    .join('<br/>');

  return (
    <section className="py-24 px-4 bg-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4">Pruébalo ahora</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            La diferencia es inmediata.
          </h2>
          <p className="text-zinc-400 text-lg">Elige una pregunta. Ve lo que pasa con y sin contexto.</p>
        </div>

        {/* Toggle sin/con */}
        <div className="flex justify-center gap-3 mb-10">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => runDemo(i, activeQuestion)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activePreset === i
                  ? i === 0
                    ? 'bg-zinc-700 text-white border border-zinc-500'
                    : 'bg-violet-600 text-white border border-violet-400'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <span className={`text-base ${activePreset === i ? p.color : 'text-zinc-600'}`}
                dangerouslySetInnerHTML={{ __html: p.icon === '◯' ? '&#9675;' : '&#9670;' }}
              />
              {p.label}
            </button>
          ))}
        </div>

        {/* Question pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {DEMO_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => runDemo(activePreset, i)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 border ${
                activeQuestion === i
                  ? 'bg-violet-900/50 text-violet-300 border-violet-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header del chat */}
          <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-zinc-500 font-mono">
              {activePreset === 0 ? 'ChatGPT — nuevo chat' : 'ChatGPT + Context Keeper'}
            </span>
            {activePreset === 1 && (
              <span className="ml-auto text-xs text-violet-400 font-medium flex items-center gap-1">
                <span dangerouslySetInnerHTML={{ __html: '&#9670;' }} className="text-violet-400" />
                Contexto activo
              </span>
            )}
          </div>

          <div className="p-6 min-h-[240px]">
            
            {/* Contexto activo badge */}
            {activePreset === 1 && (
              <div className="mb-5 flex items-start gap-3 bg-violet-950/40 border border-violet-800/50 rounded-xl p-4">
                <span className="text-violet-400 text-lg mt-0.5" dangerouslySetInnerHTML={{ __html: '&#9670;' }} />
                <div>
                  <p className="text-violet-300 text-xs font-semibold uppercase tracking-wide mb-1">Contexto cargado</p>
                  <p className="text-zinc-300 text-sm">Eres Isaac, founder de SaaS B2B. Tono directo y profesional. Sin relleno.</p>
                </div>
              </div>
            )}

            {/* Mensaje usuario */}
            <div className="flex justify-end mb-4">
              <div className="bg-zinc-800 text-zinc-100 text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-xs">
                {DEMO_QUESTIONS[activeQuestion]}
              </div>
            </div>

            {/* Respuesta IA */}
            <div className="flex gap-3 items-start">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${
                activePreset === 0 ? 'bg-zinc-700 text-zinc-300' : 'bg-violet-700 text-white'
              }`}>
                {activePreset === 0 ? 'AI' : 'CK'}
              </div>
              <div className="text-sm text-zinc-200 leading-relaxed flex-1">
                {displayedResponse ? (
                  <span dangerouslySetInnerHTML={{ __html: formattedResponse }} />
                ) : (
                  <span className="text-zinc-600">Esperando respuesta...</span>
                )}
                {isTyping && (
                  <span className={`inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse ${
                    activePreset === 0 ? 'bg-zinc-500' : 'bg-violet-400'
                  }`} />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          {hasResponded && activePreset === 0 && (
            <div className="px-6 pb-5">
              <p className="text-xs text-zinc-500 italic">
                Tu IA necesita contexto. Con Context Keeper, ya lo tiene.
              </p>
            </div>
          )}
          {hasResponded && activePreset === 1 && (
            <div className="px-6 pb-5">
              <p className="text-xs text-violet-400/80">
                Respuesta personalizada porque tu IA ya sabe quién eres.
              </p>
            </div>
          )}
        </div>

        {/* CTA bajo el demo */}
        <div className="text-center mt-10">
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-full font-medium transition-all duration-200 text-sm"
          >
            Empieza gratis — sin tarjeta
            <span dangerouslySetInnerHTML={{ __html: '&#8594;' }} />
          </a>
        </div>

      </div>
    </section>
  );
}