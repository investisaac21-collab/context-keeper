import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight text-white">Context Keeper</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Precios</Link>
          <a href="#casos" className="text-sm text-white/50 hover:text-white transition-colors">Casos de uso</a>
          <a href="#keeper-lab" className="text-sm text-white/50 hover:text-white transition-colors">Keeper Lab</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">Iniciar sesión</Link>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors">
            Empieza gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-600/8 blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8 animate-fade-up">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Para usuarios de ChatGPT, Claude y Gemini
        </div>

        {/* Keeper Core — companion visual */}
        <div className="relative mb-10 inline-flex items-center justify-center">
          {/* Orbital rings */}
          <div className="absolute w-40 h-40 rounded-full border border-violet-500/10 animate-spin" style={{animationDuration: '12s'}} />
          <div className="absolute w-32 h-32 rounded-full border border-violet-500/15 animate-spin" style={{animationDuration: '8s', animationDirection: 'reverse'}} />
          <div className="absolute w-48 h-48 rounded-full border border-blue-500/8 animate-spin" style={{animationDuration: '20s'}} />
          {/* Core sphere */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/40 animate-orbit-pulse">
            <div className="w-16 h-16 rounded-full bg-[#09090b]/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-300 to-blue-400 animate-pulse" />
            </div>
          </div>
          {/* Dots on orbit */}
          <div className="absolute w-2 h-2 rounded-full bg-violet-400/60 top-0 left-1/2 -translate-x-1/2 -translate-y-1" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40 bottom-2 right-2" />
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl mb-6 animate-fade-up delay-200">
          Tu IA no recuerda
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">nada.</span>
          <br />
          Context Keeper sí.
        </h1>

        <p className="relative text-lg sm:text-xl text-white/50 max-w-2xl mb-10 leading-relaxed animate-fade-up delay-300">
          Guarda personalidad, instrucciones, variables y contexto.
          Recuéralos en segundos y continúa donde lo dejaste — en cualquier sesión, con cualquier IA.
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 items-center animate-fade-up delay-400">
          <Link href="/login" className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
            Empieza gratis — sin tarjeta
          </Link>
          <Link href="/pricing" className="px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-medium text-base transition-all">
            Ver planes
          </Link>
        </div>

        <p className="relative mt-5 text-sm text-white/25">
          Free: hasta 3 contextos. Pro desde 9 €/mes.
        </p>
      </section>

      {/* PROBLEMA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4 text-center">El problema real</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 leading-tight animate-fade-up delay-100">
            Cada sesión nueva,<br />
            <span className="text-white/40">empiezas desde cero.</span>
          </h2>
          <p className="text-white/40 text-center max-w-xl mx-auto mb-16 text-lg">
            Tu IA es poderosa. Pero no recuerda quién eres, cómo trabajas ni dónde lo dejaste.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '&#128257;', title: 'Repites siempre lo mismo', desc: 'Tu tono, tu estilo, tus reglas, el contexto del proyecto. Una y otra vez, en cada sesión nueva.' },
              { icon: '&#128203;', title: 'Pierdes continuidad', desc: 'La IA no sabe dónde está el trabajo, qué se decidió antes ni cómo se llegó aquí.' },
              { icon: '&#9889;', title: 'Pierdes consistencia', desc: 'Sin un sistema claro, cada respuesta puede sonar diferente. Tu voz no es coherente.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="text-2xl mb-3" dangerouslySetInnerHTML={{__html: item.icon}} />
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUCIÓN — 4 capas */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4 text-center">La solución</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 leading-tight">
            La memoria operativa<br />que tu IA no tiene.
          </h2>
          <p className="text-white/40 text-center max-w-xl mx-auto mb-16 text-lg">
            Context Keeper guarda lo que hace que tu IA responda bien — y te lo devuelve cuando lo necesitas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                num: '01', color: 'from-violet-600 to-violet-800', label: 'Memoria',
                title: 'Guarda lo que importa',
                desc: 'Personalidad, tono, instrucciones, contexto de proyecto, reglas de respuesta. Una sola fuente de verdad para todo lo que tu IA necesita saber.'
              },
              {
                num: '02', color: 'from-blue-600 to-blue-800', label: 'Continuidad',
                title: 'Continúa donde lo dejaste',
                desc: 'Cada contexto es una sesión que puede retomarse. Abre ChatGPT, pega tu contexto y tu IA sabe exactamente dónde está el trabajo.'
              },
              {
                num: '03', color: 'from-indigo-600 to-indigo-800', label: 'Consistencia',
                title: 'Tu voz, siempre igual',
                desc: 'Variables dinámicas, plantillas de tono, instrucciones fijas. Tu IA responde con tu estilo, no con el suyo.'
              },
              {
                num: '04', color: 'from-purple-600 to-purple-800', label: 'Refinamiento',
                title: 'Mejora con el tiempo',
                desc: 'Historial de versiones, rollback, iteración. Tu contexto evoluciona con tu trabajo. Pronto: Keeper Lab te ayuda a refinarlo automáticamente.'
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white/80">{item.num}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{item.label}</span>
                    <h3 className="font-semibold text-white mt-1 mb-2 text-lg">{item.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section id="casos" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4 text-center">Para quién es</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 leading-tight">
            Cada tipo de trabajo,<br />su propia memoria.
          </h2>
          <p className="text-white/40 text-center max-w-xl mx-auto mb-16 text-lg">
            Context Keeper no es solo para prompts sueltos. Es para cualquiera que use IA de forma seria y continua.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '&#128187;', label: 'Programación', title: 'Asistentes por stack', desc: 'Memoria de arquitectura, reglas de código, contexto por proyecto. Tu IA conoce tu codebase.' },
              { icon: '&#9997;&#65039;', label: 'Creatividad', title: 'Voz y estilo consistentes', desc: 'Tono de marca, personajes reutilizables, narrativa continua. Tu IA escribe como tú.' },
              { icon: '&#128218;', label: 'Storytelling', title: 'Continuidad narrativa', desc: 'Lore, personajes, arc argumental. Tu IA no olvida qué pasó en el capítulo anterior.' },
              { icon: '&#127918;', label: 'Videojuegos', title: 'Mundos y personajes vivos', desc: 'Reglas del mundo, dialecto, personalidad de NPCs. Contexto persistente para cada sesión.' },
              { icon: '&#128200;', label: 'Marketing', title: 'Voz de marca guardada', desc: 'Brief de marca, tono de comunicación, instrucciones de canal. Coherencia en cada pieza.' },
              { icon: '&#128101;', label: 'Equipos', title: 'Memoria compartida', desc: 'Contexto común, instrucciones del equipo, tono unificado. Todos usan la IA igual de bien.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="text-2xl mb-3" dangerouslySetInnerHTML={{__html: item.icon}} />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{item.label}</span>
                <h3 className="font-semibold text-white mt-1 mb-1">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4">Cómo funciona</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 leading-tight">Tres pasos.<br />Todo el control.</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Guarda tu contexto', desc: 'Crea un contexto con personalidad, instrucciones, tono y variables. Una vez, bien hecho.' },
              { step: '2', title: 'Organiza por espacio', desc: 'Proyectos, clientes, personajes, stacks. Cada contexto en su lugar, listo para usar.' },
              { step: '3', title: 'Recúperalo en segundos', desc: 'Un clic para copiar. Tu IA recibe el contexto completo y ya sabe cómo trabajar contigo.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-violet-500/20">
                  {item.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEEPER LAB PREVIEW */}
      <section id="keeper-lab" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/50 to-blue-950/30 p-10 sm:p-14 overflow-hidden text-center">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-600/15 blur-[80px] pointer-events-none" />

            {/* Keeper Core en modo lab */}
            <div className="relative inline-flex mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
                <div className="w-10 h-10 rounded-full bg-[#09090b]/70 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-300 to-blue-300" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-400/20 border border-violet-400/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
              </div>
            </div>

            <div className="relative">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-4">
                Próximamente — Pro y Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                Keeper Lab
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed mb-6">
                Tu contexto guardado puede ser mejor. Keeper Lab lo analiza, detecta redundancias, reorganiza la estructura y te devuelve una versión más clara y efectiva — lista para que tu IA responda mejor que nunca.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-white/40">
                {['Refinamiento profundo', 'Detección de redundancias', 'Optimización de estructura', 'Versión mejorada lista para usar'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03]">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* KEEPER PROFILES — vision futura */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4 text-center">Próximamente — Fase 3</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 leading-tight">
            Keeper Profiles.<br />
            <span className="text-white/40">No solo contexto. Identidad.</span>
          </h2>
          <p className="text-white/40 text-center max-w-2xl mx-auto mb-16 text-lg">
            La siguiente capa de Context Keeper. Guarda no solo qué decirle a tu IA, sino quién quieres que sea — su tono, sus reglas, su estilo, su comportamiento. Reutilizable. Consistente. Tuyo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: '&#128187;', label: 'Programación', title: 'Asistente por stack', desc: 'Memoria de arquitectura, reglas de código, contexto técnico persistente por repositorio.' },
              { icon: '&#9997;&#65039;', label: 'Creatividad', title: 'Personajes con voz', desc: 'Tono, lore, forma de hablar. Tu personaje responde igual en cada sesión.' },
              { icon: '&#128200;', label: 'Marcas', title: 'Voz de marca persistente', desc: 'Brief, estilo, palabras clave. Tu asistente de comunicación siempre en caracter.' },
              { icon: '&#128101;', label: 'Equipos', title: 'Perfiles compartidos', desc: 'El mismo asistente, configurado una vez, disponible para todo el equipo.' },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="text-2xl mb-3" dangerouslySetInnerHTML={{__html: item.icon}} />
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{item.label}</span>
                <h3 className="font-semibold text-white mt-1 mb-1 text-sm">{item.title}</h3>
                <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Visual diferenciador: Contexto vs. Perfil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-violet-600/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">Contexto</span>
                <span className="text-xs text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">Ya disponible</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">Instrucciones, prompt base, variables. Lo que le dices a tu IA para que entienda una tarea.</p>
            </div>
            <div className="p-6 rounded-2xl border border-violet-500/30 bg-violet-500/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-violet-600/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-white">Keeper Profile</span>
                <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Próximamente</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">Personalidad, tono, reglas, comportamiento. Quién es tu IA para este proyecto — de forma persistente y reutilizable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-violet-400 uppercase mb-4">Precios</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple y directo.</h2>
          <p className="text-white/40 text-lg mb-12">Empieza gratis. Escala cuando necesites más.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { name: 'Free', price: '0', period: '/mes', desc: 'Empieza aquí', features: ['3 contextos', 'Variables dinámicas', 'Importar / exportar JSON'], cta: 'Empezar gratis', primary: false },
              { name: 'Pro', price: '9', period: '/mes', desc: 'Tu memoria completa', features: ['Contextos ilimitados', 'Historial de versiones', 'Generación con IA', 'Acceso anticipado a Keeper Lab'], cta: 'Hazte Pro', primary: true },
              { name: 'Team', price: '20', period: '/mes', desc: 'Memoria compartida', features: ['Todo lo de Pro', 'Hasta 5 miembros', 'Contextos del equipo', 'Panel de administrador'], cta: 'Empezar con Team', primary: false },
            ].map((plan, i) => (
              <div key={i} className={`relative p-6 rounded-2xl border transition-colors ${plan.primary ? 'border-violet-500/50 bg-violet-600/10' : 'border-white/5 bg-white/[0.02]'}`}>
                {plan.primary && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-600 text-white">
                    Más popular
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold text-white text-lg">{plan.name}</p>
                  <p className="text-white/30 text-sm mb-3">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-4xl font-bold text-white">{plan.price} €</span>
                    <span className="text-white/30 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/50">
                        <svg className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={i === 0 ? '/login' : '/pricing'} className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all ${plan.primary ? 'bg-violet-600 hover:bg-violet-500 text-white' : 'border border-white/10 hover:border-white/20 text-white/60 hover:text-white'}`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-sm">Sin tarjeta de crédito para empezar. Cancela cuando quieras.</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          {/* Keeper Core final */}
          <div className="inline-flex mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <div className="w-13 h-13 rounded-full bg-[#09090b]/60 flex items-center justify-center">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-300 to-blue-300 animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Haz que tu IA no<br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">empiece de cero.</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Guarda tu contexto una vez. Recúperalo siempre. Continúa donde lo dejaste en cualquier sesión con cualquier IA.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50">
            Empieza gratis — sin tarjeta
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="mt-4 text-white/20 text-sm">Free para siempre. Pro desde 9 €/mes.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-white/60">Context Keeper</span>
          </div>
          <p className="text-white/20 text-xs">La memoria operativa de tu IA. © 2025 Context Keeper.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-white/30 hover:text-white/60 text-xs transition-colors">Precios</Link>
            <Link href="/login" className="text-white/30 hover:text-white/60 text-xs transition-colors">Acceder</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
