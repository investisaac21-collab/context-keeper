'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  return (
    <div className="min-h-screen text-white" style={{background:'#080808'}}>
      {/* Nav */}
      <nav style={{background:'rgba(8,8,8,0.85)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.06)'}} className="sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent)'}} />
        <Link href="/" className="flex items-center gap-2.5">
          <div style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 0 12px rgba(124,58,237,0.4)',width:'28px',height:'28px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <span className="font-semibold text-sm text-white">Keeper</span>
        </Link>
        <Link href="/login" style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)'}} className="text-sm font-semibold px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity">Empieza gratis</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div style={{border:'1px solid rgba(139,92,246,0.3)',background:'rgba(139,92,246,0.08)',color:'rgba(196,181,253,1)',display:'inline-flex',alignItems:'center',gap:'6px',padding:'4px 14px',borderRadius:'999px'}} className="text-xs font-bold mb-6">
            Planes simples. Sin sorpresas.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Elige tu plan</h1>
          <p style={{color:'rgba(255,255,255,0.4)'}} className="text-lg">Desde gratis hasta ilimitado. Cancela cuando quieras.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">

          {/* FREE */}
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}} className="rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p style={{color:'rgba(255,255,255,0.5)'}} className="text-xs font-bold mb-2 tracking-wide uppercase">Free</p>
              <p className="text-4xl font-black text-white mb-1">Gratis</p>
              <p style={{color:'rgba(255,255,255,0.35)'}} className="text-sm">Empieza a guardar tu memoria operativa</p>
            </div>
            <Link href="/login" style={{border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.6)'}} className="w-full py-2.5 rounded-xl text-sm font-semibold text-center hover:border-white/25 hover:text-white transition-colors mb-7">
              Empezar gratis
            </Link>
            <ul className="space-y-3 flex-1">
              {[
                ['Hasta 3 Keeper Profiles',''],
                ['System Prompt + Texto plano','2 formatos de exportaci&#xF3;n'],
                ['Sandbox libre','chatea con tus profiles'],
                ['Variables de contexto','din&#xE1;micas'],
                ['Importar / Exportar JSON',''],
                ['Plantillas predefinidas',''],
              ].map(([f,sub],i)=>(
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:'rgba(255,255,255,0.25)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  <div>
                    <span style={{color:'rgba(255,255,255,0.65)'}} className="text-sm" dangerouslySetInnerHTML={{__html:f}} />
                    {sub&&<p style={{color:'rgba(255,255,255,0.3)'}} className="text-xs mt-0.5" dangerouslySetInnerHTML={{__html:sub}} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* PRO */}
          <div style={{background:'rgba(109,40,217,0.1)',border:'1px solid rgba(139,92,246,0.4)',boxShadow:'0 0 60px rgba(109,40,217,0.1)'}} className="rounded-2xl p-7 flex flex-col relative">
            <div style={{position:'absolute',top:'-12px',left:'50%',transform:'translateX(-50%)',background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'white',fontSize:'11px',fontWeight:'bold',padding:'3px 14px',borderRadius:'999px'}}>MAS POPULAR</div>
            <div className="mb-6">
              <p style={{color:'#c4b5fd'}} className="text-xs font-bold mb-2 tracking-wide uppercase">Pro</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-4xl font-black text-white">9</p>
                <p style={{color:'rgba(255,255,255,0.5)'}} className="text-lg font-medium">&#x20AC;/mes</p>
              </div>
              <p style={{color:'rgba(255,255,255,0.35)'}} className="text-sm">Memoria completa, sin l&#xED;mites</p>
            </div>
            <Link href="/login" style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 20px rgba(109,40,217,0.35)'}} className="w-full py-3 rounded-xl text-sm font-bold text-white text-center hover:opacity-90 transition-opacity mb-7">
              Empezar con Pro
            </Link>
            <ul className="space-y-3 flex-1">
              {[
                ['Todo lo del plan Free',''],
                ['Profiles ilimitados','sin restricciones'],
                ['Keeper Lab','an&#xE1;lisis 4D: Claridad, Consistencia, Completitud, Efectividad'],
                ['Keeper Forge','simulaci&#xF3;n en 3 modos: Escenario, Estr&#xE9;s, Libre'],
                ['9 formatos de exportaci&#xF3;n','JSON, YAML, Markdown, Char Sheet, NPC Sheet, Brand Brief, Perfil T&#xE9;cnico'],
                ['Campos avanzados','base_memory, response_patterns, dynamic_variables, relationships'],
                ['Historial y versiones',''],
                ['Soporte prioritario',''],
                ['Acceso anticipado a novedades','Lab, Forge y pr&#xF3;ximas funciones'],
              ].map(([f,sub],i)=>(
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:'#a78bfa'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  <div>
                    <span style={{color:'rgba(255,255,255,0.8)'}} className="text-sm font-medium" dangerouslySetInnerHTML={{__html:f}} />
                    {sub&&<p style={{color:'rgba(255,255,255,0.35)'}} className="text-xs mt-0.5" dangerouslySetInnerHTML={{__html:sub}} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* TEAM */}
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}} className="rounded-2xl p-7 flex flex-col">
            <div style={{position:'absolute',top:'0',right:'0',background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',color:'#93c5fd',fontSize:'10px',fontWeight:'bold',padding:'2px 10px',borderRadius:'0 14px 0 8px'}} className="relative">EQUIPOS</div>
            <div className="mb-6">
              <p style={{color:'rgba(255,255,255,0.5)'}} className="text-xs font-bold mb-2 tracking-wide uppercase">Team</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-4xl font-black text-white">20</p>
                <p style={{color:'rgba(255,255,255,0.5)'}} className="text-lg font-medium">&#x20AC;/mes</p>
              </div>
              <p style={{color:'rgba(255,255,255,0.35)'}} className="text-sm">Memoria compartida para todo el equipo</p>
            </div>
            <Link href="/login" style={{border:'1px solid rgba(59,130,246,0.35)',color:'#93c5fd'}} className="w-full py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-blue-900/20 transition-colors mb-7">
              Empezar con Team
            </Link>
            <ul className="space-y-3 flex-1">
              {[
                ['Todo lo del plan Pro',''],
                ['Hasta 5 miembros',''],
                ['Profiles compartidos entre miembros',''],
                ['Panel de administrador',''],
                ['Facturaci&#xF3;n centralizada',''],
                ['Soporte dedicado',''],
              ].map(([f,sub],i)=>(
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:'#60a5fa'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  <div>
                    <span style={{color:'rgba(255,255,255,0.65)'}} className="text-sm" dangerouslySetInnerHTML={{__html:f}} />
                    {sub&&<p style={{color:'rgba(255,255,255,0.3)'}} className="text-xs mt-0.5" dangerouslySetInnerHTML={{__html:sub}} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* CTA Final */}
        <div style={{background:'rgba(109,40,217,0.06)',border:'1px solid rgba(139,92,246,0.2)'}} className="rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Empieza gratis hoy</h3>
          <p style={{color:'rgba(255,255,255,0.4)'}} className="text-sm mb-7">Sin tarjeta. Sin l&#xED;mite de tiempo. Actualiza cuando quieras.</p>
          <Link href="/login" style={{background:'linear-gradient(135deg,#7c3aed,#6d28d9)',boxShadow:'0 4px 24px rgba(109,40,217,0.3)'}} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity">
            Crear cuenta gratis &#x2192;
          </Link>
        </div>
      </div>
    </div>
  )
}