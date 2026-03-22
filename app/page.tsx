'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in-view') }) },
      { threshold: 0.08 }
    )
    document.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen text-white" style={{background:'#080808'}}>

      {/* NAVBAR */}
      <nav style={{background:'rgba(8,8,8,0.85)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent)'}} />
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <div style={{position:'absolute',inset:0,borderRadius:'10px',background:'rgba(139,92,246,0.25)',filter:'blur(6px)'}} />
            <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 0 12px rgba(124,58,237,0.4)'}} className="relative w-7 h-7 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
          </div>
          <span className="font-semibold text-sm text-white tracking-tight">Keeper</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/pricing" className="text-sm transition-colors" style={{color:'rgba(255,255,255,0.45)'}} onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>Precios</Link>
          <a href="#gaming" className="text-sm transition-colors" style={{color:'rgba(255,255,255,0.45)'}} onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>Gaming</a>
          <a href="#sistema" className="text-sm transition-colors" style={{color:'rgba(255,255,255,0.45)'}} onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>El sistema</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm transition-colors hidden sm:block" style={{color:'rgba(255,255,255,0.45)'}} onMouseEnter={e=>e.currentTarget.style.color='white'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>Iniciar sesi&#xF3;n</Link>
          <Link href="/login" style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 16px rgba(124,58,237,0.3)'}} className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90">
            Empieza gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20 overflow-hidden">
        {/* Background layers */}
        <div style={{position:'absolute',top:'-10%',left:'50%',transform:'translateX(-50%)',width:'800px',height:'600px',background:'radial-gradient(ellipse at center top,rgba(109,40,217,0.14) 0%,transparent 65%)',pointerEvents:'none'}} />
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',backgroundSize:'28px 28px',maskImage:'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',pointerEvents:'none'}} />
        {/* Badge */}
        <div style={{border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.08)'}} className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 animate-fade-up" style={{border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.08)',color:'rgba(196,181,253,1)'}}>
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Profiles &#xB7; Lab &#xB7; Forge &#xB7; Export &#xB7; Sandbox
        </div>
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.04] tracking-tight mb-6 animate-fade-up delay-100">
          Tu IA.<br />
          <span style={{background:'linear-gradient(135deg,#c4b5fd 0%,#a78bfa 40%,#7c3aed 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
            Con identidad real.
          </span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200" style={{color:'rgba(255,255,255,0.4)'}}>
          Crea perfiles de IA con memoria profunda, analiza su coherencia, simula escenarios y exporta a cualquier modelo. Todo en un sistema.
        </p>
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-up delay-300">
          <Link href="/login" style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 24px rgba(124,58,237,0.35)',border:'1px solid rgba(139,92,246,0.3)'}} className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90">
            Crear mi primer perfil
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </Link>
          <Link href="/pricing" style={{border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.55)'}} className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-medium transition-colors hover:text-white hover:border-white/20">
            Ver planes &#x2192;
          </Link>
        </div>
        {/* Flow chips */}
        <div className="flex flex-wrap justify-center gap-2 animate-fade-up delay-400">
          {[['Profiles','rgba(139,92,246,0.15)','rgba(139,92,246,0.4)','#c4b5fd'],['Lab','rgba(59,130,246,0.12)','rgba(59,130,246,0.35)','#93c5fd'],['Forge','rgba(245,158,11,0.12)','rgba(245,158,11,0.35)','#fcd34d'],['Export','rgba(148,163,184,0.08)','rgba(148,163,184,0.25)','#cbd5e1'],['Sandbox','rgba(16,185,129,0.12)','rgba(16,185,129,0.35)','#6ee7b7']].map(([label,bg,border,color])=>(
            <span key={label} style={{background:bg,border:'1px solid '+border,color:color}} className="px-3 py-1.5 rounded-full text-xs font-semibold">{label}</span>
          ))}
        </div>
        {/* Stats */}
        <div className="flex gap-5 mt-14 animate-fade-up delay-500 flex-wrap justify-center">
          {([['7','Tipos de perfil','rgba(139,92,246,0.12)','rgba(139,92,246,0.3)','#c4b5fd'],['9','Formatos de export','rgba(59,130,246,0.1)','rgba(59,130,246,0.25)','#93c5fd'],['3','Modos Forge','rgba(251,191,36,0.1)','rgba(251,191,36,0.25)','#fde68a']] as [string,string,string,string,string][]).map(([n,label,bg,border,color])=>(
            <div key={n} style={{background:bg,border:'1px solid '+border,borderRadius:12,padding:'12px 20px',textAlign:'center',minWidth:100}}>
              <p style={{fontSize:28,fontWeight:800,color:color,lineHeight:1.1}}>{n}</p>
              <p style={{fontSize:11,color:'rgba(255,255,255,0.45)',marginTop:4,fontWeight:500}}>{label}</p>
            </div>
          ))}
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" style={{color:'rgba(255,255,255,0.2)'}}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </section>

      <section id="gaming" className="py-24 px-6 fade-section" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div style={{background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 12px',borderRadius:'999px'}} className="mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                <span style={{color:'#c4b5fd'}} className="text-xs font-bold">Para game writers y worldbuilders</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                NPCs con memoria.<br />
                <span style={{color:'rgba(255,255,255,0.45)'}}>Personajes que no olvidan qui&#xE9;nes son.</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{color:'rgba(255,255,255,0.45)'}}>
                Crea personajes con lore profundo, secretos, motivaciones y relaciones. Simula c&#xF3;mo responden en cualquier escenario. Exporta como NPC Sheet o Character Sheet listo para usar.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  ['base_memory','Historia, traumas, secretos y motivaciones del personaje'],
                  ['relationships','Relaciones din&#xE1;micas con otros personajes o facciones'],
                  ['Forge','Simula primer encuentro, traici&#xF3;n, interrogatorio o crisis'],
                  ['NPC Sheet','Exporta la ficha completa para tu juego o mod'],
                ].map(([tag,desc])=>(
                  <div key={tag} className="flex items-start gap-3">
                    <span style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)',color:'#a78bfa',fontFamily:'monospace'}} className="text-xs px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">{tag}</span>
                    <span style={{color:'rgba(255,255,255,0.5)'}} className="text-sm" dangerouslySetInnerHTML={{__html:desc}} />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.35)',color:'#c4b5fd'}} className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90">Crear NPC ahora</Link>
                <span style={{color:'rgba(255,255,255,0.3)'}} className="text-xs self-center">Game writers &#xB7; Devs indie &#xB7; Modders &#xB7; Worldbuilders</span>
              </div>
            </div>
            {/* NPC Card mockup */}
            <div className="relative">
              <div style={{background:'rgba(14,14,18,0.95)',border:'1px solid rgba(139,92,246,0.25)',boxShadow:'0 0 60px rgba(109,40,217,0.1)'}} className="rounded-2xl overflow-hidden">
                <div style={{background:'rgba(139,92,246,0.06)',borderBottom:'1px solid rgba(63,63,70,0.5)'}} className="px-5 py-4 flex items-center gap-3">
                  <div style={{background:'linear-gradient(135deg,#4c1d95,#6d28d9)',boxShadow:'0 0 16px rgba(109,40,217,0.4)'}} className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold">V</div>
                  <div>
                    <p className="text-white font-bold text-sm">Valdris el Archimago</p>
                    <div style={{background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)'}} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md mt-0.5">
                      <span style={{color:'#a78bfa'}} className="text-xs font-bold">NPC</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div>
                    <p style={{color:'rgba(255,255,255,0.3)'}} className="text-xs font-semibold mb-1">ROL</p>
                    <p style={{color:'rgba(255,255,255,0.7)'}} className="text-xs">Archimago ca&#xED;do que guarda el secreto de la Grieta Oscura</p>
                  </div>
                  <div>
                    <p style={{color:'rgba(255,255,255,0.3)'}} className="text-xs font-semibold mb-1">BASE MEMORY</p>
                    <p style={{color:'rgba(255,255,255,0.55)'}} className="text-xs leading-relaxed">Traicion&#xF3; a su orden hace 300 a&#xF1;os. Vive con culpa. Solo el jugador elegido puede saber la verdad.</p>
                  </div>
                  <div>
                    <p style={{color:'rgba(255,255,255,0.3)'}} className="text-xs font-semibold mb-1">FORGE a?? ESCENARIO</p>
                    <div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'10px',padding:'10px'}}>
                      <p style={{color:'rgba(245,158,11,0.9)'}} className="text-xs font-bold mb-1">El jugador pregunta sobre la Grieta</p>
                      <p style={{color:'rgba(255,255,255,0.5)'}} className="text-xs">Veredicto: <span style={{color:'#34d399',fontWeight:'bold'}}>S&#xD3;LIDO</span> &#xB7; Score: 91</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sistema" className="py-24 px-6 fade-section" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest mb-3 uppercase" style={{color:'rgba(139,92,246,0.8)'}}>El sistema completo</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Un flujo. Cinco herramientas.<br />
              <span style={{color:'rgba(255,255,255,0.45)'}}>Cada una especializada.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {name:'Profiles',stat:'7 tipos',icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',desc:'Define la identidad, lore, voz y reglas.',color:'#a78bfa',bg:'rgba(139,92,246,0.08)',border:'rgba(139,92,246,0.2)',num:'01'},
              {name:'Lab',stat:'Score 4D',icon:'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',desc:'Analiza coherencia: Claridad, Consistencia, Completitud, Efectividad.',color:'#93c5fd',bg:'rgba(59,130,246,0.08)',border:'rgba(59,130,246,0.2)',num:'02'},
              {name:'Forge',stat:'3 modos',icon:'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',desc:'Simula escenarios reales, stress tests y validaciones libres.',color:'#fcd34d',bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.2)',num:'03'},
              {name:'Export',stat:'9 formatos',icon:'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',desc:'System Prompt, JSON, YAML, NPC Sheet, Brand Brief y mas.',color:'#cbd5e1',bg:'rgba(148,163,184,0.06)',border:'rgba(148,163,184,0.15)',num:'04'},
              {name:'Sandbox',icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',desc:'Chatea con tu perfil en modo libre o ejecuta prompts de prueba.',color:'#6ee7b7',bg:'rgba(16,185,129,0.08)',border:'rgba(16,185,129,0.2)',num:'05'},
            ].map((m)=>(
              <div key={m.name} style={{background:m.bg,border:'1px solid '+m.border,transition:'transform 0.2s'}} className="rounded-2xl p-5 flex flex-col hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div style={{background:m.border,borderRadius:'10px',padding:'7px'}}>
                    <svg width="16" height="16" fill="none" stroke={m.color} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={m.icon}/></svg>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>{m.stat&&<span style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:20,letterSpacing:'0.04em'}}>{m.stat}</span>}<span style={{color:'rgba(255,255,255,0.15)'}} className="text-xs font-mono">{m.num}</span></div>
                </div>
                <p style={{color:m.color}} className="font-bold text-sm mb-2">{m.name}</p>
                <p style={{color:'rgba(255,255,255,0.4)'}} className="text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          {/* Flow arrow */}
          <div className="flex items-center justify-center gap-2 mt-8" style={{color:'rgba(255,255,255,0.2)'}}>
            <span className="text-xs">Crea</span>
            <span>&#x2192;</span>
            <span className="text-xs">Analiza</span>
            <span>&#x2192;</span>
            <span className="text-xs">Simula</span>
            <span>&#x2192;</span>
            <span className="text-xs">Exporta</span>
            <span>&#x2192;</span>
            <span className="text-xs">Chatea</span>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 fade-section" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Cards mockup */}
            <div className="space-y-3">
              {[
                {name:'Brand Voice a?? Keeper',type:'Marca',color:'#fcd34d',bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.2)',score:88},
                {name:'Support Agent Pro',type:'Asistente',color:'#a78bfa',bg:'rgba(139,92,246,0.08)',border:'rgba(139,92,246,0.2)',score:94},
                {name:'Dev Lead AI',type:'T&#xE9;cnico',color:'#93c5fd',bg:'rgba(59,130,246,0.08)',border:'rgba(59,130,246,0.2)',score:79},
              ].map((p)=>(
                <div key={p.name} style={{background:p.bg,border:'1px solid '+p.border}} className="rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{background:p.border,width:'36px',height:'36px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{color:p.color,fontWeight:'bold',fontSize:'14px'}} dangerouslySetInnerHTML={{__html:p.name[0]}} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm" dangerouslySetInnerHTML={{__html:p.name}} />
                      <span style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.4)',fontSize:'10px',padding:'1px 6px',borderRadius:'4px'}} dangerouslySetInnerHTML={{__html:p.type}} />
                    </div>
                  </div>
                  <div style={{background:p.score>=90?'rgba(16,185,129,0.12)':'rgba(245,158,11,0.12)',border:'1px solid '+(p.score>=90?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'),color:p.score>=90?'#34d399':'#fbbf24'}} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold">
                    <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    {p.score}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.3)',display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 12px',borderRadius:'999px'}} className="mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span style={{color:'#93c5fd'}} className="text-xs font-bold">Para profesionales y equipos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Identidades IA<br />
                <span style={{color:'rgba(255,255,255,0.45)'}}>que se comportan igual siempre.</span>
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{color:'rgba(255,255,255,0.45)'}}>
                Define asistentes, brand voices y agentes con personalidad precisa. Anal&#xED;zalos con Lab, test&#xE9;alos con Forge y despli&#xE9;galos a cualquier modelo en segundos.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[['Asistentes especializados','rol, tono, l&#xED;mites y objetivos precisos'],['Brand Voices','voz de marca consistente en cualquier canal'],['Agentes t&#xE9;cnicos','patrones de respuesta y variables din&#xE1;micas'],['Equipos','profiles compartidos entre miembros']].map(([t,d])=>(
                  <div key={t} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}} className="p-3 rounded-xl">
                    <p className="text-white font-semibold text-xs mb-1" dangerouslySetInnerHTML={{__html:t}} />
                    <p style={{color:'rgba(255,255,255,0.35)'}} className="text-xs leading-relaxed" dangerouslySetInnerHTML={{__html:d}} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 fade-section" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest mb-3 uppercase" style={{color:'rgba(139,92,246,0.8)'}}>Planes</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple y directo.</h2>
          <p className="text-base mb-12" style={{color:'rgba(255,255,255,0.4)'}}>Empieza gratis. Escala cuando necesites.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {plan:'Free',price:'Gratis',sub:'Para empezar',features:['3 profiles','System Prompt + Texto plano','Sandbox libre'],highlight:false},
              {plan:'Pro',price:'9 &#x20AC;/mes',sub:'M&#xE1;s popular',features:['Profiles ilimitados','Keeper Lab (an&#xE1;lisis 4D)','Keeper Forge (simulaci&#xF3;n)','9 formatos de exportaci&#xF3;n','Campos avanzados (lore, relaciones)'],highlight:true},
              {plan:'Team',price:'20 &#x20AC;/mes',sub:'Para equipos',features:['Todo lo de Pro','Hasta 5 miembros','Profiles compartidos','Panel de administrador'],highlight:false},
            ].map((p)=>(
              <div key={p.plan} style={{background:p.highlight?'rgba(109,40,217,0.12)':'rgba(255,255,255,0.03)',border:'1px solid '+(p.highlight?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.08)'),boxShadow:p.highlight?'0 0 40px rgba(109,40,217,0.1)':undefined}} className="rounded-2xl p-6 text-left">
                <p style={{color:p.highlight?'#c4b5fd':'rgba(255,255,255,0.6)'}} className="text-xs font-bold mb-1">{p.plan}</p>
                <p className="text-2xl font-bold text-white mb-0.5" dangerouslySetInnerHTML={{__html:p.price}} />
                <p style={{color:'rgba(255,255,255,0.35)'}} className="text-xs mb-5" dangerouslySetInnerHTML={{__html:p.sub}} />
                <ul className="space-y-2">
                  {p.features.map((f,i)=>(
                    <li key={i} className="flex items-start gap-2 text-xs" style={{color:'rgba(255,255,255,0.55)'}}>
                      <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{color:p.highlight?'#a78bfa':'rgba(255,255,255,0.3)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      <span dangerouslySetInnerHTML={{__html:f}} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href="/pricing" style={{color:'rgba(139,92,246,0.8)'}} className="text-sm hover:text-violet-300 transition-colors">Ver comparativa completa &#x2192;</Link>
        </div>
      </section>

      <section className="py-28 px-6 fade-section" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block mb-10">
            <div style={{position:'absolute',inset:'-20px',background:'radial-gradient(circle,rgba(109,40,217,0.2),transparent 70%)',borderRadius:'50%',filter:'blur(20px)'}} />
            <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 0 40px rgba(109,40,217,0.5)',width:'72px',height:'72px',borderRadius:'20px',display:'flex',alignItems:'center',justifyContent:'center'}} className="relative mx-auto">
              <span className="text-white font-black text-2xl">K</span>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Crea tu primera<br />
            <span style={{background:'linear-gradient(135deg,#c4b5fd,#a78bfa,#7c3aed)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>identidad IA hoy.</span>
          </h2>
          <p className="text-lg mb-10 max-w-md mx-auto" style={{color:'rgba(255,255,255,0.4)'}}>
            En 2 minutos. Sin tarjeta. Gratis para siempre.
          </p>
          <Link href="/login" style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 32px rgba(109,40,217,0.4)',border:'1px solid rgba(139,92,246,0.4)'}} className="inline-flex items-center gap-3 px-10 py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90">
            Empezar gratis &#x2192;
          </Link>
          <p className="mt-5 text-xs" style={{color:'rgba(255,255,255,0.2)'}}>Free para siempre &#xB7; Pro desde 9 &#x20AC;/mes &#xB7; Cancela cuando quieras</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,0.05)'}} className="py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',width:'22px',height:'22px',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span style={{color:'rgba(255,255,255,0.4)'}} className="font-semibold text-sm">Keeper</span>
          </div>
          <p style={{color:'rgba(255,255,255,0.2)'}} className="text-xs">La memoria operativa de tu IA. &#xA9; 2025 Keeper.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" style={{color:'rgba(255,255,255,0.3)'}} className="hover:text-white/60 text-xs transition-colors">Precios</Link>
            <Link href="/privacy" style={{color:'rgba(255,255,255,0.3)'}} className="hover:text-white/60 text-xs transition-colors">Privacidad</Link>
            <Link href="/login" style={{color:'rgba(255,255,255,0.3)'}} className="hover:text-white/60 text-xs transition-colors">Acceder</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}