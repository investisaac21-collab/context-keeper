import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
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
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Precios</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Entrar</Link>
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Empezar gratis
          </Link>
        </div>
      </nav>
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          Nuevo: historial de versiones y rollback
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Tus prompts de IA,<br />
          <span className="text-indigo-600">listos en un clic</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Guarda tus mejores contextos para ChatGPT, Claude y Gemini. Rellena variables y copia al instante.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-200">
            Empezar gratis
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium px-6 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            Ver precios
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Gratis hasta 3 proyectos. Sin tarjeta de credito.</p>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Todo lo que necesitas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📋', title: 'Copia en un clic', desc: 'Guarda tu prompt una vez. Copia con un clic siempre que lo necesites, con las variables ya rellenas.' },
            { icon: '🔄', title: 'Variables dinamicas', desc: 'Usa variables en tus prompts. Rellena los valores y personaliza sin reescribir.' },
            { icon: '📚', title: 'Historial y rollback', desc: 'Cada edicion guarda una version. Vuelve a cualquier version anterior con un clic.' },
            { icon: '⚡', title: 'Variables globales', desc: 'Define variables como tu empresa una sola vez y se aplican en todos tus prompts.' },
            { icon: '📤', title: 'Exportar e importar', desc: 'Exporta todos tus prompts en JSON. Haz backup o comparte cuando quieras.' },
            { icon: '🏆', title: 'Plantillas listas', desc: 'Arranca con plantillas profesionales de marketing, codigo, ventas y mas.' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Planes simples y transparentes</h2>
          <p className="text-gray-500 mb-10">Empieza gratis. Escala cuando lo necesites.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { plan: 'Free', price: '0 €', desc: 'Para empezar', features: ['3 proyectos', 'Variables dinamicas', 'Exportar / Importar'], cta: 'Empezar gratis', href: '/login', highlight: false },
              { plan: 'Pro', price: '9 €', desc: 'Para profesionales', features: ['Proyectos ilimitados', 'Historial de versiones', 'Variables globales', 'Soporte prioritario'], cta: 'Hazte Pro', href: '/pricing', highlight: true },
              { plan: 'Team', price: '20 €', desc: 'Para equipos', features: ['Todo lo de Pro', 'Hasta 5 miembros', 'Prompts compartidos', 'Permisos por rol'], cta: 'Ver Team', href: '/pricing', highlight: false },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${p.highlight ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border-gray-200'}`}>
                <div className="mb-4">
                  <p className={`text-sm font-medium mb-1 ${p.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{p.plan}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    <span className={`text-sm ${p.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>/mes</span>
                  </div>
                  <p className={`text-sm mt-1 ${p.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>{p.desc}</p>
                </div>
                <ul className="flex flex-col gap-2 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className={`text-sm flex items-center gap-2 ${p.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <span className={`${p.highlight ? 'text-indigo-300' : 'text-indigo-500'}`}>&#10003;</span>
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
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Empieza hoy. Es gratis.</h2>
        <p className="text-gray-500 mb-8">Guarda tus mejores prompts y tenlos listos en segundos.</p>
        <Link href="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-200">
          Crear cuenta gratis
        </Link>
      </section>
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm font-semibold text-gray-700">Context Keeper</span>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-600">Precios</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">Entrar</Link>
          </div>
          <p className="text-sm text-gray-400">2026 Context Keeper.</p>
        </div>
      </footer>
    </div>
  )
}
