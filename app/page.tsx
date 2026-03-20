import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Context Keeper</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Precios</Link>
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Entrar</Link>
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          Nuevo: refinamiento de prompts con IA
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          Nunca vuelvas a reescribir<br />
          <span className="text-indigo-600">el mismo prompt</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Guarda, organiza y reutiliza tus mejores prompts para ChatGPT, Claude y Gemini.
          Variables dinámicas, IA integrada y un click para copiar.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-indigo-200">
            Empieza gratis &mdash; sin tarjeta
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium px-6 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-base">
            Ver precios
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Gratis hasta 3 proyectos &middot; Sin tarjeta de crédito</p>
      </section>

      {/* BENEFICIOS — orientados a resultado */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Para los que usan IA en serio</h2>
        <p className="text-center text-gray-400 mb-12 text-base">Convierte prompts sueltos en un sistema reutilizable</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ),
              title: 'Un prompt bien hecho, reutilizado infinito',
              desc: 'Escríbelo una vez. Tenlo listo para siempre. Sin buscar en chats, sin reescribir desde cero.'
            },
            {
              icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              ),
              title: 'Variables que se adaptan solas',
              desc: 'Cambia el nombre, el tono o el tema en segundos. El prompt se personaliza solo.'
            },
            {
              icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'De prompt a ChatGPT en un click',
              desc: 'Abre tu prompt directamente en ChatGPT sin copiar ni pegar. Listo para usar al instante.'
            },
            {
              icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: 'La IA mejora tu prompt por ti',
              desc: 'Díle “házlo más formal” o “añade más detalle” y el chat de refinamiento lo ajusta en segundos.'
            },
            {
              icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Historial y rollback sin miedo',
              desc: 'Cada edición guarda una versión. Vuelve a cualquier punto anterior con un click.'
            },
            {
              icon: (
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              title: 'Plantillas listas para empezar',
              desc: 'Marketing, código, ventas, educación. Arranca desde una plantilla y personaliza en segundos.'
            },
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm leading-snug">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple y transparente</h2>
          <p className="text-gray-400 mb-10">Empieza gratis. Escala cuando lo necesites.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                plan: 'Free', price: '0 €', period: '/mes', desc: 'Para empezar sin riesgo',
                features: ['3 proyectos', 'Variables dinámicas', 'Exportar / Importar', 'Plantillas predefinidas'],
                cta: 'Empezar gratis', href: '/login', highlight: false
              },
              {
                plan: 'Pro', price: '9 €', period: '/mes', desc: 'Para profesionales de IA',
                features: ['Proyectos ilimitados', 'Historial y rollback', 'Refinamiento con IA', 'Variables globales'],
                cta: 'Hazte Pro', href: '/pricing', highlight: true
              },
              {
                plan: 'Team', price: '20 €', period: '/mes', desc: 'Para equipos que usan IA juntos',
                features: ['Todo lo de Pro', 'Hasta 5 miembros', 'Prompts compartidos', 'Permisos por rol'],
                cta: 'Ver Team', href: '/pricing', highlight: false
              },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${p.highlight ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02]' : 'bg-white border-gray-200'}`}>
                <div className="mb-5">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${p.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{p.plan}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    <span className={`text-sm ${p.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{p.period}</span>
                  </div>
                  <p className={`text-sm ${p.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{p.desc}</p>
                </div>
                <ul className="flex flex-col gap-2 mb-6 text-left">
                  {p.features.map((f, j) => (
                    <li key={j} className={`text-sm flex items-center gap-2 ${p.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <svg className={`w-4 h-4 shrink-0 ${p.highlight ? 'text-indigo-300' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${p.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Tu biblioteca de prompts<br />te espera
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Gratis para siempre. Sin tarjeta. Sin fricción.<br />
          Solo tus prompts, organizados y listos.
        </p>
        <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-200">
          Crear cuenta gratis
        </Link>
        <p className="text-gray-300 text-sm mt-4">Más de 0 prompts guardados esta semana</p>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Context Keeper</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-600">Precios</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600">Términos</Link>
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600">Privacidad</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">Entrar</Link>
          </div>
          <p className="text-sm text-gray-300">&copy; 2026 Context Keeper</p>
        </div>
      </footer>
    </div>
  )
}
