import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Context Keeper</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 font-medium px-4 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-all text-base hidden sm:block">
            Precios
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-base"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-base"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-violet-100">
          <span className="w-2 h-2 bg-violet-500 rounded-full inline-block"></span>
          Para usuarios de ChatGPT, Claude y Gemini
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          No vuelvas a perder<br />
          <span className="text-violet-600">un prompt que ya te funcionaba</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Context Keeper guarda, organiza y reutiliza tus mejores prompts en segundos.
          Variables dinámicas para personalizar sin reescribir. Un click para copiar.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/auth/register"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-md hover:shadow-lg"
          >
            Empieza gratis &mdash; sin tarjeta
          </Link>
          <Link
            href="/pricing"
            className="text-gray-600 hover:text-gray-900 font-medium px-6 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-base"
          >
            Ver planes
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-5">Gratis para siempre en plan Free &middot; Pro desde 9 €/mes</p>
      </section>

      {/* BENEFICIOS — orientados a resultado */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Para los que usan IA en serio</h2>
        <p className="text-center text-gray-400 mb-12 text-base">
          Convierte tus prompts sueltos en un sistema reusable que trabaja para ti.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ),
              title: 'Nunca más pierdas un prompt que te funcionó',
              desc: 'Guárdalo una vez. Encuéntralo en segundos. Sin buscar en chats enterrados.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              ),
              title: 'Reutiliza contexto en segundos',
              desc: 'Cambia el nombre, el tono o el tema con variables dinámicas. El prompt se adapta solo.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'La IA genera y mejora tu prompt por ti',
              desc: 'Descríbele qué necesitas. Context Keeper crea el prompt listo para usar con IA integrada.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Historial y rollback sin miedo',
              desc: 'Cada edición guarda una versión. Vuelve a cualquier punto anterior con un click.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              ),
              title: 'Compatible con ChatGPT, Claude y Gemini',
              desc: 'Un sistema único para todos tus modelos. Organiza por herramienta, categoría o proyecto.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Copia y pega en un click',
              desc: 'Sin fricción. Sin formateos raros. Tu prompt, con las variables ya rellenadas, listo para usar.',
            },
          ].map((f, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/30 transition-all group">
              <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-base">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple y transparente</h2>
          <p className="text-gray-400 text-base">Empieza gratis. Escala cuando lo necesites.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { plan: 'Free', price: '0 €', period: '/mes', desc: 'Para empezar sin compromiso', features: ['Hasta 3 proyectos', 'Variables dinámicas', 'Importar / exportar JSON'], highlight: false, cta: 'Empezar gratis', href: '/auth/register' },
            { plan: 'Pro', price: '9 €', period: '/mes', desc: 'Para usuarios serios de IA', features: ['Proyectos ilimitados', 'Historial y rollback', 'Generación con IA', 'Variables globales'], highlight: true, cta: 'Hazte Pro', href: '/pricing' },
            { plan: 'Team', price: '20 €', period: '/mes', desc: 'Para equipos que trabajan con IA juntos', features: ['Todo lo de Pro', 'Hasta 5 miembros', 'Prompts compartidos', 'Panel de administrador'], highlight: false, cta: 'Ver Team', href: '/pricing' },
          ].map((p, i) => (
            <div key={i} className={`rounded-2xl p-6 border ${p.highlight ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-200' : 'bg-white border-gray-200'}`}>
              <div className="mb-4">
                <p className={`text-sm font-semibold mb-1 ${p.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{p.plan}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{p.period}</span>
                </div>
                <p className={`text-sm mt-1 ${p.highlight ? 'text-violet-100' : 'text-gray-500'}`}>{p.desc}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                    <svg className={`w-4 h-4 shrink-0 ${p.highlight ? 'text-violet-200' : 'text-violet-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${p.highlight ? 'bg-white text-violet-700 hover:bg-violet-50' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF / TRUST */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-gray-400">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Sin tarjeta de crédito
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Cancela cuando quieras
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Datos seguros y privados
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Actualizaciones constantes
          </span>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-violet-600 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Empieza hoy. Tus prompts te lo van a agradecer.
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            Gratis para siempre. Sin tarjeta. Sin fricción.<br />
            Solo tus prompts, organizados y listos para cualquier IA.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/auth/register"
              className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/pricing"
              className="text-violet-200 hover:text-white font-medium px-6 py-4 rounded-xl border border-violet-400 hover:border-violet-200 transition-colors text-base"
            >
              Ver planes Pro &rarr;
            </Link>
          </div>
          <p className="text-violet-300 text-sm mt-6">Pro desde 9 €/mes &middot; Team desde 20 €/mes</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 text-sm">Context Keeper</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/pricing" className="hover:text-gray-700 transition-colors">Precios</Link>
            <Link href="/auth/login" className="hover:text-gray-700 transition-colors">Iniciar sesión</Link>
            <Link href="/auth/register" className="hover:text-gray-700 transition-colors">Registrarse</Link>
          </div>
          <p className="text-xs text-gray-300">&copy; 2026 Context Keeper</p>
        </div>
      </footer>

    </div>
  )
}
